import { apiClient } from '../api-client';
import { 
  API_ENDPOINTS,
  PaymentRequest,
  PaymentResponse,
  PaymentHistoryRequest,
  PaymentHistoryResponse,
  PaymentStatusUpdate,
  Payment,
  ServiceType
} from '@municollect/shared';

export class PaymentService {
  /**
   * Get available payment services for a municipality
   */
  async getPaymentServices(): Promise<ServiceType[]> {
    return apiClient.get<ServiceType[]>(API_ENDPOINTS.PAYMENTS_SERVICES);
  }

  /**
   * Initiate a new payment
   */
  async initiatePayment(data: PaymentRequest): Promise<PaymentResponse> {
    return apiClient.post<PaymentResponse>(API_ENDPOINTS.PAYMENTS_INITIATE, data);
  }

  /**
   * Get payment history with optional filters
   */
  async getPaymentHistory(filters?: PaymentHistoryRequest): Promise<PaymentHistoryResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.municipalityId) queryParams.append('municipalityId', filters.municipalityId);
      if (filters.serviceType) queryParams.append('serviceType', filters.serviceType);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());
    }

    const endpoint = queryParams.toString() 
      ? `${API_ENDPOINTS.PAYMENTS_HISTORY}?${queryParams.toString()}`
      : API_ENDPOINTS.PAYMENTS_HISTORY;

    return apiClient.get<PaymentHistoryResponse>(endpoint);
  }

  /**
   * Get payment status by ID
   */
  async getPaymentStatus(paymentId: string): Promise<Payment> {
    return apiClient.get<Payment>(API_ENDPOINTS.PAYMENT_STATUS, { id: paymentId });
  }

  /**
   * Update payment status (internal use)
   */
  async updatePaymentStatus(data: PaymentStatusUpdate): Promise<Payment> {
    return apiClient.put<Payment>(
      API_ENDPOINTS.PAYMENT_STATUS,
      data,
      { id: data.paymentId }
    );
  }
}

// Export a default instance
export const paymentService = new PaymentService();