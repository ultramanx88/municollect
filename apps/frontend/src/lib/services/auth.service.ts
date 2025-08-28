import { apiClient } from '../api-client';
import { 
  API_ENDPOINTS,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  User
} from '@municollect/shared';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH_REGISTER, data);
    
    // Store tokens after successful registration
    if (response.accessToken && response.refreshToken) {
      apiClient.setTokens(response.accessToken, response.refreshToken, response.expiresAt);
    }
    
    return response;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH_LOGIN, data);
    
    // Store tokens after successful login
    if (response.accessToken && response.refreshToken) {
      apiClient.setTokens(response.accessToken, response.refreshToken, response.expiresAt);
    }
    
    return response;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const data: RefreshTokenRequest = { refreshToken };
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH_REFRESH, data);
    
    // Update stored tokens
    if (response.accessToken && response.refreshToken) {
      apiClient.setTokens(response.accessToken, response.refreshToken, response.expiresAt);
    }
    
    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.AUTH_LOGOUT);
    } catch (error) {
      // Even if the server request fails, we should clear local tokens
      console.warn('Logout request failed, but clearing local tokens:', error);
    } finally {
      // Always clear tokens on logout
      apiClient.clearTokens();
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Clear authentication tokens
   */
  clearTokens(): void {
    apiClient.clearTokens();
  }
}

// Export a default instance
export const authService = new AuthService();