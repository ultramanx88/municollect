import { apiClient } from '../api-client';
import { 
  API_ENDPOINTS,
  MunicipalityRequest,
  MunicipalityResponse,
  MunicipalityListResponse,
  Municipality
} from '@/shared';

export class MunicipalityService {
  /**
   * Get all municipalities
   */
  async getMunicipalities(): Promise<MunicipalityListResponse> {
    return apiClient.get<MunicipalityListResponse>(API_ENDPOINTS.MUNICIPALITIES);
  }

  /**
   * Get municipality by ID
   */
  async getMunicipalityById(id: string): Promise<Municipality> {
    const response = await apiClient.get<MunicipalityResponse>(
      API_ENDPOINTS.MUNICIPALITY_BY_ID,
      { id }
    );
    return response.municipality;
  }

  /**
   * Create new municipality (admin only)
   */
  async createMunicipality(data: MunicipalityRequest): Promise<Municipality> {
    const response = await apiClient.post<MunicipalityResponse>(
      API_ENDPOINTS.MUNICIPALITIES,
      data
    );
    return response.municipality;
  }

  /**
   * Update municipality (admin only)
   */
  async updateMunicipality(id: string, data: MunicipalityRequest): Promise<Municipality> {
    const response = await apiClient.put<MunicipalityResponse>(
      API_ENDPOINTS.MUNICIPALITY_BY_ID,
      data,
      { id }
    );
    return response.municipality;
  }
}

// Export a default instance
export const municipalityService = new MunicipalityService();
