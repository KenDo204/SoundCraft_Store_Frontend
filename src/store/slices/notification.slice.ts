import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '@/services/notification.service';
import type { NotificationResponse } from '@/types/notification.type';
import type { PaginatedData } from '@/types/product.type';

export const fetchUnreadCount = createAsyncThunk<number>(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const fetchNotifications = createAsyncThunk<PaginatedData<NotificationResponse>, { page?: number, size?: number }>(
  'notifications/fetchNotifications',
  async ({ page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(page, size);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const markAsRead = createAsyncThunk<number, number>(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const markAllAsRead = createAsyncThunk<void>(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

interface NotificationState {
  unreadCount: number;
  list: NotificationResponse[];
  pagination: Omit<PaginatedData<NotificationResponse>, 'items'>;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  unreadCount: 0,
  list: [],
  pagination: {
    totalElements: 0,
    totalPages: 1,
    currentPage: 0,
    limit: 10,
  },
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.items;
        state.pagination = {
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const item = state.list.find((n) => n.id === action.payload);
        if (item && !item.isRead) {
          item.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.list.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;
