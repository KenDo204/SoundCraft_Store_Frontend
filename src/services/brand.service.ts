import api from '@/lib/axios';
import type { BrandResponse, BrandPayload, ApiResponse } from '@/types/brand.type';

const buildFormData = (payload: BrandPayload): FormData => {
  const formData = new FormData();
  
  if (payload.brand_code) formData.append('brand_code', payload.brand_code);
  if (payload.name) formData.append('name', payload.name);
  if (payload.description) formData.append('description', payload.description);
  
  if (payload.is_active !== undefined) {
    formData.append('is_active', String(payload.is_active));
  }
  
  if (payload.file) {
    formData.append('file', payload.file);
  }
  
  return formData;
};

export const brandService = {
  getAll: async (): Promise<ApiResponse<BrandResponse[]>> => {
    return api.get('/brands');
  },
  getById: async (id: number | string): Promise<ApiResponse<BrandResponse>> => {
    return api.get(`/brands/${id}`);
  },
  getBySlug: async (slug: string): Promise<ApiResponse<BrandResponse>> => {
    return api.get(`/brands/slug/${slug}`);
  },
  create: async (data: BrandPayload): Promise<ApiResponse<BrandResponse>> => {
    const formData = buildFormData(data);
    return api.post('/brands', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: async (id: number | string, data: BrandPayload): Promise<ApiResponse<BrandResponse>> => {
    const formData = buildFormData(data);
    return api.patch(`/brands/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  delete: async (id: number | string): Promise<ApiResponse<null>> => {
    return api.delete(`/brands/${id}`);
  },
};