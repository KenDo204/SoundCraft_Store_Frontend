import type { ProductResponse } from "./product.type";

export interface WishlistStatusResponse {
  message: string;
  isInWishlist: boolean;
  productId: number;
}

export interface WishlistItem {
  wishlist_id: number;
  created_at: string;
  updated_at: string;
  product: ProductResponse;
}

export interface WishlistState {
  items: ProductResponse[];
  isLoading: boolean;
  error: string | null;
}
