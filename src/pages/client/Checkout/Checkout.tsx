import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAddresses } from '@/store/slices/address.slice';
import { checkoutSession } from '@/store/slices/order.slice';
import { fetchCart } from '@/store/slices/cart.slice';
import { clearPreviewResult } from '@/store/slices/coupon.slice';
import { toast } from 'react-toastify';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, MapPin, Truck, ShieldCheck, CheckCircle2, Ticket } from 'lucide-react';
import { Button, Radio, CircularProgress } from '@mui/material';
import { PATHS } from '@/config/paths';
import { CouponModal } from '../Cart/components/CouponModal';

export const Checkout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useAppSelector(state => state.cart);
  const { list: addresses, isLoading: isAddressLoading } = useAppSelector(state => state.addresses);
  const { isActionLoading } = useAppSelector(state => state.orders); // fixed slice name mapping
  const { previewResult } = useAppSelector(state => state.coupon);

  // Lấy các id item được chọn từ trang Cart
  const selectedItemIds: number[] = location.state?.selectedItems || [];

  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [orderNote, setOrderNote] = useState('');
  const [isCouponModalOpen, setCouponModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (addresses && addresses.length > 0 && selectedAddressId === 0) {
      const defaultAddr = addresses.find(a => a.isDefault);
      setSelectedAddressId(defaultAddr ? defaultAddr.addressId : addresses[0].addressId);
    }
  }, [addresses, selectedAddressId]);

  if (selectedItemIds.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">Bạn chưa chọn sản phẩm nào để thanh toán.</h2>
        <Button variant="contained" onClick={() => navigate('/cart')}>Quay lại giỏ hàng</Button>
      </div>
    );
  }

  // Lọc ra các item đang thanh toán 
  const checkoutItems = cart?.items.filter(item => selectedItemIds.includes(item.cart_item_id)) || [];
  const subTotal = checkoutItems.reduce((acc, item) => acc + item.total_money, 0);

  const shippingFee = 35000;
  const discountAmount = previewResult?.discountAmount || 0;
  const totalAmount = subTotal + shippingFee - discountAmount;

  const payloadSelectedItems = checkoutItems.map(item => ({
    id: Number(item.cart_item_id),
    productId: Number(item.product?.product_id || item.product?.productId || 0),
    quantity: item.quantity,
    size: item.product_size, // this exists in CartItemResponse if applicable
    totalMoney: item.total_money,
    note: item.note
  }));

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.warning('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    try {
      const result = await dispatch(checkoutSession({
        selectedItems: payloadSelectedItems,
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: previewResult?.couponCode,
        orderNote,
        totalAmount,
        shippingFee,
        discountAmount
      })).unwrap();

      if (paymentMethod === 'VNPAY' && result?.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        toast.success("Đặt hàng thành công!");
        dispatch(clearPreviewResult());
        dispatch(fetchCart());
        navigate(PATHS.PAYMENT_RESULT, { state: { orderData: result } });
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <button onClick={() => navigate(-1)} className="flex items-center text-sm font-bold text-stone-500 hover:text-stone-900 mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Quay lại
        </button>

        <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-8">Thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Cột trái: Thông tin giao hàng & Thanh toán */}
          <div className="flex-1 space-y-6">

            {/* Địa chỉ */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-orange-600" />
                <h2 className="text-lg font-bold text-stone-800">Địa chỉ giao hàng</h2>
              </div>

              {isAddressLoading ? (
                <CircularProgress size={24} />
              ) : addresses.length === 0 ? (
                <div className="text-sm text-red-500">Bạn chưa có địa chỉ nào. Vui lòng thêm trong trang cá nhân.</div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div
                      key={addr.addressId}
                      onClick={() => setSelectedAddressId(addr.addressId)}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.addressId ? 'border-orange-500 bg-orange-50/50' : 'border-stone-100 hover:border-orange-200'}`}
                    >
                      <Radio checked={selectedAddressId === addr.addressId} sx={{ p: 0, color: '#f97316', '&.Mui-checked': { color: '#ea580c' } }} />
                      <div>
                        <p className="font-bold text-stone-800 mb-1">
                          {addr.recipientName} <span className="text-stone-400 font-normal">({addr.phone})</span>
                          {addr.isDefault && <span className="ml-2 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">Mặc định</span>}
                        </p>
                        <p className="text-sm text-stone-600">{addr.fullAddress}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ghi chú */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
              <h2 className="text-lg font-bold text-stone-800 mb-4">Ghi chú đơn hàng</h2>
              <textarea
                className="w-full border border-stone-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                rows={3}
                placeholder="Ghi chú về thời gian giao hàng, địa điểm... (Không bắt buộc)"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              ></textarea>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
              <h2 className="text-lg font-bold text-stone-800 mb-4">Phương thức thanh toán</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50/30' : 'border-stone-100'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-stone-800 tracking-tight">Thanh toán khi nhận hàng</span>
                    {paymentMethod === 'COD' && <CheckCircle2 className="text-blue-500" size={20} />}
                  </div>
                  <span className="text-xs text-stone-500">Phí thu hộ tùy thuộc đơn vị vận chuyển</span>
                </div>

                <div
                  onClick={() => setPaymentMethod('VNPAY')}
                  className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden ${paymentMethod === 'VNPAY' ? 'border-blue-500 bg-blue-50/30' : 'border-stone-100'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-stone-800 tracking-tight">Thanh toán VNPAY</span>
                    {paymentMethod === 'VNPAY' && <CheckCircle2 className="text-blue-500" size={20} />}
                  </div>
                  <span className="text-xs text-stone-500">Thẻ ATM, Visa, MasterCard, VNPAY-QR</span>
                </div>
              </div>
            </div>

          </div>

          {/* Cột phải: Đơn hàng */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6 sticky top-28">
              <h3 className="font-bold text-xl text-stone-800 mb-6 border-b border-stone-100 pb-4">Tóm tắt đơn hàng</h3>

              <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {checkoutItems.map(item => (
                  <div key={item.cart_item_id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-stone-50 border border-stone-100 overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt="prod" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-stone-800 line-clamp-2">{item.product?.productName || item.product?.product_name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-medium text-stone-500">SL: {item.quantity}</span>
                        <span className="text-sm font-bold text-orange-600">{formatPrice(item.total_money)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 border-t border-stone-100 pt-4">
                <div className="flex justify-between text-stone-600 font-medium">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subTotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600 font-medium">
                  <span>Phí giao hàng</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>

                <div className="py-2">
                   <button 
                     onClick={() => setCouponModalOpen(true)}
                     className="w-full flex items-center justify-between border-2 border-dashed border-stone-200 p-3 rounded-xl hover:border-orange-500 hover:bg-orange-50/50 transition-colors"
                   >
                     <div className="flex items-center gap-2 text-stone-700">
                       <Ticket size={18} className="text-orange-500" />
                       <span className="font-bold text-xs">
                         {previewResult ? `Mã: ${previewResult.couponCode}` : 'Áp dụng mã giảm giá'}
                       </span>
                     </div>
                     <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
                       {previewResult ? 'Đổi mã' : 'Chọn mã'}
                     </span>
                   </button>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Giảm giá ({previewResult?.couponCode})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end border-t border-stone-100 pt-4 mt-2">
                  <span className="font-bold text-stone-800">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-orange-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isActionLoading || !selectedAddressId}
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: '#1c1917', color: 'white', borderRadius: '12px', py: 2,
                  fontWeight: 'bold', fontSize: '16px', '&:hover': { bgcolor: '#ea580c' }
                }}
              >
                {isActionLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPAY' : 'Đặt hàng COD')}
              </Button>

              <div className="mt-6 flex flex-col gap-2 border-t border-stone-100 pt-4 cursor-default">
                <div className="flex items-center gap-2 text-stone-500"><ShieldCheck size={16} /> <span className="text-xs font-medium">Thanh toán bảo mật an toàn 100%</span></div>
                <div className="flex items-center gap-2 text-stone-500"><Truck size={16} /> <span className="text-xs font-medium">Giao hàng toàn quốc từ 2-4 ngày</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <CouponModal 
        open={isCouponModalOpen} 
        onClose={() => setCouponModalOpen(false)} 
        cartTotal={subTotal} 
      />
    </div>
  );
};
