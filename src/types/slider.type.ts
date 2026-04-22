// Định nghĩa kiểu trả về dùng chung (Dựa trên ApiResponse chung của bạn)
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Kiểu dữ liệu Slider (Gộp chung Public và Admin, các trường của Admin cho thành optional)
export interface SliderResponse {
  slider_id: number;
  title: string;
  sub_title: string;
  target_url: string;
  image_url: string;
  brand: any; // Chứa thông tin brand (logo, name...)
  
  // Các trường chỉ có khi gọi API Admin
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Payload dùng để Create và Update
export interface SliderPayload {
  title?: string;
  sub_title?: string;
  target_url?: string;
  brand_id?: number | string;
  is_active?: boolean | string | number;
  file?: File | null;
}