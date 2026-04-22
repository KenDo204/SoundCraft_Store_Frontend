import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchCart, 
  updateCartItemQuantity, 
  deleteCartItem, 
  bulkDeleteCartItems, 
  clearCart
} from '@/store/slices/cart.slice';
import { Trash2, Plus, Minus, PackageX, Home, ShoppingBag, Ticket } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatPrice } from '@/lib/utils';
import { CouponModal } from './components/CouponModal';
import { clearPreviewResult } from '@/store/slices/coupon.slice';

export const Cart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cart, isLoading, isActionLoading } = useAppSelector(state => state.cart);
  const { previewResult } = useAppSelector(state => state.coupon);
  const { user } = useAppSelector(state => state.auth);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isCouponModalOpen, setCouponModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#fcfbf9]">
        <PackageX size={64} className="text-stone-300" />
        <h2 className="text-2xl font-black text-stone-800">Vui lòng đăng nhập</h2>
        <p className="text-stone-500">Bạn cần đăng nhập để xem giỏ hàng của mình</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-8 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const handleQuantityChange = async (itemId: number, newQty: number, maxAllowed: number) => {
    if (newQty < 1) return;
    if (newQty > maxAllowed) {
      toast.warning(`Chỉ có thể mua tối đa ${maxAllowed} sản phẩm`);
      return;
    }
    await dispatch(updateCartItemQuantity({ itemId, payload: { quantity: newQty } }));
  };


  const handleDelete = async (itemId: number) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      await dispatch(deleteCartItem(itemId));
      toast.success('Đã xóa sản phẩm');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (confirm(`Bạn có chắc muốn xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
      await dispatch(bulkDeleteCartItems({ cartItemIds: selectedItems }));
      setSelectedItems([]);
      toast.success('Đã xóa các sản phẩm');
    }
  };

  const toggleSelect = (itemId: number) => {
    setSelectedItems(prev => {
      const next = prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId];
      dispatch(clearPreviewResult());
      return next;
    });
  };

  const clearAll = async () => {
    if (confirm('Bạn có chắc muốn dọn sạch giỏ hàng?')) {
      await dispatch(clearCart());
      dispatch(clearPreviewResult());
      toast.success('Đã dọn sạch giỏ hàng');
    }
  };

  const items = cart?.items || [];
  const selectedTotalAmount = items
    .filter(item => selectedItems.includes(item.cart_item_id) && item.isAvailable)
    .reduce((acc, item) => acc + item.total_money, 0);

  return (
    <div className="min-h-screen bg-[#fcfbf9] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-stone-800 mb-8 uppercase tracking-widest flex items-center gap-3">
          <ShoppingBag size={32} className="text-orange-600" />
          Giỏ Hàng Của Bạn
        </h1>

        {isLoading && items.length === 0 ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center border border-stone-100 shadow-sm">
            <PackageX size={80} className="text-stone-200 mb-6" />
            <h2 className="text-2xl font-bold text-stone-700 mb-2">Giỏ hàng trống</h2>
            <p className="text-stone-500 mb-8 max-w-md text-center">Hãy dạo quanh cửa hàng và chọn cho mình những loại nhạc cụ ưng ý nhé!</p>
            <Link to="/products" className="bg-stone-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2">
              <Home size={20} /> Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cột Trái: Danh sách Sản phẩm */}
            <div className="flex-1 space-y-6">
              {/* Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    checked={selectedItems.length === items.filter(i=>i.isAvailable).length && items.filter(i=>i.isAvailable).length > 0}
                    onChange={(e) => setSelectedItems(e.target.checked ? items.filter(i=>i.isAvailable).map(i => i.cart_item_id) : [])}
                  />
                  <span className="font-bold text-stone-700">Chọn tất cả ({items.length})</span>
                </div>
                <div className="flex gap-4">
                  {selectedItems.length > 0 && (
                    <button onClick={handleBulkDelete} className="text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-1">
                      <Trash2 size={16} /> Xóa đã chọn ({selectedItems.length})
                    </button>
                  )}
                  <button onClick={clearAll} className="text-stone-500 hover:text-stone-800 font-bold text-sm flex items-center gap-1">
                    Dọn sạch giỏ
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className={`space-y-4 ${isActionLoading ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
                {items.map(item => (
                  <div key={item.cart_item_id} className={`bg-white rounded-2xl border ${selectedItems.includes(item.cart_item_id) ? 'border-orange-400 shadow-md' : 'border-stone-100 shadow-sm'} p-4 flex gap-4 transition-all relative overflow-hidden`}>
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <span className="bg-stone-900 text-white px-6 py-2 rounded-full font-bold shadow-xl">
                          {item.disableReason || 'Sản phẩm ngưng bán'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center z-20">
                      <input 
                        type="checkbox" 
                        disabled={!item.isAvailable}
                        checked={selectedItems.includes(item.cart_item_id)}
                        onChange={() => toggleSelect(item.cart_item_id)}
                        className="w-5 h-5 rounded border-stone-300 text-orange-600 focus:ring-orange-500 cursor-pointer disabled:opacity-50"
                      />
                    </div>
                    
                    <img src={item.imageUrl || '/placeholder.png'} alt="anh" className="w-24 h-24 rounded-xl object-cover bg-stone-50 z-20" 
                    onClick={() => navigate(`/products/${item.product.product_id}`)}
                    />
                    
                    <div className="flex-1 flex flex-col py-1 z-20">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-stone-800 line-clamp-1">{item.product?.product_name || item.product?.productName || 'Sản phẩm không xác định'}</h3>
                        <button onClick={() => handleDelete(item.cart_item_id)} className="text-stone-400 hover:text-red-500 transition-colors drop-shadow-sm bg-white rounded-full p-1">
                          <Trash2 size={20} />
                        </button>
                      </div>
                      

                      <div className="mt-auto flex justify-between items-end">
                        <span className="text-xl font-black text-orange-600">{formatPrice(item.currentPrice)}</span>
                        
                        {/* Box Số lượng */}
                        <div className="flex items-center bg-stone-50 rounded-lg border border-stone-200">
                          <button 
                            disabled={item.quantity <= 1 || !item.isAvailable}
                            onClick={() => handleQuantityChange(item.cart_item_id, item.quantity - 1, item.maxAllowedQuantity)}
                            className="p-2 hover:bg-stone-200 text-stone-600 rounded-l-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus size={16} strokeWidth={3} />
                          </button>
                          <span className="w-12 text-center font-bold text-stone-800">{item.quantity}</span>
                          <button 
                            disabled={item.quantity >= item.maxAllowedQuantity || !item.isAvailable}
                            onClick={() => handleQuantityChange(item.cart_item_id, item.quantity + 1, item.maxAllowedQuantity)}
                            className="p-2 hover:bg-stone-200 text-stone-600 rounded-r-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột Phải: Tổng quan thanh toán */}
            <div className="lg:w-[380px]">
              <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 sticky top-28">
                <h3 className="font-bold text-xl text-stone-800 mb-6">Tổng đơn hàng</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-stone-600">
                    <span className="font-medium">Tạm tính ({selectedItems.length} SP)</span>
                    <span className="font-bold">{formatPrice(selectedTotalAmount)}</span>
                  </div>
                  {previewResult && (
                    <div className="flex justify-between text-teal-600 font-medium">
                      <span>Mã giảm giá ({previewResult.couponCode})</span>
                      <span className="font-bold border border-teal-200 bg-teal-50 px-2 py-0.5 rounded-md">- {formatPrice(previewResult.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600">
                    <span className="font-medium">Phí giao hàng</span>
                    <span className="text-stone-400 italic text-sm">Cập nhật lúc thanh toán</span>
                  </div>
                </div>

                <div className="mb-6">
                  <button 
                    onClick={() => setCouponModalOpen(true)}
                    className="w-full flex items-center justify-between border-2 border-dashed border-stone-200 p-3 rounded-xl hover:border-orange-500 hover:bg-orange-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-stone-700">
                      <Ticket size={20} className="text-orange-500" />
                      <span className="font-bold text-sm">
                        {previewResult ? `Đã áp dụng: ${previewResult.couponCode}` : 'Áp dụng mã giảm giá'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
                      {previewResult ? 'Đổi mã' : 'Chọn/Nhập mã'}
                    </span>
                  </button>
                </div>
                
                <div className="border-t border-stone-100 pt-6 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-stone-800">Tổng cộng</span>
                    <div className="text-right">
                      <div className="text-3xl font-black text-orange-600">
                        {previewResult ? formatPrice(previewResult.finalTotal) : formatPrice(selectedTotalAmount)}
                      </div>
                      <span className="text-xs text-stone-400 italic">(Đã bao gồm VAT nếu có)</span>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={selectedItems.length === 0}
                  onClick={() => navigate('/checkout', { state: { selectedItems } })}
                  className="w-full bg-stone-900 text-white h-14 rounded-xl font-black text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  Mua Hàng
                </button>
                
                {selectedItems.length === 0 && (
                  <p className="text-center text-sm font-medium text-stone-500 mt-4">Vui lòng chọn sản phẩm để mua</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <CouponModal 
        open={isCouponModalOpen} 
        onClose={() => setCouponModalOpen(false)} 
        cartTotal={selectedTotalAmount} 
      />
    </div>
  );
};