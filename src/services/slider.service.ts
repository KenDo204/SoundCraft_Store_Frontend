import api from '@/lib/axios';
import type { SliderResponse, SliderPayload, ApiResponse } from '@/types/slider.type';

// Hàm đóng gói FormData để gửi file ảnh và text
const buildFormData = (payload: SliderPayload): FormData => {
  const formData = new FormData();
  
  if (payload.title) formData.append('title', payload.title);
  if (payload.sub_title) formData.append('sub_title', payload.sub_title);
  if (payload.target_url) formData.append('target_url', payload.target_url);
  
  // Gửi brand_id dưới dạng string
  if (payload.brand_id) formData.append('brand_id', String(payload.brand_id));
  
  if (payload.is_active !== undefined) {
    formData.append('is_active', String(payload.is_active));
  }
  
  if (payload.file) {
    formData.append('file', payload.file);
  }
  
  return formData;
};

export const sliderService = {
  // ==========================================
  // PUBLIC APIs
  // ==========================================
  getActiveSliders: async (): Promise<ApiResponse<SliderResponse[]>> => {
    return api.get('/sliders/active');
  },

  // ==========================================
  // ADMIN APIs
  // ==========================================
  getAllAdminSliders: async (): Promise<ApiResponse<SliderResponse[]>> => {
    return api.get('/sliders/admin');
  },

  getById: async (id: number | string): Promise<ApiResponse<SliderResponse>> => {
    return api.get(`/sliders/${id}`);
  },

  create: async (data: SliderPayload): Promise<ApiResponse<SliderResponse>> => {
    const formData = buildFormData(data);
    return api.post('/sliders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Chú ý: BE dùng @Put() cho update
  update: async (id: number | string, data: SliderPayload): Promise<ApiResponse<SliderResponse>> => {
    const formData = buildFormData(data);
    return api.put(`/sliders/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // API riêng biệt để bật/tắt nhanh
  toggleStatus: async (id: number | string): Promise<ApiResponse<SliderResponse>> => {
    return api.patch(`/sliders/${id}/toggle`);
  },

  delete: async (id: number | string): Promise<ApiResponse<null>> => {
    return api.delete(`/sliders/${id}`);
  },
};