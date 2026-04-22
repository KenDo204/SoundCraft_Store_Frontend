import { createSlice, createAsyncThunk, type PayloadAction} from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import type { LoginDto, UserInfo, ForgotPasswordDto, RegisterDto, ResetPasswordDto} from '@/types/auth.types';
import { isAxiosError } from 'axios';

// --- ASYNC THUNKS ---

// 1. Luồng lấy thông tin tài khoản khi khởi tạo App (F5 trang)
export const getAccountThunk = createAsyncThunk(
  'auth/getAccount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getAccount();
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data; // Trả về UserInfo
    } catch (error: unknown) {
      if (isAxiosError(error)) { // Kiểm tra nếu là lỗi do Axios ném ra
        return rejectWithValue(error.response?.data?.message || 'Phiên đăng nhập hết hạn');
      }
      return rejectWithValue('Đã xảy ra lỗi không xác định');
    }
  }
);

// 2. Luồng Đăng nhập
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (data: LoginDto, { rejectWithValue }) => {
    try {
      const response = await authService.login(data);
      const responseData = response.data; // Phòng hờ nếu Backend không bọc data
      if (responseData?.access_token) {
        localStorage.setItem('access_token', responseData.access_token);
      }
      if (responseData?.user) {
        localStorage.setItem('user', JSON.stringify(responseData.user));
      }
      return responseData?.user;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
      }
      return rejectWithValue('Đã xảy ra lỗi không xác định');
    }
  }
);

export const loginGoogleThunk = createAsyncThunk(
  'auth/loginGoogle',
  async (data: { token: string }, { rejectWithValue }) => {
    try {
      // Gọi API từ service
      const response = await authService.loginGoogle(data);
      
      const responseData = response.data; // Phòng hờ
      if (responseData?.access_token) {      
        localStorage.setItem('access_token', responseData.access_token);
      }
      if (responseData?.user) {
        localStorage.setItem('user', JSON.stringify(responseData.user));
      }

      return responseData?.user;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Đăng nhập Google thất bại');
      }
      return rejectWithValue('Đã xảy ra lỗi không xác định');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: RegisterDto, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
      }
      return rejectWithValue('Đã xảy ra lỗi không xác định');
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    // Luôn dọn dẹp local storage trước để tránh user bị kẹt nếu Backend lỗi
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    // Thêm dispatch để reset state Redux ngay lập tức (forceLogout)
    dispatch(forceLogout());

    try {
      await authService.logout();
      return null;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Đăng xuất thất bại');
      }
      return rejectWithValue('Đã xảy ra lỗi không xác định');
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (data: ForgotPasswordDto, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(data);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Gửi yêu cầu thất bại');
      }
      return rejectWithValue('Đã xảy ra lỗi không xác định');
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (data: ResetPasswordDto, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(data);
      return response.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
      }
      return rejectWithValue('Đã xảy ra lỗi không xác định');
    }
  }
);

const savedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
const initialUser = savedUser ? JSON.parse(savedUser) : null;
const getTokenFromLocalStorage = (): string | null => {
  return localStorage.getItem("access_token") || null;
};

// --- STATE INTERFACE ---
interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Quan trọng: Đánh dấu đã kiểm tra token xong chưa
  isOtpForgetSent: boolean;
  error: string | null;
  isGoogleLoading: boolean;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: initialUser,
  accessToken: getTokenFromLocalStorage(),
  isAuthenticated: !!initialUser,
  isLoading: false,
  isInitialized: true, 
  isOtpForgetSent: false,
  error: null,
  isGoogleLoading: false,
};

const handleAuthSuccess = (state: AuthState, action: PayloadAction<any>) => {
  state.isLoading = false;
  state.isGoogleLoading = false;
  state.error = null;
  state.isAuthenticated = true;
  
  if (action.payload) {
    const userData = action.payload; // Thunk bây giờ chắc chắn trả về đúng object user
    state.user = userData;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsOtpForgetSent: (state, action: PayloadAction<boolean>) => {
      state.isOtpForgetSent = action.payload;
    },
    forceLogout: (state) => {
      state.isLoading = false;
      state.isGoogleLoading = false;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    },
    setAuthUser: (state, action: PayloadAction<UserInfo>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Account ---
      .addCase(getAccountThunk.pending, (state) => {
        state.isInitialized = false; 
      })
      .addCase(getAccountThunk.fulfilled, (state, action) => {
        state.isInitialized = true;
        state.isAuthenticated = true;
        state.user = action.payload as UserInfo;
      })
      .addCase(getAccountThunk.rejected, (state) => {
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
      })

      // --- Login Truyền thống ---
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, handleAuthSuccess) // Dùng helper
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- Login Google ---
      .addCase(loginGoogleThunk.pending, (state) => {
        state.isGoogleLoading = true; // Chỉ quay spinner nút Google
        state.error = null;
      })
      .addCase(loginGoogleThunk.fulfilled, handleAuthSuccess) // Dùng helper
      .addCase(loginGoogleThunk.rejected, (state, action) => {
        state.isGoogleLoading = false;
        state.error = action.payload as string;
      })

      // --- Logout ---
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // --- Quên mật khẩu ---
      .addCase(forgotPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isOtpForgetSent = true; // Bật cờ đã gửi OTP
        state.error = null;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // --- Reset mật khẩu ---
      .addCase(resetPasswordThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPasswordThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isOtpForgetSent = false; // Reset cờ sau khi thành công
        state.error = null;
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
  },
});

export const { forceLogout, clearError, setAuthUser, setIsOtpForgetSent } = authSlice.actions;
export default authSlice.reducer;