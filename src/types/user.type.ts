// Enum lấy trực tiếp từ BE
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type UserRole = 
  | 'ROLE_CUSTOMER'
  | 'ROLE_SUPER_ADMIN'
  | 'ROLE_ADMIN'
  | 'ROLE_MANAGER'
  | 'ROLE_STAFF'
  | 'ROLE_OWNER';

// Interface của User trả về từ BE (Bạn có thể thêm các trường như email, status nếu có)
export interface UserInfo {
  id: number;
  email: string;
  full_name: string;
  mobile: string;
  avatar: string;
  dob: string;
  gender: Gender;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

// Payload cho chức năng Cập nhật thông tin (Khớp UpdateUserDto)
export interface UpdateProfilePayload {
  full_name?: string;
  mobile?: string;
  dob?: string;
  gender?: Gender;
  file?: File | null; // Frontend giữ file ảnh ở đây
}

// Payload cho chức năng Đổi mật khẩu (Khớp ChangePasswordDto)
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface AdminUserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  minSpending?: number;
  maxSpending?: number;
}

export interface AdminUserListItem {
  user_user_id: number;
  user_full_name: string;
  user_email: string;
  user_mobile: string | null;
  user_is_active: boolean;
  user_role: UserRole;
  user_created_at: string;
}

export interface AdminUserListResponse {
  data: AdminUserListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminUserDetail {
  user_id: number;
  full_name: string;
  email: string;
  mobile: string | null;
  avatar: string | null;
  role: UserRole;
  dob: string | null;
  gender: Gender | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password?: string;
  mobile?: string;
  role?: UserRole;
  dob?: string;
  gender?: Gender;
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  password?: string;
  mobile?: string;
  role?: UserRole;
  is_active?: boolean | string | number;
  dob?: string;
  gender?: Gender;
  file?: File | null;
}