export interface UpsertCartItemPayload {
  productId: number;
  quantity: number;
  note?: string;
}

export interface UpdateCartItemQuantityPayload {
  quantity: number;
}

export interface UpdateCartItemNotePayload {
  note: string;
}

export interface BulkDeleteCartItemsPayload {
  cartItemIds: number[];
}

export interface CartItemResponse {
  cart_item_id: number;
  quantity: number;
  imageUrl?: string;
  total_money: number;
  isAvailable: boolean;
  disableReason?: string;
  currentPrice: number;
  maxAllowedQuantity: number;
  note?: string;
  product?: any;
  [key: string]: any;
}

export interface CartResponse {
  cart_id: number;
  items: CartItemResponse[];
  totalCartMoney: number;
}

export interface CartState {
  cart: CartResponse | null;
  isLoading: boolean;
  isActionLoading: boolean; // Dành riêng cho các hành động thêm/sửa/xóa để không tải lại nguyên trang
  error: string | null;
}
