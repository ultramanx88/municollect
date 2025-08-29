import { qrService } from '../lib/services';
import { useMutation, useQuery } from './use-api';
import { 
  QRCodeRequest,
  QRCodeValidationRequest,
  QRCodeResponse,
  QRCodeValidationResponse
} from '@/shared';

/**
 * Hook for generating QR codes
 */
export function useGenerateQRCode() {
  return useMutation(
    (data: QRCodeRequest) => qrService.generateQRCode(data),
    {
      onSuccess: (response: QRCodeResponse) => {
        console.log('QR code generated successfully:', response.qrCode);
      },
      onError: (error) => {
        console.error('Failed to generate QR code:', error.message);
      }
    }
  );
}

/**
 * Hook for fetching QR code details
 */
export function useQRCodeDetails(
  code: string,
  options?: { enabled?: boolean }
) {
  return useQuery(
    () => qrService.getQRCodeDetails(code),
    {
      enabled: options?.enabled && !!code,
      onError: (error) => {
        console.error(`Failed to fetch QR code details for ${code}:`, error.message);
      }
    }
  );
}

/**
 * Hook for validating QR codes
 */
export function useValidateQRCode() {
  return useMutation(
    (data: QRCodeValidationRequest) => qrService.validateQRCode(data),
    {
      onSuccess: (response: QRCodeValidationResponse) => {
        if (response.valid) {
          console.log('QR code is valid:', response.data);
        } else {
          console.log('QR code is invalid or expired');
        }
      },
      onError: (error) => {
        console.error('Failed to validate QR code:', error.message);
      }
    }
  );
}
