/**
 * Basic tests for API client functionality
 * Run with: npm test api-client.test.ts
 */

import { ApiClient, ApiError, NetworkError } from '../api-client';

// Mock fetch for testing
global.fetch = jest.fn();

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient('http://localhost:8080');
    (fetch as jest.Mock).mockClear();
  });

  describe('request method', () => {
    it('should make successful GET request', async () => {
      const mockResponse = {
        success: true,
        data: { id: '1', name: 'Test' },
        timestamp: Date.now()
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.get('/api/test');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        error: 'Not found',
        code: 404,
        timestamp: Date.now()
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => JSON.stringify(errorResponse)
      });

      await expect(apiClient.get('/api/nonexistent')).rejects.toThrow(ApiError);
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Network error'));

      await expect(apiClient.get('/api/test')).rejects.toThrow(NetworkError);
    });

    it('should add authentication headers when token is available', async () => {
      // Mock token manager
      const mockTokenManager = {
        getAccessToken: () => 'test-token',
        getRefreshToken: () => 'refresh-token',
        setTokens: jest.fn(),
        clearTokens: jest.fn(),
        isTokenExpired: () => false
      };

      const clientWithAuth = new ApiClient('http://localhost:8080', mockTokenManager);

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} })
      });

      await clientWithAuth.get('/api/protected');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/protected',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should handle path parameters', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} })
      });

      await apiClient.get('/api/users/:id', { id: '123' });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users/123',
        expect.any(Object)
      );
    });

    it('should make POST request with body', async () => {
      const requestBody = { name: 'Test User' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: '1', ...requestBody } })
      });

      await apiClient.post('/api/users', requestBody);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody)
        })
      );
    });
  });

  describe('token management', () => {
    it('should store and retrieve tokens', () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      apiClient.setTokens(accessToken, refreshToken, expiresAt);

      expect(apiClient.isAuthenticated()).toBe(true);
    });

    it('should clear tokens', () => {
      apiClient.setTokens('token', 'refresh', new Date());
      apiClient.clearTokens();

      expect(apiClient.isAuthenticated()).toBe(false);
    });
  });
});

// Mock localStorage for Node.js environment
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});
