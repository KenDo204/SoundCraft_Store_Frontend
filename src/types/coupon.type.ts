export const DiscountType = {
  PERCENTAGE: 'PERCENT',
  FIXED_AMOUNT: 'FIXED',
} as const;

// Type union được suy ra tự động từ object trên
export type DiscountType = typeof DiscountType[keyof typeof DiscountType];

export interface Coupon {
  coupon_id: number;
  code: string;
  discount_type: string;
  discount_value: string | number;
  min_order_amount: string | number;
  max_discount_amount: string | number | null;
  max_usage: number;
  max_usage_per_user: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  // Thêm nếu BE trả về
  used_count?: number;
}

export interface CreateCouponPayload {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  maxUsage: number;
  maxUsagePerUser?: number;
  startDate: string;
  endDate: string;
}

export interface ApplyCouponPreviewPayload {
  totalCartAmount: number;
  couponCode: string;
}

export interface ApplyCouponPreviewResponse {
  discountAmount: number;
  finalTotal: number;
  couponCode: string;
  // Các field này có thể được trả về từ BE
}

export interface CommitCouponUsagePayload {
  orderId: number;
  couponCodes: string[];
}

export interface CouponState {
  availableCoupons: Coupon[];
  allCoupons: Coupon[]; // Danh sách cho Admin
  previewResult: ApplyCouponPreviewResponse | null;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
}
