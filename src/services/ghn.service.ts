import api from '@/lib/axios';
import type { 
  Province, 
  District, 
  Ward, 
  ShippingFeePayload, 
  ShippingFeeResponse, 
  ApiResponse 
} from '@/types/ghn.type';

export const ghnService = {
  // Lấy danh sách Tỉnh/Thành phố
  getProvinces: async (): Promise<ApiResponse<Province[]>> => {
    return api.get('/ghn/provinces');
  },

  // Lấy danh sách Quận/Huyện dựa vào provinceId
  getDistricts: async (provinceId: number | string): Promise<ApiResponse<District[]>> => {
    return api.get(`/ghn/districts?provinceId=${provinceId}`);
  },

  // Lấy danh sách Phường/Xã dựa vào districtId
  getWards: async (districtId: number | string): Promise<ApiResponse<Ward[]>> => {
    return api.get(`/ghn/wards?districtId=${districtId}`);
  },

  // Gửi thông tin để lấy bảng giá phí ship
  calculateShippingFee: async (payload: ShippingFeePayload): Promise<ApiResponse<ShippingFeeResponse>> => {
    return api.post('/ghn/shipping-fee', payload);
  },
};