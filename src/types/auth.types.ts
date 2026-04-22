export interface UserInfo {
  id: number;
  full_name: string;
  email: string;
  mobile: string;
  role: string;
  avatar: string | null;
}

// Backend Entity Token (FE thường không dùng trực tiếp entity này, 
// nhưng định nghĩa sẵn nếu cần map dữ liệu admin/debug)
export interface Token {
  token_id: number;
  refresh_token: string;
  revoked: boolean;
  expired: boolean;
  user_id: number; // Mapped từ ManyToOne
  created_at: string | Date;
}

// --- REQUEST DTOs (Dữ liệu FE gửi lên BE) ---
export interface RegisterDto {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginWithGoogleDto {
  token: string; // ID Token từ Google
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string; // 6 số
  newPassword: string;
}

// --- RESPONSE DTOs (Dữ liệu BE trả về FE) ---
export interface LoginResponseDto {
  user: UserInfo;
  access_token: string;
}

// Cấu trúc Response chung dựa trên định dạng bạn viết ở Controller
export interface ApiResponse<T> {
  status: number;
  message?: string;
  data?: T;
}