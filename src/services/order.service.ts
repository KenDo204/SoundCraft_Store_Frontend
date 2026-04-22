import api from '@/lib/axios';
import type { ApiResponse } from '@/types/product.type';
import type { OrderResponse, CheckoutPayload } from '@/types/order.type';

export const orderService = {
  // 1. Checkout
  checkout: async (payload: CheckoutPayload): Promise<ApiResponse<OrderResponse>> => {
    return api.post('/orders/checkout', payload);
  },

  // 2. Lấy đơn hàng của bản thân
  getMyOrders: async (): Promise<ApiResponse<OrderResponse[]>> => {
    return api.get('/orders/me');
  },

  // 3. Hủy đơn hàng
  cancelOrder: async (orderId: number, reason: string): Promise<ApiResponse<any>> => {
    return api.post(`/orders/${orderId}/cancel`, { reason });
  },

  // 4. Lọc / Phân trang danh sách đơn hàng cho Admin
  getAdminOrders: async (): Promise<ApiResponse<OrderResponse[]>> => {
    return api.get('/orders/admin');
  },

  // 5. Cập nhật trạng thái giao hàng
  updateOrderStatus: async (orderId: number, status: string): Promise<ApiResponse<OrderResponse>> => {
    return api.post(`/orders/admin/${orderId}/status`, { status });
  },

  // 6. Admin cập nhật lại giỏ hàng trong trường hợp khách gọi điện thoại
  updateOrderItems: async (orderId: number, items: { productId: number; quantity: number }[]): Promise<ApiResponse<OrderResponse>> => {
    return api.post(`/orders/admin/${orderId}/items`, { items });
  }
};
