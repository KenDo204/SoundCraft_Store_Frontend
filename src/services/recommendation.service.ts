import api from '@/lib/axios';
import type { ApiResponse } from '@/types/product.type';
import type { ProductResponse } from '@/types/product.type';

export const recommendationService = {
  getForYou: async (userId: number): Promise<ApiResponse<ProductResponse[]>> => {
    return api.get(`/recommendations/users/${userId}/for-you`);
  },
  getSimilar: async (productId: number): Promise<ApiResponse<ProductResponse[]>> => {
    return api.get(`/recommendations/products/${productId}/similar`);
  },
};
