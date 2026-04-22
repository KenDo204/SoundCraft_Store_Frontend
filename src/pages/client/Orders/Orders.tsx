import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyOrders, cancelOrder } from '@/store/slices/order.slice';
import { Package, Truck, CheckCircle, XCircle, ShoppingBag, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Chip } from '@mui/material';

export const Orders = () => {
  const dispatch = useAppDispatch();
  const { myOrders, isLoading } = useAppSelector(state => state.orders);
  
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleOpenCancel = (orderId: number) => {
    setSelectedOrderId(orderId);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const submitCancel = async () => {
    if (!selectedOrderId) return;
    if (!cancelReason.trim()) {
      toast.warning('Vui lòng nhập lý do hủy đơn');
      return;
    }
    
    try {
      await dispatch(cancelOrder({ orderId: selectedOrderId, reason: cancelReason })).unwrap();
      toast.success('Đã hủy đơn hàng');
      setCancelModalOpen(false);
    } catch (error: any) {
      toast.error(error);
    }
  };

  const getStatusChip = (status: string) => {
    switch(status) {
      case 'PENDING': return <Chip label="Đang chờ xử lý" color="warning" size="small" icon={<Package size={14} />} />;
      case 'SHIPPING': return <Chip label="Đang giao hàng" color="info" size="small" icon={<Truck size={14} />} />;
      case 'DELIVERED': return <Chip label="Đã giao thành công" color="success" size="small" icon={<CheckCircle size={14} />} />;
      case 'CANCELLED': return <Chip label="Đã hủy" color="error" size="small" icon={<XCircle size={14} />} />;
      default: return <Chip label={status} size="small" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
        <ShoppingBag className="text-orange-600" />
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Đơn hàng của tôi</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : myOrders.length === 0 ? (
        <div className="text-center py-20 text-stone-500">Bạn chưa có đơn hàng nào.</div>
      ) : (
        <div className="space-y-6">
          {myOrders.map(order => (
            <div key={order.id} className="bg-white border text-left border-stone-200 rounded-2xl p-6 shadow-sm">
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-100">
                <div>
                  <p className="font-bold text-stone-800">
                    Đơn hàng #{order.id} <span className="text-stone-400 font-normal">| {new Date(order.orderDate).toLocaleString('vi-VN')}</span>
                  </p>
                  <p className="text-sm text-stone-500 mt-1">Thanh toán: <span className="font-bold text-stone-700">{order.paymentMethod}</span></p>
                  {order.trackingNumber && <p className="text-sm text-stone-500 mt-1">Mã vận đơn: <span className="font-bold text-blue-600">{order.trackingNumber}</span></p>}
                </div>
                <div>{getStatusChip(order.status)}</div>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-4">
                {order.orderDetails?.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <img src={item.imageUrl || '/placeholder.png'} alt="anh" className="w-20 h-20 bg-stone-50 rounded-xl object-cover border border-stone-100" />
                    <div className="flex-1">
                      <p className="font-bold text-stone-800 line-clamp-2">{item.productName}</p>
                      <p className="text-sm text-stone-500 font-medium mt-1">Số lượng: {item.quantity}</p>
                      <p className="text-sm font-bold text-orange-600 mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex flex-col md:flex-row md:items-end justify-between border-t border-stone-100 pt-4 mt-2 gap-4">
                <div className="text-sm text-stone-600">
                  <p><span className="font-bold">Địa chỉ nhận hàng:</span> {order.address?.fullAddress}</p>
                  {order.note && <p className="mt-1"><span className="font-bold">Ghi chú:</span> {order.note}</p>}
                </div>
                <div className="text-right">
                  <p className="text-stone-500 text-sm mb-1">Tổng tiền</p>
                  <p className="text-2xl font-black text-orange-600">{formatPrice(order.totalMoney)}</p>
                  
                  {order.status === 'PENDING' && (
                    <Button 
                      onClick={() => handleOpenCancel(order.id)}
                      variant="outlined" 
                      color="error"
                      size="small"
                      sx={{ bgcolor: 'error.main', mt: 2, borderRadius: '8px', textTransform: 'none', fontWeight: 'bold', '&:hover': { bgcolor: 'error.dark' } }}
                    >
                      Hủy đơn hàng
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <Dialog open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle className="font-black text-stone-800 border-b border-stone-100 flex justify-between items-center px-4 py-3">
          Hủy Đơn Hàng
          <div onClick={() => setCancelModalOpen(false)} className="cursor-pointer hover:bg-stone-100 p-1 rounded-full"><X size={20} /></div>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: '24px !important' }}>
          <p className="text-sm text-stone-600 mb-4 font-medium">Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này:</p>
          <TextField
             fullWidth
             multiline
             rows={3}
             placeholder="Nhập lý do hủy..."
             value={cancelReason}
             onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setCancelModalOpen(false)} sx={{ color: 'white', fontWeight: 'bold', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}>Thoát</Button>
          <Button onClick={submitCancel} variant="contained" sx={{ fontWeight: 'bold', borderRadius: '8px', bgcolor: '#9f8a46', '&:hover': { bgcolor: '#775d14ff' } }}>Xác nhận Hủy</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
