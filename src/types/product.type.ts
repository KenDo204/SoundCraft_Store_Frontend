
import type { CategoryResponse } from './category.type';

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  limit?: number;
}

export const ProductStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export interface ProductImage {
  imageId: number;
  imageUrl: string;
  isThumbnail: boolean;
}

export interface Brand {
  id: number;
  name: string;
  code: string;
  slug?: string;
  description?: string;
  image_url?: string;
}

export interface ProductResponse {
  productId: number;
  productName: string;
  slug: string;
  productDescription: string;
  inPopular: boolean;
  isStock: boolean;
  status: ProductStatus;
  originalPrice: number;
  price: number;
  stockQuantity: number;
  maxOrderQuantity: number;
  brand?: Brand;
  category?: CategoryResponse;
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// DỮ LIỆU GỬI ĐI (PAYLOAD INTERFACES)
// ==========================================

// Payload dạng Object để Component sử dụng (Sau đó sẽ được chuyển thành FormData ở Service)

export interface ProductPayload {
  productName: string;
  slug?: string;
  productDescription?: string;
  status?: ProductStatus;
  originalPrice?: number;
  price?: number;
  stockQuantity?: number;
  brandId: number;
  categoryId?: number;
  inPopular?: boolean;

  // Các mảng dữ liệu (Sẽ được stringify thành JSON khi gửi qua form-data)
  retainedImagesJson?: number[]; // Mảng ID ảnh muốn giữ lại khi Edit

  // File ảnh
  thumbnail?: File | null;
  gallery?: File[];
}

// Tham số để filter danh sách
export interface ProductQueryParams {
  keyword?: string;
  page?: number;
  limit?: number;
  isPopular?: boolean | string;
  brandId?: number;
  categoryId?: number;
  slug?: string;
  priceMin?: number | string;
  priceMax?: number | string;
  inStock?: boolean | string;
  color?: string;
  tags?: string;
}