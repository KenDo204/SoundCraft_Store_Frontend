import api from '@/lib/axios';
import type { DashboardStatsResponse, MonthlyRevenueResponse } from '@/types/revenue.type';
import type { ApiResponse } from '@/types/product.type';

export const revenueService = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardStatsResponse>> => {
    return api.get('/revenues/dashboard-stats');
  },

  getMonthlyRevenue: async (year: number): Promise<ApiResponse<MonthlyRevenueResponse[]>> => {
    return api.get(`/revenues/monthly-revenue/${year}`);
  },

  findAll: async (): Promise<ApiResponse<any>> => {
    return api.get('/revenues');
  },

  findOne: async (id: number | string): Promise<ApiResponse<any>> => {
    return api.get(`/revenues/${id}`);
  },
};
