import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@mui/material';
import { formatPrice } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';
import { fetchCart } from '@/store/slices/cart.slice';
import { clearPreviewResult } from '@/store/slices/coupon.slice';

export const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'success' | 'failed' | 'loading'>('loading');
  const [isCOD, setIsCOD] = useState(false);
  
  // Thông tin bổ sung hiển thị
  const [orderInfo, setOrderInfo] = useState<{ code: string; amount: number } | null>(null);

  useEffect(() => {
    // 1. Kiểm tra nếu có dữ liệu đơn hàng truyền từ trang Checkout (Thường là COD)
    const directOrder = location.state?.orderData;
    if (directOrder) {
      setIsCOD(directOrder.paymentMethod === 'COD');
      setOrderInfo({ code: directOrder.orderCode || `#${directOrder.id}`, amount: directOrder.totalAmount });
      setStatus('success');
      return;
    }

    // 2. Kiểm tra nếu là VNPAY Redirect về
    const responseCode = searchParams.get('vnp_ResponseCode');
    const txnRef = searchParams.get('vnp_TxnRef');
    const amount = searchParams.get('vnp_Amount');

    if (txnRef && amount) {
      setOrderInfo({ code: txnRef, amount: Number(amount) / 100 });
    }

    if (responseCode === '00') {
      setStatus('success');
      dispatch(clearPreviewResult());
      dispatch(fetchCart());
    } else if (responseCode) {
      setStatus('failed');
    } else {
      setStatus('loading');
      const timer = setTimeout(() => setStatus('failed'), 1000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, location.state]);

  return (
    <div className="min-h-[70vh] bg-[#fcfbf9] flex flex-col items-center justify-center p-4">
      {status === 'loading' ? (
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      ) : status === 'success' ? (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center max-w-md w-full text-center">
           <CheckCircle className="text-green-500 w-20 h-20 mb-4" />
           <h1 className="text-2xl font-black text-stone-800 mb-2">
             {isCOD ? 'Đặt hàng thành công!' : 'Thanh toán thành công!'}
           </h1>
           <p className="text-stone-500 mb-6">
             {isCOD 
               ? 'Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ sớm liên hệ để xác nhận và giao hàng.'
               : 'Đơn hàng của bạn đã được thanh toán qua VNPAY an toàn. Đơn hàng đang được chúng tôi xử lý.'
             }
           </p>

           {orderInfo && (
             <div className="bg-stone-50 rounded-2xl p-4 w-full mb-8 space-y-2 border border-stone-100">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">Mã đơn hàng:</span>
                  <span className="font-bold text-stone-700">{orderInfo.code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">Số tiền:</span>
                  <span className="font-bold text-orange-600 font-mono text-lg">{formatPrice(orderInfo.amount)}</span>
                </div>
             </div>
           )}

           <div className="flex flex-col gap-3 w-full">
              <Button 
                variant="contained" 
                onClick={() => navigate('/account/orders')}
                sx={{ bgcolor: '#ea580c', color: 'white', '&:hover': { bgcolor: '#c2410c' }, borderRadius: '12px', fontWeight: 'bold', py: 1.5 }}
              >
                Xem đơn hàng của tôi
              </Button>
              <Button 
                variant="text" 
                onClick={() => navigate('/')}
                sx={{ color: '#57534e', borderRadius: '12px', fontWeight: 'bold' }}
              >
                Quay lại trang chủ
              </Button>
           </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center max-w-md w-full text-center">
          <XCircle className="text-red-500 w-20 h-20 mb-4" />
          <h1 className="text-2xl font-black text-stone-800 mb-2">
            {isCOD ? 'Đặt hàng thất bại' : 'Thanh toán thất bại'}
          </h1>
          <p className="text-stone-500 mb-8">
            {isCOD
              ? 'Đã xảy ra lỗi trong quá trình xử lý đơn hàng. Vui lòng thử lại sau.'
              : 'Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra. Vui lòng kiểm tra lại số dư thẻ hoặc thử lại.'
            }
          </p>
          <Button 
            variant="contained" 
            onClick={() => navigate('/cart')}
            startIcon={<ArrowLeft />}
            sx={{ bgcolor: '#1c1917', color: 'white', '&:hover': { bgcolor: '#292524' }, borderRadius: '12px', fontWeight: 'bold', py: 1.5, width: '100%' }}
          >
            Quay lại Giỏ hàng
          </Button>
        </div>
      )}
    </div>
  );
};
