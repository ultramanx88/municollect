import { municipalityService } from '../lib/services';
import { useQuery, useMutation } from './use-api';
import { 
  MunicipalityRequest,
  Municipality
} from '@municollect/shared';

/**
 * Hook for fetching all municipalities
 */
export function useMunicipalities(options?: { enabled?: boolean }) {
  return useQuery(
    () => municipalityService.getMunicipalities(),
    {
      enabled: options?.enabled,
      onError: (error) => {
        console.error('Failed to fetch municipalities:', error.message);
      }
    }
  );
}

/**
 * Hook for fetching a single municipality by ID
 */
export function useMunicipality(id: string, options?: { enabled?: boolean }) {
  return useQuery(
    () => municipalityService.getMunicipalityById(id),
    {
      enabled: options?.enabled && !!id,
      onError: (error) => {
        console.error(`Failed to fetch municipality ${id}:`, error.message);
      }
    }
  );
}

/**
 * Hook for creating a new municipality (admin only)
 */
export function useCreateMunicipality() {
  return useMutation(
    (data: MunicipalityRequest) => municipalityService.createMunicipality(data),
    {
      onSuccess: (municipality: Municipality) => {
        console.log('Municipality created successfully:', municipality.name);
      },
      onError: (error) => {
        console.error('Failed to create municipality:', error.message);
      }
    }
  );
}

/**
 * Hook for updating a municipality (admin only)
 */
export function useUpdateMunicipality() {
  return useMutation(
    ({ id, data }: { id: string; data: MunicipalityRequest }) => 
      municipalityService.updateMunicipality(id, data),
    {
      onSuccess: (municipality: Municipality) => {
        console.log('Municipality updated successfully:', municipality.name);
      },
      onError: (error) => {
        console.error('Failed to update municipality:', error.message);
      }
    }
  );
}