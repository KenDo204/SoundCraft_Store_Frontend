export interface NotificationResponse {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'INFO' | 'ORDER' | 'PROMOTION' | 'SYSTEM' | 'PRE_ORDER';
  isRead: boolean;
  createdAt: string;
}
