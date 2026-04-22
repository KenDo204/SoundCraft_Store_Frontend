import api from '@/lib/axios';
import type { ApiResponse } from '../types/product.type';
import type { 
  Coupon, 
  CreateCouponPayload, 
  ApplyCouponPreviewPayload, 
  ApplyCouponPreviewResponse, 
  CommitCouponUsagePayload 
} from '../types/coupon.type';

export const couponService = {
  // --- PUBLIC / USER ROUTES ---
  getAvailable: (): Promise<ApiResponse<Coupon[]>> => {
    return api.get('/coupons/available');
  },
  
  applyPreview: (payload: ApplyCouponPreviewPayload): Promise<ApiResponse<ApplyCouponPreviewResponse>> => {
    return api.post('/coupons/apply-preview', payload);
  },
  
  commitUsage: (payload: CommitCouponUsagePayload): Promise<ApiResponse<any>> => {
    return api.post('/coupons/checkout/commit', payload);
  },

  // --- ADMIN ROUTES ---
  getAllAdmin: (): Promise<ApiResponse<Coupon[]>> => {
    return api.get('/coupons/admin');
  },
  
  createAdmin: (payload: CreateCouponPayload): Promise<ApiResponse<Coupon>> => {
    return api.post('/coupons/admin', payload);
  },
  
  toggleActiveAdmin: (id: number): Promise<ApiResponse<Coupon>> => {
    return api.patch(`/coupons/admin/${id}/toggle-active`);
  }
};
