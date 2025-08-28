import { apiClient } from '../api-client';
import { 
  API_ENDPOINTS,
  QRCodeRequest,
  QRCodeResponse,
  QRCodeValidationRequest,
  QRCodeValidationResponse
} from '@municollect/shared';

export class QRService {
  /**
   * Generate QR code for a payment
   */
  async generateQRCode(data: QRCodeRequest): Promise<QRCodeResponse> {
    return apiClient.post<QRCodeResponse>(API_ENDPOINTS.QR_GENERATE, data);
  }

  /**
   * Get QR code details by code
   */
  async getQRCodeDetails(code: string): Promise<QRCodeValidationResponse> {
    return apiClient.get<QRCodeValidationResponse>(
      API_ENDPOINTS.QR_DETAILS,
      { code }
    );
  }

  /**
   * Validate QR code
   */
  async validateQRCode(data: QRCodeValidationRequest): Promise<QRCodeValidationResponse> {
    return this.getQRCodeDetails(data.code);
  }
}

// Export a default instance
export const qrService = new QRService();