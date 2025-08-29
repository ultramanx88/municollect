import { userService } from '../lib/services';
import { useQuery, useMutation } from './use-api';
import { 
  UpdateProfileRequest,
  UserProfileResponse,
  User,
  Municipality
} from '@/shared';

/**
 * Hook for fetching user profile
 */
export function useUserProfile(options?: { enabled?: boolean }) {
  return useQuery(
    () => userService.getProfile(),
    {
      enabled: options?.enabled,
      onError: (error) => {
        console.error('Failed to fetch user profile:', error.message);
      }
    }
  );
}

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  return useMutation(
    (data: UpdateProfileRequest) => userService.updateProfile(data),
    {
      onSuccess: (user: User) => {
        console.log('Profile updated successfully:', user.email);
      },
      onError: (error) => {
        console.error('Failed to update profile:', error.message);
      }
    }
  );
}

/**
 * Hook for fetching user municipalities
 */
export function useUserMunicipalities(options?: { enabled?: boolean }) {
  return useQuery(
    () => userService.getUserMunicipalities(),
    {
      enabled: options?.enabled,
      onError: (error) => {
        console.error('Failed to fetch user municipalities:', error.message);
      }
    }
  );
}
