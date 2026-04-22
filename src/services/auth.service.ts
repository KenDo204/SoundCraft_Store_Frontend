import api from '@/lib/axios';
import type {
  RegisterDto,
  LoginDto,
  LoginWithGoogleDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LoginResponseDto,
  UserInfo,
  ApiResponse,
} from '@/types/auth.types';

export const authService = {
  // Đăng ký tài khoản
  register: async (data: RegisterDto): Promise<ApiResponse<UserInfo>> => {
    return api.post('/auth/register', data);
  },

  // Đăng nhập truyền thống
  login: async (data: LoginDto): Promise<ApiResponse<LoginResponseDto>> => {
    return api.post('/auth/login', data);
  },

  // Đăng nhập bằng Google
  loginGoogle: async (data: LoginWithGoogleDto): Promise<ApiResponse<LoginResponseDto>> => {
    return api.post('/auth/login/social/google', data);
  },

  // Lấy thông tin user đang đăng nhập (Flow 1: Khởi tạo app)
  getAccount: async (): Promise<ApiResponse<UserInfo>> => {
    return api.get('/auth/account');
  },

  // Quên mật khẩu
  forgotPassword: async (data: ForgotPasswordDto): Promise<ApiResponse<null>> => {
    return api.post('/auth/forgot-password', data);
  },

  // Đặt lại mật khẩu
  resetPassword: async (data: ResetPasswordDto): Promise<ApiResponse<null>> => {
    return api.post('/auth/reset-password', data);
  },

  // Đăng xuất
  logout: async (): Promise<ApiResponse<null>> => {
    return api.post('/auth/logout');
  },
};