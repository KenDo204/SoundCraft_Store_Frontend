export interface NotificationResponse {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: 'INFO' | 'ORDER' | 'PROMOTION' | 'SYSTEM' | 'PRE_ORDER';
  is_read: boolean;
  created_at: string;
}
