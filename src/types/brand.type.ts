export interface BrandResponse {
  brand_id: number;
  brand_code: string;
  name: string;
  slug: string;
  description: string;
  brand_image: string;
  is_active: boolean;
}

// Dữ liệu gửi lên BE để tạo/cập nhật (khớp với CreateBrandDto / UpdateBrandDto)
export interface BrandPayload {
  brand_code?: string;
  name?: string;
  description?: string;
  is_active?: boolean | string | number;
  file?: File | null; // File ảnh từ thẻ <input type="file" />
}

// Kiểu trả về chung của API (tùy thuộc vào Interceptor của bạn có bọc nó hay không)
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}