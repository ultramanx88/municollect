import { notificationService } from '../lib/services';
import { useQuery, useMutation } from './use-api';
import { 
  NotificationRequest,
  NotificationListRequest,
  NotificationListResponse,
  Notification
} from '@/shared';

/**
 * Hook for fetching notification history
 */
export function useNotificationHistory(
  filters?: Omit<NotificationListRequest, 'userId'>,
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  return useQuery(
    () => notificationService.getNotificationHistory(filters),
    {
      enabled: options?.enabled,
      refetchInterval: options?.refetchInterval,
      onError: (error) => {
        console.error('Failed to fetch notification history:', error.message);
      }
    }
  );
}

/**
 * Hook for fetching unread notification count
 */
export function useUnreadNotificationCount(
  options?: { enabled?: boolean; refetchInterval?: number }
) {
  return useQuery(
    () => notificationService.getUnreadCount(),
    {
      enabled: options?.enabled,
      refetchInterval: options?.refetchInterval || 30000, // Default 30 seconds
      onError: (error) => {
        console.error('Failed to fetch unread notification count:', error.message);
      }
    }
  );
}

/**
 * Hook for sending notifications (admin/system use)
 */
export function useSendNotification() {
  return useMutation(
    (data: NotificationRequest) => notificationService.sendNotification(data),
    {
      onSuccess: (notification: Notification) => {
        console.log('Notification sent successfully:', notification.id);
      },
      onError: (error) => {
        console.error('Failed to send notification:', error.message);
      }
    }
  );
}

/**
 * Hook for marking a notification as read
 */
export function useMarkNotificationAsRead() {
  return useMutation(
    (notificationId: string) => notificationService.markNotificationAsRead(notificationId),
    {
      onSuccess: () => {
        console.log('Notification marked as read');
      },
      onError: (error) => {
        console.error('Failed to mark notification as read:', error.message);
      }
    }
  );
}

/**
 * Hook for marking multiple notifications as read
 */
export function useMarkMultipleAsRead() {
  return useMutation(
    (notificationIds: string[]) => notificationService.markMultipleAsRead(notificationIds),
    {
      onSuccess: () => {
        console.log('Multiple notifications marked as read');
      },
      onError: (error) => {
        console.error('Failed to mark multiple notifications as read:', error.message);
      }
    }
  );
}
