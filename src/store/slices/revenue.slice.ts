import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { revenueService } from '@/services/revenue.service';
import type { DashboardStatsResponse, MonthlyRevenueResponse } from '@/types/revenue.type';

interface RevenueState {
  stats: DashboardStatsResponse | null;
  monthlyRevenue: MonthlyRevenueResponse[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RevenueState = {
  stats: null,
  monthlyRevenue: [],
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk<DashboardStatsResponse>(
  'revenue/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await revenueService.getDashboardStats();
      // Nếu response có data (dạng ApiResponse), trả về data. Nếu không, trả về chính response (dạng DTO trực tiếp)
      return response.data !== undefined ? response.data : response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thống kê dashboard');
    }
  }
);

export const fetchMonthlyRevenue = createAsyncThunk<MonthlyRevenueResponse[], number>(
  'revenue/fetchMonthly',
  async (year, { rejectWithValue }) => {
    try {
      const response: any = await revenueService.getMonthlyRevenue(year);
      return response.data !== undefined ? response.data : response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy doanh thu theo tháng');
    }
  }
);

const revenueSlice = createSlice({
  name: 'revenue',
  initialState,
  reducers: {
    clearRevenueError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Monthly Revenue
      .addCase(fetchMonthlyRevenue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyRevenue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyRevenue = action.payload;
      })
      .addCase(fetchMonthlyRevenue.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRevenueError } = revenueSlice.actions;
export default revenueSlice.reducer;
