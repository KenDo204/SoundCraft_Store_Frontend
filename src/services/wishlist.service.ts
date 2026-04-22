import api from '@/lib/axios';
import type { ProductResponse } from '../types/product.type';
import type { WishlistStatusResponse } from '../types/wishlist.type';

export interface MyWishlistResponse {
  items: ProductResponse[];
  meta: any;
}

export const wishlistService = {
  // Toggle wishlist (Thêm/Xóa)
  toggleWishlist: async (productId: number): Promise<WishlistStatusResponse> => {
    return api.post('/wishlists/toggle', { productId });
  },

  // Lấy danh sách yêu thích của tôi
  getMyWishlist: async (params?: any): Promise<MyWishlistResponse> => {
    return api.get('/wishlists/me', { params });
  },

  // Kiểm tra trạng thái yêu thích
  checkInWishlist: async (productId: number): Promise<WishlistStatusResponse> => {
    return api.get(`/wishlists/check/${productId}`);
  },

  // Xóa khỏi wishlist
  // delete returns standard or undefined, depending on backend. We can use any for now
  removeFromWishlist: async (productId: number): Promise<any> => {
    return api.delete(`/wishlists/${productId}`);
  },
};
