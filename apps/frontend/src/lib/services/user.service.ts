import { apiClient } from '../api-client';
import { 
  API_ENDPOINTS,
  UpdateProfileRequest,
  UserProfileResponse,
  User,
  Municipality
} from '@/shared';

export class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfileResponse> {
    return apiClient.get<UserProfileResponse>(API_ENDPOINTS.USERS_PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiClient.put<User>(API_ENDPOINTS.USERS_PROFILE, data);
  }

  /**
   * Get user's associated municipalities
   */
  async getUserMunicipalities(): Promise<Municipality[]> {
    return apiClient.get<Municipality[]>(API_ENDPOINTS.USERS_MUNICIPALITIES);
  }
}

// Export a default instance
export const userService = new UserService();
