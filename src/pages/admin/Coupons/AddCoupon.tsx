import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createCouponAdmin } from '@/store/slices/coupon.slice';
import { DiscountType } from '@/types/coupon.type';
import { Button, TextField, MenuItem, CircularProgress, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/config/paths';
import { Ticket, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

// Helper: chuyển Date sang format datetime-local (respects timezone)
const toLocalInputValue = (date: Date): string =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export const AddCoupon = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isActionLoading } = useAppSelector(state => state.coupon);

  // Khai báo type rõ ràng để TypeScript không narrow discountType thành literal 'FIXED'
  type CouponFormData = {
    code: string;
    discountType: typeof DiscountType[keyof typeof DiscountType];
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount: number;
    maxUsage: number;
    maxUsagePerUser: number;
    startDate: string;
    endDate: string;
  };

  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    discountType: DiscountType.FIXED_AMOUNT,
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    maxUsage: 10,
    maxUsagePerUser: 1,
    startDate: toLocalInputValue(new Date()),
    endDate: ''
  });

  const MAX_MONEY = 120_000_000;

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const stringFields = ['code', 'startDate', 'endDate', 'discountType'];
    setFormData(prev => {
      if (stringFields.includes(name)) {
        // Sanitize đặc biệt cho trường 'code': chỉ giữ A-Z và 0-9
        const sanitized = name === 'code'
          ? value.toUpperCase().replace(/[^A-Z0-9]/g, '')
          : value;
        return { ...prev, [name]: sanitized };
      }

      // Xóa dấu chấm ngăn nghìn (vi-VN) trước khi parse
      let num = Number(value.replace(/\./g, '')) || 0;

      // Clamp: giới hạn tối đa theo từng trường
      if (name === 'minOrderAmount' || name === 'maxDiscountAmount') {
        num = Math.min(num, MAX_MONEY);
      }
      if (name === 'discountValue') {
        if (prev.discountType === DiscountType.PERCENTAGE) {
          num = Math.min(num, 100); // % không vượt 100
        } else {
          num = Math.min(num, MAX_MONEY);
        }
      }
      if (name === 'maxUsagePerUser') num = Math.min(num, 5);
      if (name === 'maxUsage') num = Math.min(num, 200_000);

      return { ...prev, [name]: num };
    });
  };

  // =========== VALIDATION ===========
  const validateForm = (): string | null => {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount,
            maxUsage, maxUsagePerUser, startDate, endDate } = formData;

    if (!code || !/^[A-Z0-9]+$/.test(code))
      return 'Mã code không hợp lệ. Chỉ dùng chữ hoa và số, không có khoảng trắng.';

    if (discountValue <= 0)
      return 'Vui lòng nhập giá trị giảm hợp lệ.';

    if (discountType === DiscountType.PERCENTAGE) {
      if (discountValue < 1 || discountValue > 69)
        return 'Mức giảm phần trăm phải từ 1% đến 69%.';
      if (maxDiscountAmount < 0 || maxDiscountAmount > discountValue / 100 * 10000000)
        return 'Mức giảm tối đa không hợp lệ.';
    } else {
      if (discountValue < 1000)
        return 'Giá trị giảm tiền mặt tối thiểu là 1.000đ.';
      if (minOrderAmount > 0 && discountValue > minOrderAmount * 0.69)
        return 'Giá trị giảm không được vượt quá 69% giá trị đơn tối thiểu.';
    }

    if (minOrderAmount < 0)
      return 'Giá trị đơn tối thiểu không thể âm.';
    if (discountType === DiscountType.PERCENTAGE && minOrderAmount > discountValue * 0.69)
      return 'Giá trị đơn tối thiểu không được vượt quá mức giảm tối đa.';
    if (discountType === DiscountType.FIXED_AMOUNT && minOrderAmount > 120_000_000)
      return 'Giá trị đơn tối thiểu không vượt quá 120.000.000đ.';

    if (maxUsage < 1)
      return 'Số lượng mã phát hành tối thiểu là 1.';

    if (maxUsagePerUser < 1 || maxUsagePerUser > 5)
      return 'Số lượt dùng/user phải từ 1 đến 5.';

    if (!startDate)
      return 'Vui lòng chọn ngày bắt đầu.';
    if (new Date(startDate) < new Date(new Date().setSeconds(0, 0)))
      return 'Thời gian bắt đầu phải lớn hơn hoặc bằng thời điểm hiện tại.';

    if (!endDate)
      return 'Vui lòng chọn ngày kết thúc.';
    if (new Date(endDate).getTime() < new Date(startDate).getTime() + 3_600_000)
      return 'Thời gian kết thúc phải sau bắt đầu ít nhất 1 giờ.';

    return null; // Hợp lệ
  };

  // =========== SUBMIT ===========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errorMsg = validateForm();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    try {
      const payload: any = { ...formData };
      if (payload.discountType === DiscountType.FIXED_AMOUNT) {
          delete payload.maxDiscountAmount;
      }
      payload.startDate = new Date(payload.startDate).toISOString();
      payload.endDate = new Date(payload.endDate).toISOString();

      await dispatch(createCouponAdmin(payload)).unwrap();
      toast.success('Tạo mã giảm giá thành công');
      navigate(PATHS.ADMIN_COUPONS);
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(PATHS.ADMIN_COUPONS)} className="flex items-center gap-2 text-stone-500 hover:text-orange-600 mb-6 font-medium transition-colors">
          <ArrowLeft size={18} /> Quay lại danh sách
        </button>

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 bg-stone-50 flex items-center gap-3">
              <Ticket className="text-orange-500" />
              <h1 className="text-xl font-bold text-stone-800">Tạo Mã Giảm Giá Mới</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <TextField 
                  label="Mã Code (Chỉ chữ HOA & số)" 
                  name="code" 
                  required 
                  value={formData.code} 
                  onChange={handleChange} 
                  inputProps={{ style: { textTransform: 'uppercase' } }}
              />
              <TextField 
                  select 
                  label="Loại giảm giá" 
                  name="discountType" 
                  required 
                  value={formData.discountType} 
                  onChange={handleChange}
                  InputProps={{ sx: { borderRadius: '12px' } }}
              >
                <MenuItem value={DiscountType.FIXED_AMOUNT}>Giảm tiền mặt (đ)</MenuItem>
                <MenuItem value={DiscountType.PERCENTAGE}>Giảm phần trăm (%)</MenuItem>
              </TextField>

              <TextField 
                label="Giá trị đơn tối thiểu (đ)" 
                name="minOrderAmount" 
                type="text" 
                required 
                value={formData.minOrderAmount === 0 ? '' : new Intl.NumberFormat('vi-VN').format(formData.minOrderAmount)}
                InputProps={{
                    sx: { borderRadius: '12px' },
                    endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>
                }}
                onChange={handleChange} 
                error={formData.minOrderAmount < 0 || (formData.discountType === DiscountType.FIXED_AMOUNT && formData.minOrderAmount > 120000000)}
                helperText={formData.discountType === DiscountType.FIXED_AMOUNT && formData.minOrderAmount > 120000000 ? 'Giá trị đơn tối thiểu không được vượt quá 120.000.000 VNĐ' : 'Giá trị đơn hàng tối thiểu 1000 VNĐ'}
              />

              <TextField 
                  label="Giá trị giảm" 
                  name="discountValue" 
                  type="text" 
                  required 
                  value={formData.discountValue === 0 ? '' : new Intl.NumberFormat('vi-VN').format(formData.discountValue)}
                  error={
                    formData.discountType === DiscountType.PERCENTAGE
                    ? (formData.discountValue > 0 && formData.discountValue < 1) || formData.discountValue > 69
                    : (formData.discountValue > 0 && formData.discountValue < 120000000) || (formData.minOrderAmount > 0 && formData.discountValue > formData.minOrderAmount * 0.69)
                  }
                  onChange={handleChange} 
                  InputProps={{
                      sx: { borderRadius: '12px' },
                      endAdornment: formData.discountType === DiscountType.PERCENTAGE ? <InputAdornment position="end">%</InputAdornment> : <InputAdornment position="end">VNĐ</InputAdornment>
                  }}
              />
              {formData.discountType === DiscountType.PERCENTAGE && (
                <TextField 
                  label="Mức giảm tối đa (đ)" 
                  name="maxDiscountAmount" 
                  type="text" 
                  value={formData.maxDiscountAmount === 0 ? '' : new Intl.NumberFormat('vi-VN').format(formData.maxDiscountAmount)} 
                  onChange={handleChange} 
                  error={formData.maxDiscountAmount < 0 || formData.maxDiscountAmount > formData.discountValue * 0.69}
                  helperText={formData.maxDiscountAmount > formData.discountValue * 0.69 ? 'Mức giảm tối đa không được vượt quá 69% giá trị mã giảm' : 'Nhập giới hạn số tiền được giảm tối đa'}
                  InputProps={{
                      sx: { borderRadius: '12px' },
                      endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>
                  }}
                />
              )}

              <TextField 
                  label="Số lượng mã tự định" 
                  name="maxUsage" 
                  type="text" 
                  required 
                  value={formData.maxUsage === 0 ? '' : new Intl.NumberFormat('vi-VN').format(formData.maxUsage)}
                  onChange={handleChange} 
                  error={formData.maxUsage > 0 && formData.maxUsage < 1}
                  helperText="Số lượng mã phát hành từ 1 đến 200.000"
                  InputProps={{ sx: { borderRadius: '12px' } }}
              />
              <TextField 
                  label="Số lượt dùng/User" 
                  name="maxUsagePerUser" 
                  type="number" 
                  required 
                  value={formData.maxUsagePerUser === 0 ? '' : formData.maxUsagePerUser}
                  onChange={handleChange} 
                  error={formData.maxUsagePerUser > 0 && (formData.maxUsagePerUser < 1 || formData.maxUsagePerUser > 5)}
                  helperText="Mỗi người dùng tối thiểu 1, tối đa 5 lần"
                  InputProps={{ 
                      sx: { borderRadius: '12px' },
                      inputProps: { min: 1, max: 5 }
                  }}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <TextField 
                  label="Ngày bắt đầu" 
                  name="startDate" 
                  type="datetime-local" 
                  required 
                  InputLabelProps={{ shrink: true }}
                  value={formData.startDate} 
                  onChange={handleChange} 
                  error={formData.startDate !== '' && new Date(formData.startDate) < new Date(new Date().setSeconds(0, 0))}
                  helperText={formData.startDate !== '' && new Date(formData.startDate) < new Date(new Date().setSeconds(0, 0)) ? "Thời gian bắt đầu phải lớn hơn thời gian hiện tại" : ""}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  inputProps={{ 
                      min: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) 
                  }}
              />
              <TextField 
                  label="Ngày kết thúc" 
                  name="endDate" 
                  type="datetime-local" 
                  required 
                  InputLabelProps={{ shrink: true }}
                  value={formData.endDate} 
                  onChange={handleChange} 
                  error={formData.startDate !== '' && formData.endDate !== '' && new Date(formData.endDate).getTime() < new Date(formData.startDate).getTime() + 3600000}
                  helperText={formData.startDate !== '' && formData.endDate !== '' && new Date(formData.endDate).getTime() < new Date(formData.startDate).getTime() + 3600000 ? "Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 1 giờ" : ""}
                  InputProps={{ sx: { borderRadius: '12px' } }}
                  inputProps={{ 
                  min: formData.startDate 
                      ? new Date(new Date(formData.startDate).getTime() + 3600000 - new Date(formData.startDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                      : new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) 
                  }}
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <Button
                type="submit"
                variant="contained"
                disabled={isActionLoading}
                sx={{
                  bgcolor: '#ea580c',
                  py: 1.5,
                  px: 4,
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#c2410c' }
                }}
              >
                {isActionLoading ? <CircularProgress size={24} color="inherit" /> : 'Lưu mã giảm giá'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
