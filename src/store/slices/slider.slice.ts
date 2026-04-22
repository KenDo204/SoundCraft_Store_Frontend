import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sliderService } from '@/services/slider.service';
import type { SliderResponse, SliderPayload } from '@/types/slider.type';

// ==========================================
// ASYNC THUNKS
// ==========================================

// Public Thunk (Dành cho trang chủ)
export const fetchActiveSliders = createAsyncThunk<SliderResponse[], void>(
  'sliders/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sliderService.getActiveSliders();
      return response.data; // Lấy mảng data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy danh sách banner');
    }
  }
);

// Admin Thunks
export const fetchAllAdminSliders = createAsyncThunk<SliderResponse[], void>(
  'sliders/fetchAllAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sliderService.getAllAdminSliders();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy danh sách banner Admin');
    }
  }
);

export const fetchSliderById = createAsyncThunk<SliderResponse, number | string>(
  'sliders/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sliderService.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy thông tin banner');
    }
  }
);

export const createSlider = createAsyncThunk<SliderResponse, SliderPayload>(
  'sliders/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await sliderService.create(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tạo banner');
    }
  }
);

export const updateSlider = createAsyncThunk<SliderResponse, { id: number | string; payload: SliderPayload }>(
  'sliders/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await sliderService.update(id, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật banner');
    }
  }
);

export const toggleSliderStatus = createAsyncThunk<SliderResponse, number | string>(
  'sliders/toggle',
  async (id, { rejectWithValue }) => {
    try {
      const response = await sliderService.toggleStatus(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi đổi trạng thái banner');
    }
  }
);

export const deleteSlider = createAsyncThunk<number, number | string>(
  'sliders/delete',
  async (id, { rejectWithValue }) => {
    try {
      await sliderService.delete(id);
      return Number(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi xóa banner');
    }
  }
);

// ==========================================
// SLICE STATE & LOGIC
// ==========================================

interface SliderState {
  adminList: SliderResponse[];   // Danh sách hiển thị trong trang Admin
  activeList: SliderResponse[];  // Danh sách hiển thị trang chủ cho Client
  currentSlider: SliderResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SliderState = {
  adminList: [],
  activeList: [],
  currentSlider: null,
  isLoading: false,
  error: null,
};

const sliderSlice = createSlice({
  name: 'sliders',
  initialState,
  reducers: {
    clearSliderError: (state) => { state.error = null; },
    clearCurrentSlider: (state) => { state.currentSlider = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Active (Client)
      .addCase(fetchActiveSliders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeList = action.payload;
      })
      // Fetch All (Admin)
      .addCase(fetchAllAdminSliders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminList = action.payload;
      })
      // Fetch By Id
      .addCase(fetchSliderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSlider = action.payload;
      })
      // Create
      .addCase(createSlider.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.adminList.unshift(action.payload);
        }
      })
      // Update
      .addCase(updateSlider.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const index = state.adminList.findIndex(s => s.slider_id === action.payload.slider_id);
          if (index !== -1) state.adminList[index] = action.payload;
          
          if (state.currentSlider?.slider_id === action.payload.slider_id) {
            state.currentSlider = action.payload;
          }
        }
      })
      // Toggle Status
      .addCase(toggleSliderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const index = state.adminList.findIndex(s => s.slider_id === action.payload.slider_id);
          if (index !== -1) state.adminList[index] = action.payload; // Update nhanh trạng thái trên bảng Admin
        }
      })
      // Delete
      .addCase(deleteSlider.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminList = state.adminList.filter(s => s.slider_id !== action.payload);
      })
      
      // Xử lý Loading & Error chung
      .addMatcher(
        (action) => action.type.startsWith('sliders/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('sliders/') && action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.isLoading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const { clearSliderError, clearCurrentSlider } = sliderSlice.actions;
export default sliderSlice.reducer;