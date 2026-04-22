import api from '@/lib/axios';
import type { AddressResponse, AddressPayload, ApiResponse } from '@/types/address.type';

export const addressService = {
  // Lấy tất cả địa chỉ
  getMyAddresses: async (): Promise<ApiResponse<AddressResponse[]>> => {
    return api.get('/addresses');
  },

  // Lấy địa chỉ mặc định (có thể trả về null nếu user chưa có)
  getDefaultAddress: async (): Promise<ApiResponse<AddressResponse | null>> => {
    return api.get('/addresses/default');
  },

  // Lấy chi tiết 1 địa chỉ
  getAddressById: async (id: number | string): Promise<ApiResponse<AddressResponse>> => {
    return api.get(`/addresses/${id}`);
  },

  // Tạo mới địa chỉ
  createAddress: async (payload: AddressPayload): Promise<ApiResponse<AddressResponse>> => {
    return api.post('/addresses', payload);
  },

  // Cập nhật địa chỉ
  updateAddress: async (id: number | string, payload: AddressPayload): Promise<ApiResponse<AddressResponse>> => {
    return api.put(`/addresses/${id}`, payload);
  },

  // Đặt làm mặc định
  setDefaultAddress: async (id: number | string): Promise<ApiResponse<AddressResponse>> => {
    return api.patch(`/addresses/${id}/set-default`);
  },

  // Xóa địa chỉ
  deleteAddress: async (id: number | string): Promise<ApiResponse<null>> => {
    return api.delete(`/addresses/${id}`);
  },
};