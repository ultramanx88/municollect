// Re-export the auth context hook for backward compatibility
export { useAuth } from '../contexts/auth-context';

// Legacy hooks - these are now deprecated in favor of the useAuth context hook
// Keeping them for backward compatibility during migration

import { useCallback } from 'react';
import { authService } from '../lib/services';
import { useApiCallback, useMutation } from './use-api';
import { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse 
} from '@/shared';

/**
 * @deprecated Use useAuth() context hook instead
 * Hook for user registration
 */
export function useRegister() {
  return useMutation(
    (data: RegisterRequest) => authService.register(data),
    {
      onSuccess: (response: AuthResponse) => {
        console.log('Registration successful:', response.user.email);
      },
      onError: (error) => {
        console.error('Registration failed:', error.message);
      }
    }
  );
}

/**
 * @deprecated Use useAuth() context hook instead
 * Hook for user login
 */
export function useLogin() {
  return useMutation(
    (data: LoginRequest) => authService.login(data),
    {
      onSuccess: (response: AuthResponse) => {
        console.log('Login successful:', response.user.email);
      },
      onError: (error) => {
        console.error('Login failed:', error.message);
      }
    }
  );
}

/**
 * @deprecated Use useAuth() context hook instead
 * Hook for user logout
 */
export function useLogout() {
  return useMutation(
    () => authService.logout(),
    {
      onSuccess: () => {
        console.log('Logout successful');
        // You might want to redirect to login page here
        // or trigger a global state update
      },
      onError: (error) => {
        console.error('Logout failed:', error.message);
      }
    }
  );
}

/**
 * @deprecated Use useAuth() context hook instead
 * Hook for checking authentication status
 */
export function useAuthStatus() {
  const checkAuth = useCallback(() => {
    return Promise.resolve(authService.isAuthenticated());
  }, []);

  return useApiCallback(checkAuth);
}

/**
 * @deprecated Use useAuth() context hook instead
 * Hook for token refresh
 */
export function useRefreshToken() {
  return useMutation(
    (refreshToken: string) => authService.refreshToken(refreshToken),
    {
      onError: (error) => {
        console.error('Token refresh failed:', error.message);
        // Clear tokens on refresh failure
        authService.clearTokens();
      }
    }
  );
}
