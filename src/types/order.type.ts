export interface AddressResponse {
  city?: string;
  district?: string;
  ward?: string;
  fullAddress: string;
}

export interface OrderDetailResponse {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  isReviewed?: boolean;
}

export interface OrderResponse {
    id: number;
    note: string;
    orderDate: string; // ISO DateTime
    status: 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED' | 'CONFIRMED';
    totalMoney: number;
    shippingMethod: string;
    trackingNumber: string;
    paymentMethod: 'COD' | 'VNPAY';
    paymentUrl?: string; // Tồn tại khi Order VNPAY thành công
    active: boolean; // Trạng thái bị Soft Delete hay ko
    userId: number; // ID người mua
    address: AddressResponse;
    orderDetails: OrderDetailResponse[]; // Mảng danh sách sản phẩm đã mua
}

export interface SelectedItemPayload {
  id: number;
  productId: number;
  quantity: number;
  size?: string;
  totalMoney?: number;
  note?: string;
}

export interface CheckoutPayload {
  selectedItems: SelectedItemPayload[];
  addressId: number;
  paymentMethod: 'COD' | 'VNPAY';
  couponCode?: string;
  orderNote?: string;
  totalAmount?: number;
  shippingFee?: number;
  discountAmount?: number;
}
