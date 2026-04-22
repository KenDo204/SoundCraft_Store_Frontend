import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  getAccountThunk, 
  loginThunk, 
  loginGoogleThunk, 
  registerThunk,
  logoutThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  clearError 
} from '@/store/slices/authSlice';
import type { 
  LoginDto, 
  LoginWithGoogleDto, 
  RegisterDto, 
  ForgotPasswordDto, 
  ResetPasswordDto 
} from '@/types/auth.types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  
  // Rút trích toàn bộ state từ authSlice (Đã thêm isGoogleLoading)
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    isGoogleLoading, 
    isInitialized, 
    error 
  } = useAppSelector((state) => state.auth);

  // ==========================================
  // HÀNH ĐỘNG (ACTIONS)
  // ==========================================

  // 1. Kiểm tra trạng thái đăng nhập (Dùng khi F5 trang)
  const checkAuth = useCallback(() => {
    dispatch(getAccountThunk());
  }, [dispatch]);

  // 2. Đăng nhập truyền thống
  const login = useCallback(async (data: LoginDto) => {
    return dispatch(loginThunk(data)).unwrap(); 
  }, [dispatch]);

  // 3. Đăng nhập bằng Google
  const loginGoogle = useCallback(async (data: LoginWithGoogleDto) => {
    return dispatch(loginGoogleThunk(data)).unwrap();
  }, [dispatch]);

  // 4. Đăng ký
  const register = useCallback(async (data: RegisterDto) => {
    return dispatch(registerThunk(data)).unwrap();
  }, [dispatch]);

  // 5. Quên mật khẩu
  const forgotPassword = useCallback(async (data: ForgotPasswordDto) => {
    return dispatch(forgotPasswordThunk(data)).unwrap();
  }, [dispatch]);

  // 6. Đặt lại mật khẩu
  const resetPassword = useCallback(async (data: ResetPasswordDto) => {
    return dispatch(resetPasswordThunk(data)).unwrap();
  }, [dispatch]);

  // 7. Đăng xuất (Đã đổi thành gọi API thay vì chỉ xóa state)
  const logout = useCallback(async () => {
    return dispatch(logoutThunk()).unwrap();
  }, [dispatch]);

  // 8. Xóa thông báo lỗi (Dùng khi user đóng popup lỗi hoặc gõ lại form)
  const resetError = useCallback(() => {
    if (error) dispatch(clearError());
  }, [dispatch, error]);

  return {
    // Trạng thái (States)
    user,
    isAuthenticated,
    isLoading,
    isGoogleLoading,
    isInitialized,
    error,
    
    // Hành động (Actions)
    checkAuth,
    login,
    loginGoogle,
    register,
    forgotPassword,
    resetPassword,
    logout,
    resetError,
  };
};