import api from '@/lib/axios';
import type { 
  CategoryResponse, 
  CategoryAdmin, 
  ApiResponse, 
  GetAdminCategoriesParams 
} from '@/types/category.type';

// Hàm tiện ích: Chuyển Object thành FormData
const createFormData = (payload: any): FormData => {
  const formData = new FormData();
  Object.keys(payload).forEach((key) => {
    if (payload[key] !== undefined && payload[key] !== null) {
      formData.append(key, payload[key]);
    }
  });
  return formData;
};

export const categoryService = {
  // --- PUBLIC APIs ---
  getTree: (): Promise<ApiResponse<CategoryResponse[]>> => {
    return api.get('/categories/tree');
  },

  getById: (id: string | number): Promise<ApiResponse<CategoryAdmin>> => {
    return api.get(`/categories/${id}`);
  },
  getBySlug: (slug: string): Promise<ApiResponse<CategoryResponse>> => {
    return api.get(`/categories/slug/${slug}`);
  },

  // --- ADMIN APIs ---
  getAllForAdmin: (params?: GetAdminCategoriesParams): Promise<ApiResponse<CategoryAdmin[]>> => {
    return api.get('/categories/admin', { params });
  },

  create: (payload: any): Promise<ApiResponse<CategoryAdmin>> => {
    const formData = createFormData(payload);
    return api.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  update: (id: string | number, payload: any): Promise<ApiResponse<CategoryAdmin>> => {
    const formData = payload instanceof FormData ? payload : createFormData(payload);
    return api.put(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  toggleStatus: (id: string | number): Promise<ApiResponse<CategoryAdmin>> => {
    return api.patch(`/categories/${id}/toggle`);
  },

  delete: (id: string | number): Promise<ApiResponse<void>> => {
    return api.delete(`/categories/${id}`);
  },
};