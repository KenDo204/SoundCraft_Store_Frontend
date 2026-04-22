import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '@/services/user.service';
import type { UserInfo, UpdateProfilePayload, ChangePasswordPayload } from '@/types/user.type';

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchMyProfile = createAsyncThunk<UserInfo, void>(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getMyProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin cá nhân');
    }
  }
);

export const updateMyProfile = createAsyncThunk<UserInfo, UpdateProfilePayload>(
  'user/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await userService.updateMyProfile(payload);
      return response.data; // Trả về thông tin User sau khi update thành công
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật thông tin');
    }
  }
);

export const changeMyPassword = createAsyncThunk<null, ChangePasswordPayload>(
  'user/changePassword',
  async (payload, { rejectWithValue }) => {
    try {
      await userService.changeMyPassword(payload);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    }
  }
);

// ==========================================
// SLICE STATE & LOGIC
// ==========================================

interface UserState {
  profile: UserInfo | null;
  isLoading: boolean;
  isUpdating: boolean; // Dùng để hiện loading spinner lúc đang lưu form
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserProfile: (state) => {
      state.profile = null; // Dùng khi Đăng xuất (Logout)
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchMyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateMyProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload; // Ghi đè profile mới lên UI ngay lập tức
      })
      .addCase(updateMyProfile.rejected, (state, action: any) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Change Password
      .addCase(changeMyPassword.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(changeMyPassword.fulfilled, (state) => {
        state.isUpdating = false;
        // Đổi pass thành công không làm thay đổi profile state
      })
      .addCase(changeMyPassword.rejected, (state, action: any) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;