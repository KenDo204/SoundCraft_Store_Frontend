import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleWishlist } from '@/store/slices/wishlist.slice';
import { upsertCartItem, fetchCart } from '@/store/slices/cart.slice';
import { toast } from 'react-toastify';
import { formatPrice } from '@/lib/utils';

export const ProductCard = ({ product }: { product: any }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { items: wishlistItems } = useAppSelector(state => state.wishlist);

  const isGlobalWishlist = wishlistItems.some(item => item.productId === product.productId);
  const [isInWishlist, setIsInWishlist] = useState(isGlobalWishlist);

  // Đồng bộ lại local state nếu global state thay đổi
  useEffect(() => {
    setIsInWishlist(isGlobalWishlist);
  }, [isGlobalWishlist]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    // ĐỔI MÀU LẬP TỨC (Optimistic Update)
    setIsInWishlist(!isInWishlist);

    try {
      const result = await dispatch(toggleWishlist(product.productId)).unwrap();
      setIsInWishlist(result.isInWishlist);
      if (result.isInWishlist) {
          toast.success('Đã thêm vào mục yêu thích!');
      }
      else {
        toast.success('Đã xóa khỏi mục yêu thích!');
      }
    } catch (error: any) {
      // Rollback nếu API lỗi
      setIsInWishlist(isGlobalWishlist);
      toast.error(error);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (product.variants?.length > 0) {
      toast.info('Vui lòng chọn phân loại trước khi thêm vào giỏ');
      navigate(`/products/${product.productId}`);
      return;
    }

    if (!user) {
      toast.info('Vui lòng đăng nhập để mua hàng');
      return;
    }

    try {
      await dispatch(upsertCartItem({
        productId: product.productId,
        quantity: 1
      })).unwrap();
      toast.success('Đã thêm nhanh vào giỏ hàng!');
      await dispatch(fetchCart()).unwrap();
    } catch (error: any) {
      toast.error(error);
    }
  };

  const thumbnail = product.images?.find((img: any) => img.isThumbnail)?.imageUrl 
                    || product.images?.[0]?.imageUrl 
                    || product.variants?.find((v: any) => v.imageUrl)?.imageUrl
                    || '/placeholder.png';

  return (
    <div 
      onClick={() => navigate(`/products/${product.productId}`)}
      className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img 
          src={thumbnail} 
          alt={product.productName} 
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${product.status === 'INACTIVE' ? 'grayscale opacity-50' : ''}`}
        />
        {/* Hết hàng Badge */}
        {product.status === 'INACTIVE' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <span className="bg-white/90 text-stone-900 px-4 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-xl">Hết hàng</span>
          </div>
        )}

        {/* Nút Yêu thích (Góc trái dưới cùng) */}
        <button 
          onClick={handleToggleWishlist}
          className="absolute bottom-4 left-4 z-20 p-2 rounded-full bg-white/90 backdrop-blur shadow-md hover:bg-white hover:scale-110 transition-all duration-300"
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-stone-400 hover:text-red-500'}`} 
          />
        </button>
        {/* Nút Thêm nhanh vào giỏ */}
        {product.status !== 'INACTIVE' && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button 
              onClick={handleAddToCart}
              className="bg-stone-900 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">
          {product.brand?.name || 'Sound Craft'}
        </span>
        <h3 className="font-bold text-stone-800 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
          {product.productName}
        </h3>

        <div className="mt-auto flex flex-col">
          {product.originalPrice > product.price && (
            <span className="text-xs text-stone-400 line-through mb-0.5">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <span className="font-black text-lg text-orange-600">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
      
      {/* Discount Badge */}
      {product.originalPrice > product.price && (
        <div className="absolute top-4 left-4 bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-widest z-10 animate-pulse">
          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
        </div>
      )}
    </div>
  );
};