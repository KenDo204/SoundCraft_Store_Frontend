import api from '@/lib/axios';
import type { ApiResponse } from '../types/product.type';
import type { 
  CartResponse, 
  UpsertCartItemPayload, 
  UpdateCartItemQuantityPayload, 
  UpdateCartItemNotePayload,
  BulkDeleteCartItemsPayload,
} from '../types/cart.type';

export const cartService = {
  getCart: (): Promise<ApiResponse<CartResponse>> => {
    return api.get('/carts');
  },
  
  upsertCartItem: (payload: UpsertCartItemPayload): Promise<ApiResponse<CartResponse | any>> => {
    return api.post('/carts/items', payload);
  },

  updateQuantity: (itemId: number, payload: UpdateCartItemQuantityPayload): Promise<ApiResponse<CartResponse>> => {
    return api.put(`/carts/items/${itemId}/quantity`, payload);
  },

  // updateVariant: (itemId: number, payload: UpdateCartItemVariantPayload): Promise<ApiResponse<CartResponse>> => {
  //   return api.put(`/carts/items/${itemId}/variant`, payload);
  // },

  updateNote: (itemId: number, payload: UpdateCartItemNotePayload): Promise<ApiResponse<CartResponse>> => {
    return api.put(`/carts/items/${itemId}/note`, payload);
  },

  deleteItem: (itemId: number): Promise<ApiResponse<any>> => {
    return api.delete(`/carts/items/${itemId}`);
  },

  bulkDelete: (payload: BulkDeleteCartItemsPayload): Promise<ApiResponse<any>> => {
    // Với method DELETE, truyền payload trong config { data: payload }
    return api.delete('/carts/items/bulk-delete', { data: payload });
  },

  clearCart: (): Promise<ApiResponse<any>> => {
    return api.delete('/carts/clear');
  }
};
