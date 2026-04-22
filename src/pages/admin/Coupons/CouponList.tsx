import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllCouponsAdmin, toggleCouponActiveAdmin } from '@/store/slices/coupon.slice';
import { formatPrice } from '@/lib/utils';
import { Button, Tooltip, Switch, CircularProgress } from '@mui/material';
import { Plus, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/config/paths';
import { toast } from 'react-toastify';

export const CouponList = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allCoupons, isLoading } = useAppSelector(state => state.coupon);

  useEffect(() => {
    dispatch(fetchAllCouponsAdmin());
  }, [dispatch]);

  const handleToggle = async (id: number) => {
    try {
      await dispatch(toggleCouponActiveAdmin(id)).unwrap();
      toast.success('Cập nhật trạng thái thành công');
    } catch (e: any) {
      toast.error(e);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Ticket className="text-orange-500" /> Quản lý Mã giảm giá
          </h1>
          <p className="text-stone-500 text-sm mt-1">Danh sách tất cả voucher hệ thống</p>
        </div>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => navigate(PATHS.ADMIN_COUPONS_ADD)}
          sx={{
            bgcolor: '#0f172a',
            borderRadius: '8px',
            textTransform: 'none',
            px: 3,
            '&:hover': { bgcolor: '#ea580c' }
          }}
        >
          Tạo mã mới
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
              <tr>
                <th className="p-4 font-bold">Mã Code</th>
                <th className="p-4 font-bold">Loại / Giá trị</th>
                <th className="p-4 font-bold">Điều kiện</th>
                <th className="p-4 font-bold">SL (Đã dùng)</th>
                <th className="p-4 font-bold">Hạn sử dụng</th>
                <th className="p-4 font-bold text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center"><CircularProgress size={30} /></td>
                </tr>
              ) : allCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">Chưa có mã giảm giá nào</td>
                </tr>
              ) : (
                allCoupons.map((coupon) => (
                  <tr key={coupon.coupon_id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100 tracking-wider">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-stone-800 block">
                        {coupon.discount_type === 'PERCENT' 
                           ? `${coupon.discount_value}%` 
                           : formatPrice(coupon.discount_value)}
                      </span>
                      {coupon.max_discount_amount && coupon.discount_type === 'PERCENT' && (
                        <span className="text-xs text-stone-500">
                          Tối đa: {formatPrice(coupon.max_discount_amount)}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-stone-600">
                      Từ: <span className="font-bold">{formatPrice(coupon.min_order_amount)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-stone-800">{coupon.max_usage}</span>
                      <span className="text-stone-400 text-xs ml-1">({coupon.used_count ?? 0})</span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-stone-600">
                        {new Date(coupon.start_date).toLocaleDateString('vi-VN')} <br/> 
                        đến {new Date(coupon.end_date).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Tooltip title={coupon.is_active ? 'Đang bật' : 'Đang tắt'}>
                        <Switch 
                           checked={coupon.is_active} 
                           onChange={() => handleToggle(coupon.coupon_id)} 
                           color="warning" 
                        />
                      </Tooltip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
