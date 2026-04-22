import AvatarNav from './Avatar';
import { Button } from "@/components/ui/button";
import { Search, Heart, ShoppingCart, UserCircle, PackageX, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCart, deleteCartItem } from '@/store/slices/cart.slice';
import { useNavigate, Link } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';

const HeaderActions: React.FC<{ user: any; onLoginClick: () => void; isCompact?: boolean }> = ({ user, onLoginClick, isCompact }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector(state => state.cart);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  // Tính tổng số lượng thay vì đếm số item
  const cartItemsCount = cart?.items?.length || 0; 
  // Lấy 5 item cuối cùng thêm vào (vì TypeORM thường xếp item cũ ở đầu)
  const latestItems = cart?.items ? [...cart.items].reverse().slice(0, 5) : [];

  return (
  <div className="flex items-center justify-end flex-1 gap-2 sm:gap-4 text-stone-700">
    <NotificationBell />

    <Link to="/wishlist" className="p-2 hover:text-orange-600 hover:bg-stone-100 rounded-full transition-all hidden sm:block">
      <Heart size={20} />
    </Link>

    <div className="relative group/cart">
      <Link to="/cart" className="relative p-2.5 flex hover:bg-white border border-transparent hover:border-stone-200 rounded-xl transition-all h-full items-center">
        <ShoppingCart size={20} className="text-stone-700 group-hover/cart:text-orange-600 transition-colors" />
        {cartItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-700 text-[9px] font-bold text-white shadow-sm">
            {cartItemsCount > 9 ? '9+' : cartItemsCount}
          </span>
        )}
      </Link>

      {/* Mini Cart Dropdown hiện khi hover */}
      <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover/cart:opacity-100 group-hover/cart:visible transition-all duration-300 z-50">
        <div className="w-[360px] bg-white border border-stone-200 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="p-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
            <h4 className="font-bold text-sm text-stone-800">Sản phẩm mới thêm</h4>
            <span className="text-xs text-stone-500">{cartItemsCount} sản phẩm trong giỏ</span>
          </div>

          <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
            {latestItems.length > 0 ? (
              <div className="flex flex-col">
                {latestItems.map(item => (
                  <div key={item.cart_item_id} className="flex gap-3 p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <img 
                      src={item.imageUrl || '/placeholder.png'} 
                      alt="thumbnail" 
                      className="w-16 h-16 rounded border object-cover border-stone-200 bg-white" 
                    />
                    <div className="flex flex-col flex-1 overflow-hidden relative group/item">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-sm text-stone-800 line-clamp-2 leading-tight pr-6">
                          {item.product?.product_name || item.product?.productName || 'Sản phẩm'}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dispatch(deleteCartItem(item.cart_item_id));
                          }}
                          className="absolute right-0 top-0 text-stone-400 hover:text-red-500 bg-white rounded-full p-0.5 opacity-0 group-hover/item:opacity-100 transition-all border border-stone-100 shadow-sm"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {item.product_size && (
                        <span className="text-xs text-stone-500 mt-1">{item.product_size}</span>
                      )}
                      <div className="flex justify-between items-end mt-auto">
                        <span className="font-black text-orange-600 text-sm">
                          {formatPrice(item.currentPrice)}
                        </span>
                        <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                          x{item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-stone-400">
                <PackageX size={40} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">Chưa có sản phẩm</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-stone-100 flex gap-2">
            <Button 
              onClick={() => navigate('/cart')} 
              className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold h-11"
            >
              Xem giỏ hàng
            </Button>
          </div>
        </div>
      </div>
    </div>

    {!user && !isCompact ? (
      <Button
        onClick={onLoginClick}
        className="bg-[#f5f4ef] hover:bg-[#ebe8d8] text-stone-900 flex items-center gap-2 px-6 py-2 shadow-md transition-all animate-in fade-in"
      >
        <UserCircle className="w-5 h-5" />
        <span className="font-bold">Đăng nhập</span>
      </Button>
    ) : (
      <AvatarNav user={user} />
    )}
  </div>
  );
};

export default HeaderActions;