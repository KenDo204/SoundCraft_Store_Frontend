import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { couponService } from '@/services/coupon.service';
import type { 
  CouponState, 
  CreateCouponPayload, 
  ApplyCouponPreviewPayload, 
  CommitCouponUsagePayload 
} from '@/types/coupon.type';

const initialState: CouponState = {
  availableCoupons: [],
  allCoupons: [],
  previewResult: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
};

// --- USER THUNKS ---

export const fetchAvailableCoupons = createAsyncThunk(
  'coupon/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await couponService.getAvailable();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy danh sách mã giảm giá');
    }
  }
);

export const applyCouponPreview = createAsyncThunk(
  'coupon/applyPreview',
  async (payload: ApplyCouponPreviewPayload, { rejectWithValue }) => {
    try {
      const response = await couponService.applyPreview(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện');
    }
  }
);

export const commitCouponUsage = createAsyncThunk(
  'coupon/commitUsage',
  async (payload: CommitCouponUsagePayload, { rejectWithValue }) => {
    try {
      const response = await couponService.commitUsage(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật lượt dùng mã giảm giá');
    }
  }
);

// --- ADMIN THUNKS ---

export const fetchAllCouponsAdmin = createAsyncThunk(
  'coupon/fetchAllAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await couponService.getAllAdmin();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy danh sách toàn bộ mã giảm giá');
    }
  }
);

export const createCouponAdmin = createAsyncThunk(
  'coupon/createAdmin',
  async (payload: CreateCouponPayload, { rejectWithValue }) => {
    try {
      const response = await couponService.createAdmin(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tạo mã giảm giá');
    }
  }
);

export const toggleCouponActiveAdmin = createAsyncThunk(
  'coupon/toggleActive',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await couponService.toggleActiveAdmin(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  }
);

// --- SLICE ---

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearCouponError: (state) => {
      state.error = null;
    },
    clearPreviewResult: (state) => {
      state.previewResult = null;
    }
  },
  extraReducers: (builder) => {
    // get available
    builder
      .addCase(fetchAvailableCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableCoupons = action.payload;
      })
      .addCase(fetchAvailableCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // preview
    builder
      .addCase(applyCouponPreview.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(applyCouponPreview.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.previewResult = action.payload;
      })
      .addCase(applyCouponPreview.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });

    // admin fetch all
    builder
      .addCase(fetchAllCouponsAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCouponsAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allCoupons = action.payload;
      })
      .addCase(fetchAllCouponsAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // admin create
    builder
      .addCase(createCouponAdmin.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(createCouponAdmin.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.allCoupons.unshift(action.payload); // push top
      })
      .addCase(createCouponAdmin.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });

    // admin toggle active
    builder
      .addCase(toggleCouponActiveAdmin.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(toggleCouponActiveAdmin.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const index = state.allCoupons.findIndex(c => c.coupon_id === action.payload.coupon_id);
        if (index !== -1) {
          state.allCoupons[index] = action.payload;
        }
      })
      .addCase(toggleCouponActiveAdmin.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCouponError, clearPreviewResult } = couponSlice.actions;
export default couponSlice.reducer;
