import { apiClient } from '../api-client';
import { 
  API_ENDPOINTS,
  NotificationRequest,
  NotificationResponse,
  NotificationListRequest,
  NotificationListResponse,
  MarkNotificationReadRequest,
  Notification
} from '@municollect/shared';

export class NotificationService {
  /**
   * Send a notification (admin/system use)
   */
  async sendNotification(data: NotificationRequest): Promise<Notification> {
    const response = await apiClient.post<NotificationResponse>(
      API_ENDPOINTS.NOTIFICATIONS_SEND,
      data
    );
    return response.notification;
  }

  /**
   * Get notification history for current user
   */
  async getNotificationHistory(filters?: Omit<NotificationListRequest, 'userId'>): Promise<NotificationListResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());
    }

    const endpoint = queryParams.toString() 
      ? `${API_ENDPOINTS.NOTIFICATIONS_HISTORY}?${queryParams.toString()}`
      : API_ENDPOINTS.NOTIFICATIONS_HISTORY;

    return apiClient.get<NotificationListResponse>(endpoint);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const data: MarkNotificationReadRequest = { notificationId };
    await apiClient.put(API_ENDPOINTS.NOTIFICATION_READ, data, { id: notificationId });
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    // Execute requests in parallel
    await Promise.all(
      notificationIds.map(id => this.markNotificationAsRead(id))
    );
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.getNotificationHistory({ limit: 1 });
    return response.unreadCount;
  }
}

// Export a default instance
export const notificationService = new NotificationService();