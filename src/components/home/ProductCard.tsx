import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ShoppingCart, Heart, Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleWishlist } from '@/store/slices/wishlist.slice';
import { upsertCartItem, fetchCart } from '@/store/slices/cart.slice';
import { wishlistService } from '@/services/wishlist.service';
import { reviewService } from '@/services/review.service';
import { trackingService, UserActionType } from '@/services/tracking.service';
import { toast } from 'react-toastify';
import type { ProductResponse } from '@/types/product.type';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const ProductCard: React.FC<{ product: ProductResponse }> = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reviewStats, setReviewStats] = useState<{ averageRating: number; totalReviews: number } | null>(null);

  useEffect(() => {
    if (product?.productId) {
      reviewService.getStatistics(product.productId)
        .then((res: any) => {
          if (res) {
            setReviewStats({
              averageRating: Number(res.averageRating || 0),
              totalReviews: Number(res.totalReviews || 0),
            });
          }
        })
        .catch(() => {
          setReviewStats({ averageRating: 0, totalReviews: 0 });
        });
    }
  }, [product?.productId]);

  useEffect(() => {
    if (product && user) {
      wishlistService.checkInWishlist(product.productId)
        .then((res: any) => setIsInWishlist(res.isInWishlist))
        .catch(() => setIsInWishlist(false));
    }
  }, [product, user]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      return toast.info('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích');
    }
    if (!product) return;
    try {
      const result = await dispatch(toggleWishlist(product.productId)).unwrap();
      setIsInWishlist(result.isInWishlist);
      toast.success(result.message);

      // --- LOGIC: TRACKING WISHLIST ---
      if (result.isInWishlist) {
        trackingService.track({
          actionType: UserActionType.ADD_TO_WISHLIST,
          productId: product.productId,
          userId: user?.id
        });
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if ((product as any).variants?.length > 0) {
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

  const thumb =
    product.images?.find((i) => i.isThumbnail)?.imageUrl ?? product.images?.[0]?.imageUrl;
  const hasDiscount = product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => navigate(`/products/${product.slug}`)}
      className="group flex flex-col bg-white rounded-3xl border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        {thumb ? (
          <img
            src={thumb}
            alt={product.productName}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${product.status === 'INACTIVE' ? 'grayscale opacity-50' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <Music size={48} />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-widest z-10 animate-pulse">
            -{discountPct}%
          </span>
        )}
        
        {/* Hết hàng Badge */}
        {product.status === 'INACTIVE' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-10">
            <span className="bg-white/90 text-stone-900 px-4 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-xl">Hết hàng</span>
          </div>
        )}

        {/* Nút Yêu thích (Góc trái dưới cùng) */}
        <button 
          onClick={handleToggleWishlist}
          className="absolute bottom-4 left-4 z-30 p-2 rounded-full bg-white/90 backdrop-blur shadow-md hover:bg-white hover:scale-110 transition-all duration-300"
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-stone-400 hover:text-red-500'}`} 
          />
        </button>
        
        {/* Nút Thêm nhanh vào giỏ */}
        {product.status !== 'INACTIVE' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 pointer-events-none">
            <button 
              onClick={handleAddToCart}
              className="bg-stone-900 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg pointer-events-auto"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {product.brand && (
          <span className="text-[10px] font-black tracking-widest uppercase text-orange-700">
            {product.brand.name}
          </span>
        )}
        <h3 className="text-sm font-bold text-stone-800 line-clamp-2 leading-snug group-hover:text-orange-700 transition-colors">
          {product.productName}
        </h3>
        {/* Rating & Review Count */}
        {reviewStats && reviewStats.totalReviews > 0 ? (
          <div className="flex items-center gap-1 text-xs text-orange-600 font-bold mt-1">
            <Star size={12} fill="currentColor" />
            <span>{reviewStats.averageRating.toFixed(1)}</span>
            <span className="text-stone-400 font-medium">({reviewStats.totalReviews} nhận xét)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-stone-400 mt-1">
            <Star size={12} className="text-stone-300" />
            <span className="font-medium">Chưa có đánh giá</span>
          </div>
        )}
        <div className="mt-auto pt-2 flex items-end gap-2">
          <span className="text-base font-black text-stone-900">{formatVND(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-stone-400 line-through">
              {formatVND(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
