import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminOrders, updateOrderStatus } from '@/store/slices/order.slice';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-toastify';
import { CircularProgress, MenuItem, Select } from '@mui/material';

export const OrderList = () => {
  const dispatch = useAppDispatch();
  const { adminOrders, isLoading } = useAppSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      toast.success('Cập nhật trạng thái thành công');
      dispatch(fetchAdminOrders());
    } catch (error: any) {
      toast.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'text-orange-600 bg-orange-100';
      case 'SHIPPING': return 'text-blue-600 bg-blue-100';
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-stone-600 bg-stone-100';
    }
  };

  return (
    <div className="p-6 bg-[#fcfbf9] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900">Quản lý Đơn hàng</h1>
            <p className="text-stone-500">Xem và cập nhật trạng thái các đơn hàng.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center p-10"><CircularProgress sx={{ color: '#ea580c' }} /></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-sm">
                  <th className="p-4">Mã ĐH</th>
                  <th className="p-4">Ngày đặt</th>
                  <th className="p-4">Sản phẩm</th>
                  <th className="p-4">Tổng tiền</th>
                  <th className="p-4">PT Thanh toán</th>
                  <th className="p-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-stone-500">Không có đơn hàng nào.</td></tr>
                ) : adminOrders.map((order) => (
                  <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="p-4 font-bold text-stone-900">#{order.id}</td>
                    <td className="p-4 text-stone-600 text-sm">{new Date(order.orderDate).toLocaleString('vi-VN')}</td>
                    <td className="p-4">
                      {order.orderDetails?.map((item, idx) => (
                        <div key={idx} className="text-sm text-stone-800 font-medium mb-1 line-clamp-1" title={item.productName}>
                          - {item.productName} (x{item.quantity})
                        </div>
                      ))}
                    </td>
                    <td className="p-4 font-black text-orange-600">{formatPrice(order.totalMoney)}</td>
                    <td className="p-4">
                      <span className="font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded-md text-xs">{order.paymentMethod}</span>
                    </td>
                    <td className="p-4">
                      <Select
                        value={order.status}
                        size="small"
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        sx={{ 
                          fontSize: '0.875rem', 
                          fontWeight: 'bold', 
                          borderRadius: '8px',
                          bgcolor: 'white',
                          minWidth: '140px',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e7e5e4' },
                        }}
                        className={getStatusColor(order.status)}
                      >
                        <MenuItem value="PENDING" sx={{ fontSize: '0.875rem' }}>Chờ xử lý</MenuItem>
                        <MenuItem value="SHIPPING" sx={{ fontSize: '0.875rem' }}>Đang giao hàng</MenuItem>
                        <MenuItem value="DELIVERED" sx={{ fontSize: '0.875rem' }}>Đã giao</MenuItem>
                        <MenuItem value="CANCELLED" sx={{ fontSize: '0.875rem', color: 'red' }}>Đã hủy</MenuItem>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
