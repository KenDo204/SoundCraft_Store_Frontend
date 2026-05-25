// ==========================================
// INTERFACES CHO DỮ LIỆU TRẢ VỀ (RESPONSES)
// ==========================================

export interface CategoryResponse {
  category_id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  level: number;
  children?: CategoryResponse[]; // Đệ quy cho cây danh mục
}

export interface CategoryAdmin extends CategoryResponse {
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent_id: number | null;
}

// Cấu trúc chung trả về từ Backend
export interface ApiResponse<T> {
  status: number;
  message?: string;
  data: T; // Keep data mandatory here as categories usually always have data on success
}

// ==========================================
// INTERFACES CHO DỮ LIỆU GỬI LÊN (PAYLOADS)
// ==========================================

export interface GetAdminCategoriesParams {
  keyword?: string;
  parent_id?: number;
}

// Khi dùng Form Data chứa File, ta quy định kiểu cho input đầu vào
export interface CategoryPayload {
  name: string;
  description?: string;
  parent_id?: number | null;
  is_active?: boolean;
  file?: File | null;
  image_url?: string;
}