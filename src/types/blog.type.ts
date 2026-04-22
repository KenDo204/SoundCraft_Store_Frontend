// --- Dữ liệu Tác giả ---
export interface BlogAuthor {
  user_id: number;
  full_name: string;
  avatar: string;
}

// --- Dữ liệu Blog cho User (Public) ---
export interface BlogUser {
  blog_id: number | string;
  title: string;
  slug: string;
  short_description?: string;
  content: string;
  image?: string;
  view_count: number | string;
  published_at: string; // ISO String date
  author: BlogAuthor;
}

// --- Dữ liệu Blog cho Admin (Kế thừa từ User, thêm các trường quản lý) ---
export interface BlogAdmin extends BlogUser {
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
  created_at: string;
  updated_at: string;
}

// --- Payload Request (Dữ liệu gửi lên) ---
export interface CreateBlogPayload {
  title: string;
  short_description?: string;
  content: string;
  image?: string;
  file?: File | null;
}

export interface UpdateBlogPayload extends Partial<CreateBlogPayload> {}

// --- Response Phân trang ---
export interface PaginatedBlogResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}