export interface OrdersByStatus {
  PENDING: number;
  SHIPPING: number;
  DELIVERED: number;
  CANCELLED: number;
}

export interface DashboardStatsResponse {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalOrders: number;
  ordersByStatus: OrdersByStatus;
  totalRevenue: number;
}

export interface MonthlyRevenueResponse {
  month: number;
  revenue: number;
}
