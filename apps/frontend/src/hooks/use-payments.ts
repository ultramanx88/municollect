import { paymentService } from '../lib/services';
import { useQuery, useMutation } from './use-api';
import { 
  PaymentRequest,
  PaymentHistoryRequest,
  PaymentStatusUpdate,
  PaymentResponse,
  PaymentHistoryResponse,
  Payment,
  ServiceType
} from '@/shared';

/**
 * Hook for fetching available payment services
 */
export function usePaymentServices(options?: { enabled?: boolean }) {
  return useQuery(
    () => paymentService.getPaymentServices(),
    {
      enabled: options?.enabled,
      onError: (error) => {
        console.error('Failed to fetch payment services:', error.message);
      }
    }
  );
}

/**
 * Hook for initiating a payment
 */
export function useInitiatePayment() {
  return useMutation(
    (data: PaymentRequest) => paymentService.initiatePayment(data),
    {
      onSuccess: (response: PaymentResponse) => {
        console.log('Payment initiated successfully:', response.id);
      },
      onError: (error) => {
        console.error('Failed to initiate payment:', error.message);
      }
    }
  );
}

/**
 * Hook for fetching payment history
 */
export function usePaymentHistory(
  filters?: PaymentHistoryRequest,
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  return useQuery(
    () => paymentService.getPaymentHistory(filters),
    {
      enabled: options?.enabled,
      refetchInterval: options?.refetchInterval,
      onError: (error) => {
        console.error('Failed to fetch payment history:', error.message);
      }
    }
  );
}

/**
 * Hook for fetching payment status
 */
export function usePaymentStatus(
  paymentId: string,
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  return useQuery(
    () => paymentService.getPaymentStatus(paymentId),
    {
      enabled: options?.enabled && !!paymentId,
      refetchInterval: options?.refetchInterval,
      onError: (error) => {
        console.error(`Failed to fetch payment status for ${paymentId}:`, error.message);
      }
    }
  );
}

/**
 * Hook for updating payment status (internal use)
 */
export function useUpdatePaymentStatus() {
  return useMutation(
    (data: PaymentStatusUpdate) => paymentService.updatePaymentStatus(data),
    {
      onSuccess: (payment: Payment) => {
        console.log('Payment status updated successfully:', payment.id);
      },
      onError: (error) => {
        console.error('Failed to update payment status:', error.message);
      }
    }
  );
}
