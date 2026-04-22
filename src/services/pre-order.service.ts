import api from '@/lib/axios';
import type { ApiResponse } from '@/types/product.type';
import type { PreOrderPayload, PreOrderResponse } from '@/types/pre-order.type';

export const preOrderService = {
  createPreOrder: async (payload: PreOrderPayload): Promise<ApiResponse<PreOrderResponse>> => {
    return api.post('/pre-orders', payload);
  },
};
