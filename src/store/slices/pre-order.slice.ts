import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { preOrderService } from '@/services/pre-order.service';
import type { PreOrderPayload, PreOrderResponse } from '@/types/pre-order.type';

export const createPreOrder = createAsyncThunk<PreOrderResponse, PreOrderPayload>(
  'preOrder/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await preOrderService.createPreOrder(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký nhận thông báo');
    }
  }
);

interface PreOrderState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: PreOrderState = {
  isLoading: false,
  error: null,
  success: false,
};

const preOrderSlice = createSlice({
  name: 'preOrder',
  initialState,
  reducers: {
    resetPreOrderStatus: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPreOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPreOrder.fulfilled, (state) => {
        state.isLoading = false;
        state.success = true;
      })
      .addCase(createPreOrder.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPreOrderStatus } = preOrderSlice.actions;
export default preOrderSlice.reducer;
