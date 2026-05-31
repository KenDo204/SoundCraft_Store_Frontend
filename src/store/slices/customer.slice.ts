import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '@/services/user.service';
import type { 
  AdminUserListItem, 
  AdminUserListResponse,
  AdminUserDetail, 
  CreateUserPayload, 
  UpdateUserPayload, 
  AdminUserListQuery 
} from '@/types/user.type';

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchAdminUsers = createAsyncThunk<AdminUserListResponse, AdminUserListQuery | undefined>(
  'customer/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await userService.getAdminUsers(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách tài khoản');
    }
  }
);

export const fetchAdminUserById = createAsyncThunk<AdminUserDetail, number>(
  'customer/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userService.getAdminUserById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin chi tiết tài khoản');
    }
  }
);

export const createAdminUser = createAsyncThunk<AdminUserDetail, CreateUserPayload>(
  'customer/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await userService.createAdminUser(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo tài khoản');
    }
  }
);

export const updateAdminUser = createAsyncThunk<AdminUserDetail, { id: number; payload: UpdateUserPayload }>(
  'customer/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await userService.updateAdminUser(id, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật tài khoản');
    }
  }
);

export const updateAdminUserStatus = createAsyncThunk<number, { id: number; isActive: boolean }>(
  'customer/updateStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      await userService.updateAdminUserStatus(id, isActive);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái hoạt động');
    }
  }
);

export const deleteAdminUser = createAsyncThunk<number, number>(
  'customer/delete',
  async (id, { rejectWithValue }) => {
    try {
      await userService.deleteAdminUser(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa tài khoản');
    }
  }
);

// ==========================================
// STATE INTERFACE & INITIAL STATE
// ==========================================

interface CustomerState {
  list: AdminUserListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentUser: AdminUserDetail | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  list: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  currentUser: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// ==========================================
// SLICE DEFINITION
// ==========================================

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data || [];
        state.meta = action.payload.meta || initialState.meta;
      })
      .addCase(fetchAdminUsers.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload || 'Lỗi khi lấy danh sách tài khoản';
      })

      // Fetch Detail
      .addCase(fetchAdminUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchAdminUserById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload || 'Lỗi khi lấy chi tiết tài khoản';
      })

      // Create
      .addCase(createAdminUser.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createAdminUser.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(createAdminUser.rejected, (state, action: any) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Lỗi khi tạo tài khoản';
      })

      // Update
      .addCase(updateAdminUser.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateAdminUser.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (state.currentUser && state.currentUser.user_id === action.payload.user_id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateAdminUser.rejected, (state, action: any) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Lỗi khi cập nhật tài khoản';
      })

      // Update Status
      .addCase(updateAdminUserStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdminUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const targetId = action.payload;
        const target = state.list.find((u) => u.user_user_id === targetId);
        if (target) {
          target.user_is_active = !target.user_is_active;
        }
      })
      .addCase(updateAdminUserStatus.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload || 'Lỗi khi cập nhật trạng thái hoạt động';
      })

      // Delete
      .addCase(deleteAdminUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((u) => u.user_user_id !== action.payload);
      })
      .addCase(deleteAdminUser.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload || 'Lỗi khi xóa tài khoản';
      });
  },
});

export const { clearCustomerError, clearCurrentUser } = customerSlice.actions;
export default customerSlice.reducer;
