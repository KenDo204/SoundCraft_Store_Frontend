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