import api from '@/lib/axios';
import type { ApiResponse, PaginatedData } from '@/types/product.type';
import type { NotificationResponse } from '@/types/notification.type';

export const notificationService = {
  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    return api.get('/notifications/unread-count');
  },
  getNotifications: async (page: number = 0, size: number = 10): Promise<ApiResponse<PaginatedData<NotificationResponse>>> => {
    return api.get('/notifications', { params: { page, size } });
  },
  markAsRead: async (id: number): Promise<ApiResponse<void>> => {
    return api.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    return api.put('/notifications/read-all');
  },
};
