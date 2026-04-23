import React, { useEffect, useState } from 'react';
import { 
  Package, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  TrendingDown,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats, fetchMonthlyRevenue } from '@/store/slices/revenue.slice';
import { formatPrice } from '@/lib/utils';

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, monthlyRevenue, isLoading } = useAppSelector((state) => state.revenue);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMonthlyRevenue(selectedYear));
  }, [dispatch, selectedYear]);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // --- LOGIC TÍNH XU HƯỚNG DOANH THU ---
  const calculateRevenueTrend = () => {
    if (!monthlyRevenue || monthlyRevenue.length === 0) return 0;
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const isCurrentYear = selectedYear === now.getFullYear();

    // Tìm tháng gần nhất có dữ liệu (tháng hiện tại nếu là năm nay, hoặc tháng 12 nếu là năm cũ)
    const targetMonth = isCurrentYear ? currentMonth : 12;
    
    const currentData = monthlyRevenue.find(m => m.month === targetMonth);
    const prevData = monthlyRevenue.find(m => m.month === (targetMonth === 1 ? 12 : targetMonth - 1));

    const currentVal = currentData?.revenue || 0;
    const prevVal = prevData?.revenue || 0;

    if (prevVal === 0) return currentVal > 0 ? 100 : 0;
    return ((currentVal - prevVal) / prevVal) * 100;
  };

  const revenueTrend = calculateRevenueTrend();

  const statCards = [
    {
      title: 'Tổng sản phẩm',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: null,
    },
    {
      title: 'Đơn hàng',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart, // Sử dụng ShoppingCart ở đây
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: null,
    },
    {
      title: 'Khách hàng',
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: null,
    },
    {
      title: 'Tổng doanh thu',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: revenueTrend,
    },
  ];

  const orderStatusData = stats?.ordersByStatus ? [
    { name: 'Chờ xử lý', value: stats.ordersByStatus.PENDING, color: '#f59e0b', icon: Clock },
    { name: 'Đang giao', value: stats.ordersByStatus.SHIPPING, color: '#3b82f6', icon: Truck },
    { name: 'Đã giao', value: stats.ordersByStatus.DELIVERED, color: '#10b981', icon: CheckCircle },
    { name: 'Đã hủy', value: stats.ordersByStatus.CANCELLED, color: '#ef4444', icon: XCircle },
  ] : [];

  const chartData = Array.isArray(monthlyRevenue) ? monthlyRevenue.map(item => ({
    name: `T.${item.month}`,
    revenue: item.revenue,
    orders: Math.floor(item.revenue / 1000000) // Mock dữ liệu đơn hàng dựa trên doanh thu để dùng BarChart
  })) : [];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển</h1>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer outline-none"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            {stat.trend !== null && (
              <div className={`mt-4 flex items-center text-xs font-medium ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                <span>
                  {stat.trend >= 0 ? '+' : ''}{stat.trend.toFixed(1)}% so với tháng trước
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 space-y-8">
          {/* Area Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Xu hướng doanh thu</h2>
              <div className="text-sm text-gray-500 font-medium italic">Năm {selectedYear}</div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `${val/1000000}M`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatPrice(value), 'Doanh thu']}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="revenue" name="Doanh thu thực tế" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart - Sử dụng BarChart và Bar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">So sánh hàng tháng</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span>Doanh thu theo cột</span>
              </div>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `${val/1000000}M`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatPrice(value), 'Doanh thu']}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Orders Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Trạng thái đơn hàng</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {orderStatusData.map((status, index) => (
              <div key={index} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg transition-colors" style={{ backgroundColor: `${status.color}15` }}>
                    <status.icon className="w-4 h-4" style={{ color: status.color }} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{status.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{status.value}</span>
              </div>
            ))}
            <div className="pt-6 mt-2 border-t border-gray-100 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tổng đơn hàng</span>
                <span className="text-2xl font-black text-gray-800 tracking-tight">{stats?.totalOrders || 0}</span>
              </div>
              <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 border border-gray-100">
                THÁNG NÀY
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
