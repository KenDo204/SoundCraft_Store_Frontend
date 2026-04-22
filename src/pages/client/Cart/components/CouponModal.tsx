import React, { useEffect, useState } from 'react';
import { Dialog, Box, TextField, Button, Radio, CircularProgress } from '@mui/material';
import { Ticket, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAvailableCoupons, applyCouponPreview, clearPreviewResult } from '@/store/slices/coupon.slice';
import type { Coupon } from '@/types/coupon.type';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-toastify';

interface CouponModalProps {
  open: boolean;
  onClose: () => void;
  cartTotal: number;
}

const PRIMARY_COLOR = '#0f172a'; // stone-900

export const CouponModal: React.FC<CouponModalProps> = ({ open, onClose, cartTotal }) => {
  const dispatch = useAppDispatch();
  const { availableCoupons, isLoading, previewResult, isActionLoading } = useAppSelector(state => state.coupon);
  
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    if (open) {
      dispatch(fetchAvailableCoupons());
    }
  }, [open, dispatch]);

  const handleApplyCode = async (code: string) => {
    if (!code.trim()) return;
    try {
      if (cartTotal === 0) {
         toast.warning("Vui lòng chọn sản phẩm trước khi áp dụng mã.");
         return;
      }
      await dispatch(applyCouponPreview({
        totalCartAmount: cartTotal,
        couponCode: code.trim().toUpperCase()
      })).unwrap();
      // toast.success("Áp dụng mã thành công!");
      onClose();
    } catch (error: any) {
      toast.error(error);
    }
  };

  const handleRemoveCode = () => {
      dispatch(clearPreviewResult());
      toast.info("Đã bỏ áp dụng mã giảm giá");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          maxHeight: '85vh',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        px: 3, 
        py: 2.5, 
        borderBottom: '1px solid #f5f5f4',
        bgcolor: '#ffffff'
      }}>
        <div className="flex items-center gap-2">
            <Ticket className="text-orange-600" />
            <h2 className="text-lg font-black text-stone-800 uppercase tracking-wide">Mã Giảm Giá</h2>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-red-500 hover:bg-stone-100 p-1.5 rounded-full transition-colors">
            <X size={24} />
        </button>
      </Box>

      <div className="flex flex-col w-full bg-[#fcfbf9] overflow-hidden">
        {/* Nhập mã thủ công */}
        <div className="p-5 flex items-center gap-3 border-b border-stone-200 bg-white shadow-sm z-10">
          <label className="text-sm text-stone-700 font-bold whitespace-nowrap">
            Mã Khuyến Mãi
          </label>
          <div className="flex-1 flex items-center gap-3">
            <TextField
              size="small"
              placeholder="Nhập mã voucher tại đây..."
              fullWidth
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCode(manualCode)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: 'white',
                  '& fieldset': { borderColor: '#e7e5e4' },
                  '&:hover fieldset': { borderColor: '#f97316' }, // orange-500
                  '&.Mui-focused fieldset': { borderColor: '#ea580c' }, // orange-600
                },
              }}
            />
            <Button
              variant="contained"
              onClick={() => handleApplyCode(manualCode)}
              disabled={!manualCode.trim() || isActionLoading}
              sx={{
                height: '40px',
                fontWeight: 700,
                bgcolor: PRIMARY_COLOR,
                borderRadius: '8px',
                textTransform: 'none',
                minWidth: '100px',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#ea580c', boxShadow: 'none' },
              }}
            >
              {isActionLoading ? <CircularProgress size={20} color="inherit" /> : 'Áp dụng'}
            </Button>
          </div>
        </div>

        {/* Danh sách */}
        <div className="p-5 min-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <CircularProgress size={32} sx={{ color: '#ea580c' }} />
            </div>
          ) : availableCoupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.coupon_id}
                  coupon={coupon}
                  cartTotal={cartTotal}
                  isSelected={previewResult?.couponCode === coupon.code}
                  onSelect={(c) => {
                      if (previewResult?.couponCode === c.code) {
                          handleRemoveCode();
                      } else {
                          handleApplyCode(c.code);
                      }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
               <Ticket size={64} className="mb-4 opacity-20" />
               <p className="text-stone-500 font-medium">Hiện tại không có mã giảm giá nào hợp lệ.</p>
               <p className="text-sm">Hãy thử nhập mã của bạn vào ô bên trên.</p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

interface CouponCardProps {
  coupon: Coupon;
  cartTotal: number;
  isSelected: boolean;
  onSelect: (c: Coupon) => void;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, cartTotal, isSelected, onSelect }) => {
  const now = new Date();
  const isStarted = now >= new Date(coupon.start_date);
  const isExpired = now > new Date(coupon.end_date);
  
  const isMinOrderMet = cartTotal >= Number(coupon.min_order_amount);
  const isEligible = isMinOrderMet && isStarted && !isExpired && coupon.is_active;

  const remainingOrder = Number(coupon.min_order_amount) - cartTotal;

  return (
    <div className={`flex flex-col gap-1 w-full group select-none`}>
      <div 
        onClick={() => {
            if (isEligible) onSelect(coupon);
        }}
        className={`
        relative flex bg-white border rounded-xl overflow-hidden min-h-[120px] transition-all cursor-pointer
        ${!isEligible ? 'opacity-60 bg-stone-50' : 'hover:border-orange-500 hover:shadow-md'}
        ${isSelected ? 'border-orange-500 ring-2 ring-orange-500/50 bg-orange-50/10' : 'border-stone-200'}
      `}>

        {/* Trái: Badge */}
        <div className={`w-28 flex flex-col items-center justify-center border-r-2 border-dashed border-stone-200 relative ${!isEligible ? 'bg-stone-100' : 'bg-[#fff7ed]'}`}>
          {/* Lỗ hổng trang trí */}
          <div className="absolute -left-1.5 top-0 bottom-0 flex flex-col justify-around py-1">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-[#fcfbf9] rounded-full border border-stone-200 -ml-[1px]" />
             ))}
          </div>

          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm border border-orange-100 mb-2">
             <Ticket className={!isEligible ? 'text-stone-400' : 'text-orange-500'} size={28} />
          </div>
          <span className="text-[11px] text-stone-500 font-black tracking-widest">{coupon.code}</span>
        </div>

        {/* Giữa: Content */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <h4 className="text-[16px] font-black text-stone-800 leading-tight mb-1">
            Giảm {coupon.discount_type === 'PERCENT' ? `${coupon.discount_value}%` : `${formatPrice(coupon.discount_value)}`}
          </h4>
          
          <div className="space-y-0.5 mb-2">
            <p className="text-xs text-stone-500 font-medium tracking-tight">
              Đơn tối thiểu {formatPrice(coupon.min_order_amount)}
            </p>
            {coupon.discount_type === 'PERCENT' && coupon.max_discount_amount && (
              <p className="text-[11px] text-orange-600 font-bold bg-orange-50 w-fit px-2 py-0.5 rounded-sm">
                Giảm tối đa {formatPrice(coupon.max_discount_amount)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-100 border-dashed">
            <span className="text-[10px] text-stone-400 font-medium">
              HSD: {new Date(coupon.end_date).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Phải: Selection */}
        <div className="w-12 flex items-center justify-center bg-stone-50/50">
          {isEligible ? (
             <Radio 
             checked={isSelected}
             onChange={() => onSelect(coupon)}
             sx={{ 
                 color: '#f97316', 
                 '&.Mui-checked': { color: '#ea580c' },
             }} 
           />
          ) : null}
        </div>
      </div>

      {/* Thông báo điều kiện */}
      {!isEligible && (
        <div className="px-2 mt-1">
          {!isMinOrderMet && (
            <div className="space-y-1">
              <div className="bg-red-50 p-2 text-[11px] text-red-600 flex justify-between border border-red-100 rounded-lg">
                <span className="font-medium">Chưa đạt mức tối thiểu: Cần mua thêm {formatPrice(remainingOrder)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
