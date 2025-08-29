import { API_ENDPOINTS, HTTP_STATUS, ERROR_CODES } from '@/shared';

// Custom error classes
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public field?: string, public value?: any) {
    super(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, message);
    this.name = 'ValidationError';
  }
}

// Request configuration interface
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Response wrapper interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    error: string;
    code: number;
    timestamp: number;
    details?: Record<string, any>;
  };
  timestamp: number;
}

// Token management interface
export interface TokenManager {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(accessToken: string, refreshToken: string, expiresAt: Date): void;
  clearTokens(): void;
  isTokenExpired(): boolean;
}

// Default token manager using localStorage
class LocalStorageTokenManager implements TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'municollect_access_token';
  private readonly REFRESH_TOKEN_KEY = 'municollect_refresh_token';
  private readonly EXPIRES_AT_KEY = 'municollect_token_expires_at';

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string, expiresAt: Date): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toISOString());
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    if (!expiresAt) return true;
    return new Date(expiresAt) <= new Date();
  }
}

// Main API client class
export class ApiClient {
  private baseUrl: string;
  private tokenManager: TokenManager;
  private refreshPromise: Promise<void> | null = null;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    tokenManager?: TokenManager
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.tokenManager = tokenManager || new LocalStorageTokenManager();
  }

  // Helper method to build full URL
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    let url = endpoint;
    
    // Replace path parameters (e.g., :id)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, encodeURIComponent(value));
      });
    }
    
    return `${this.baseUrl}${url}`;
  }

  // Helper method to handle token refresh
  private async refreshTokenIfNeeded(): Promise<void> {
    if (!this.tokenManager.isTokenExpired()) {
      return;
    }

    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) {
      this.tokenManager.clearTokens();
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR,
        'No refresh token available'
      );
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);
    
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<void> {
    try {
      const response = await fetch(this.buildUrl(API_ENDPOINTS.AUTH_REFRESH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const result: ApiResponse<{ accessToken: string; refreshToken: string; expiresAt: string }> = 
        await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid refresh response');
      }

      this.tokenManager.setTokens(
        result.data.accessToken,
        result.data.refreshToken,
        new Date(result.data.expiresAt)
      );
    } catch (error) {
      this.tokenManager.clearTokens();
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR,
        'Token refresh failed'
      );
    }
  }

  // Helper method to add authentication headers
  private getAuthHeaders(): Record<string, string> {
    const token = this.tokenManager.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Helper method to handle retries
  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors or client errors
        if (error instanceof ApiError && error.status < 500) {
          throw error;
        }

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError!;
  }

  // Main request method
  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {},
    pathParams?: Record<string, string>
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 30000,
      retries = 3,
      retryDelay = 1000,
    } = config;

    // Refresh token if needed (except for auth endpoints)
    if (!endpoint.includes('/auth/')) {
      await this.refreshTokenIfNeeded();
    }

    const url = this.buildUrl(endpoint, pathParams);
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...headers,
    };

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    if (body && method !== 'GET') {
      requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    return this.withRetry(async () => {
      try {
        const response = await fetch(url, requestConfig);
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }

          throw new ApiError(
            response.status,
            errorData.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
            errorData.error || `HTTP ${response.status}`,
            errorData.details
          );
        }

        const result: ApiResponse<T> = await response.json();
        
        if (!result.success) {
          throw new ApiError(
            result.error?.code || HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_SERVER_ERROR,
            result.error?.error || 'Request failed',
            result.error?.details
          );
        }

        return result.data as T;
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new NetworkError('Request timeout');
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new NetworkError('Network connection failed');
        }
        
        throw new NetworkError(error instanceof Error ? error.message : 'Unknown error');
      }
    }, retries, retryDelay);
  }

  // Convenience methods
  async get<T = any>(endpoint: string, pathParams?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, pathParams);
  }

  async post<T = any>(endpoint: string, body?: any, pathParams?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body }, pathParams);
  }

  async put<T = any>(endpoint: string, body?: any, pathParams?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body }, pathParams);
  }

  async delete<T = any>(endpoint: string, pathParams?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, pathParams);
  }

  async patch<T = any>(endpoint: string, body?: any, pathParams?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body }, pathParams);
  }

  // Token management methods
  setTokens(accessToken: string, refreshToken: string, expiresAt: Date): void {
    this.tokenManager.setTokens(accessToken, refreshToken, expiresAt);
  }

  clearTokens(): void {
    this.tokenManager.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.tokenManager.getAccessToken() && !this.tokenManager.isTokenExpired();
  }
}

// Export a default instance
export const apiClient = new ApiClient();
