import axios from '@/lib/axios';

export enum UserActionType {
  VIEW_PRODUCT = 'VIEW_PRODUCT',
  ADD_TO_CART = 'ADD_TO_CART',
  PURCHASE = 'PURCHASE',
  ADD_TO_WISHLIST = 'ADD_TO_WISHLIST',
  SEARCH = 'SEARCH',
}

export interface TrackingItem {
  userId?: number;
  sessionId?: string;
  actionType: UserActionType;
  productId?: number;
  categoryId?: number;
  keyword?: string;
  contextData?: Record<string, any>;
}

export interface TrackingBatchPayload {
  behaviors: TrackingItem[];
}

class TrackingService {
  private queue: TrackingItem[] = [];
  private batchSize = 5;
  private flushInterval = 30000; // 30 seconds
  private intervalId: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.intervalId = setInterval(() => this.flush(), this.flushInterval);
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem('tracking_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('tracking_session_id', sessionId);
    }
    return sessionId;
  }

  track(item: Omit<TrackingItem, 'sessionId'>) {
    const fullItem: TrackingItem = {
      ...item,
      sessionId: this.getSessionId(),
    };
    this.queue.push(fullItem);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      await axios.post('/tracking/behaviors/batch', { behaviors: batch });
    } catch (error) {
      console.error('Failed to send tracking batch:', error);
      // Optional: re-add to queue or store in localStorage
    }
  }
}

export const trackingService = new TrackingService();
