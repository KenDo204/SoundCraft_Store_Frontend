import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '@/services/order.service';
import type { OrderResponse, CheckoutPayload } from '@/types/order.type';

interface OrderState {
  myOrders: OrderResponse[];
  adminOrders: OrderResponse[];
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  myOrders: [],
  adminOrders: [],
  isLoading: false,
  isActionLoading: false,
  error: null,
};

export const checkoutSession = createAsyncThunk(
  'order/checkout',
  async (payload: CheckoutPayload, { rejectWithValue }) => {
    try {
      const response = await orderService.checkout(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi xử lý thanh toán');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getMyOrders();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải đơn hàng của tôi');
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'order/fetchAdminOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.getAdminOrders();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải danh sách đơn hàng');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status }: { orderId: number, status: string }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ orderId, reason }: { orderId: number, reason: string }, { rejectWithValue }) => {
    try {
      await orderService.cancelOrder(orderId, reason);
      return orderId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi hủy đơn hàng');
    }
  }
);

export const confirmReceipt = createAsyncThunk(
  'order/confirmReceipt',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await orderService.confirmReceipt(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi xác nhận nhận hàng');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Checkout
    builder.addCase(checkoutSession.pending, (state) => {
      state.isActionLoading = true;
      state.error = null;
    });
    builder.addCase(checkoutSession.fulfilled, (state) => {
      state.isActionLoading = false;
    });
    builder.addCase(checkoutSession.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.payload as string;
    });

    // fetchMyOrders
    builder.addCase(fetchMyOrders.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMyOrders.fulfilled, (state, action) => {
      state.isLoading = false;
      state.myOrders = action.payload;
    });
    builder.addCase(fetchMyOrders.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // fetchAdminOrders
    builder.addCase(fetchAdminOrders.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminOrders.fulfilled, (state, action) => {
      state.isLoading = false;
      state.adminOrders = action.payload;
    });
    builder.addCase(fetchAdminOrders.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // updateOrderStatus
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      const updatedOrder = action.payload;
      const index = state.adminOrders.findIndex(o => o.id === updatedOrder.id);
      if (index !== -1) {
        state.adminOrders[index] = updatedOrder;
      }
    });

    // cancelOrder
    builder.addCase(cancelOrder.fulfilled, (state, action) => {
      const index = state.myOrders.findIndex(o => o.id === action.payload);
      if (index !== -1) {
        state.myOrders[index].status = 'CANCELLED';
      }
    });

    // confirmReceipt
    builder.addCase(confirmReceipt.fulfilled, (state, action) => {
      const updatedOrder = action.payload;
      const index = state.myOrders.findIndex(o => o.id === updatedOrder.id);
      if (index !== -1) {
        state.myOrders[index] = updatedOrder;
      }
    });
  }
});

export default orderSlice.reducer;
