import api from '@/lib/axios';
import type {
  ProductResponse,
  ProductPayload,
  ProductQueryParams,
  ApiResponse,
  PaginatedData
} from '@/types/product.type';

// Helper function để chuyển đổi Object thành FormData
const buildProductFormData = (payload: ProductPayload): FormData => {
  const formData = new FormData();

  // 1. Append các trường Text cơ bản
  formData.append('productName', payload.productName);
  formData.append('brandId', String(payload.brandId));
  if (payload.categoryId) formData.append('categoryId', String(payload.categoryId));

  if (payload.slug) formData.append('slug', payload.slug);
  if (payload.productDescription) formData.append('productDescription', payload.productDescription);
  if (payload.status) formData.append('status', payload.status);
  if (payload.originalPrice !== undefined) formData.append('originalPrice', String(payload.originalPrice));
  if (payload.price !== undefined) formData.append('price', String(payload.price));
  if (payload.stockQuantity !== undefined) formData.append('stockQuantity', String(payload.stockQuantity));
  if (payload.inPopular !== undefined) formData.append('inPopular', String(payload.inPopular));

  // 2. Append các mảng JSON (Ảnh giữ lại)
  if (payload.retainedImagesJson) {
    formData.append('retainedImagesJson', JSON.stringify(payload.retainedImagesJson));
  }

  // 3. Append File Ảnh
  if (payload.thumbnail) {
    formData.append('thumbnail', payload.thumbnail);
  }

  if (payload.gallery && payload.gallery.length > 0) {
    payload.gallery.forEach((file) => {
      formData.append('gallery', file);
    });
  }


  return formData;
};

export const productService = {
  // Lấy danh sách (Có phân trang, tìm kiếm)
  getProducts: async (params?: ProductQueryParams): Promise<ApiResponse<PaginatedData<ProductResponse>>> => {
    return api.get('/products', { params });
  },

  // Lấy sản phẩm mới nhất
  getNewArrivals: async (params?: any): Promise<ApiResponse<PaginatedData<ProductResponse>>> => {
    return api.get('/products/arrivals', { params });
  },

  // Lấy danh sách sản phẩm bán chạy
  getBestSellers: async (params?: any): Promise<ApiResponse<PaginatedData<ProductResponse>>> => {
    return api.get('/products/best-sellers', { params });
  },

  // Lấy danh sách sản phẩm theo danh mục cha
  getProductsByParentCategory: async (parentId: number, query?: any): Promise<ApiResponse<PaginatedData<ProductResponse>>> => {
    return api.get(`/products/category/parent/${parentId}`, { params: query });
  },

  // Lấy danh sách sản phẩm giảm giá
  getDiscountedProducts: async (params?: any): Promise<ApiResponse<PaginatedData<ProductResponse>>> => {
    return api.get('/products/discounted', { params });
  },

  // Lấy chi tiết 1 sản phẩm
  getProductById: async (id: number | string): Promise<ApiResponse<ProductResponse>> => {
    return api.get(`/products/${id}`);
  },

  // Tạo mới (Gửi FormData)
  createProduct: async (payload: ProductPayload): Promise<ApiResponse<ProductResponse>> => {
    const formData = buildProductFormData(payload);
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Cập nhật (Gửi FormData)
  updateProduct: async (id: number | string, payload: ProductPayload): Promise<ApiResponse<ProductResponse>> => {
    const formData = buildProductFormData(payload);
    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Xóa
  deleteProduct: async (id: number | string): Promise<ApiResponse<null>> => {
    return api.delete(`/products/${id}`);
  },
};