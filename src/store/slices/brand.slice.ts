import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { brandService } from '@/services/brand.service';
import type { BrandResponse, BrandPayload } from '@/types/brand.type';

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchAllBrands = createAsyncThunk<BrandResponse[], void>(
  'brands/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await brandService.getAll();
      return response.data; // Lấy mảng dữ liệu. Chú ý nốt .data tùy theo interceptor của bạn
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách thương hiệu');
    }
  }
);

export const fetchBrandById = createAsyncThunk<BrandResponse, number | string>(
  'brands/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response: any = await brandService.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin thương hiệu');
    }
  }
);

export const createBrand = createAsyncThunk<BrandResponse, BrandPayload>(
  'brands/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response: any = await brandService.create(payload);
      return response.data; // Trả về object Brand vừa tạo
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo thương hiệu');
    }
  }
);

export const updateBrand = createAsyncThunk<BrandResponse, { id: number | string; payload: BrandPayload }>(
  'brands/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response: any = await brandService.update(id, payload);
      return response.data; // Trả về object Brand đã cập nhật
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật thương hiệu');
    }
  }
);

export const deleteBrand = createAsyncThunk<number, number | string>(
  'brands/delete',
  async (id, { rejectWithValue }) => {
    try {
      await brandService.delete(id);
      return Number(id); // Trả về ID để xóa khỏi store
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa thương hiệu');
    }
  }
);

// ==========================================
// SLICE
// ==========================================

interface BrandState {
  list: BrandResponse[];
  currentBrand: BrandResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BrandState = {
  list: [],
  currentBrand: null,
  isLoading: false,
  error: null,
};

const brandSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    clearBrandError: (state) => {
      state.error = null;
    },
    clearCurrentBrand: (state) => {
      state.currentBrand = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      
      // Fetch Single
      .addCase(fetchBrandById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBrand = action.payload;
      })

      // Create
      .addCase(createBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.list.unshift(action.payload); // Đẩy thương hiệu mới lên đầu bảng
        }
      })

      // Update
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const index = state.list.findIndex(b => Number(b.brand_id) === Number(action.payload.brand_id));
          if (index !== -1) {
            state.list[index] = action.payload; // Ghi đè dữ liệu mới
          }
          if (state.currentBrand?.brand_id === action.payload.brand_id) {
            state.currentBrand = action.payload;
          }
        }
      })

      // Delete
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter(b => Number(b.brand_id) !== action.payload);
      })

      // Matchers (Xử lý chung cho trạng thái Pending và Rejected)
      .addMatcher(
        (action) => action.type.startsWith('brands/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('brands/') && action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.isLoading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const { clearBrandError, clearCurrentBrand } = brandSlice.actions;
export default brandSlice.reducer;