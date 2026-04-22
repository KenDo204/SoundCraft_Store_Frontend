import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductById, fetchProducts } from '@/store/slices/product.slice'; // fetchProducts dùng để gọi SP tương tự
import { ProductCard } from './components/ProductCard';
import { ShoppingCart, Star, ShieldCheck, Truck, Heart, Loader2 } from 'lucide-react';
import { toggleWishlist } from '@/store/slices/wishlist.slice';
import { upsertCartItem } from '@/store/slices/cart.slice';
import { wishlistService } from '@/services/wishlist.service';
import { toast } from 'react-toastify';
import { formatPrice } from '@/lib/utils';
import { trackingService, UserActionType } from '@/services/tracking.service';

export const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, isLoading } = useAppSelector(state => state.products);
  const { list: allProducts } = useAppSelector(state => state.products);
  const { user } = useAppSelector(state => state.auth);

  const [mainImage, setMainImage] = useState<string>('');

  const [quantity, setQuantity] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // 1. Load Data
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id, dispatch]);

  // 2. Set Default UI & Lịch sử Đã xem khi có data
  useEffect(() => {
    if (product) {
      // Set ảnh mặc định
      const thumb = product.images?.find((img: any) => img.isThumbnail)?.imageUrl || product.images?.[0]?.imageUrl;
      setMainImage(thumb || '/placeholder.png');


      setQuantity(1);

      // --- LOGIC: SẢN PHẨM ĐÃ XEM (Recently Viewed) ---
      const historyStr = localStorage.getItem('recently_viewed');
      let historyArr = historyStr ? JSON.parse(historyStr) : [];

      // Lọc bỏ sản phẩm hiện tại nếu đã có trong lịch sử (để đưa nó lên đầu)
      historyArr = historyArr.filter((item: any) => item.productId !== product.productId);

      // Thêm SP hiện tại vào đầu mảng (Lưu object cơ bản để nhẹ máy)
      const viewedItem = {
        productId: product.productId,
        productName: product.productName,
        price: product.price,
        images: product.images,
        brand: product.brand
      };
      historyArr.unshift(viewedItem);

      // Giữ tối đa 10 sản phẩm
      if (historyArr.length > 10) historyArr.pop();

      localStorage.setItem('recently_viewed', JSON.stringify(historyArr));
      setRecentlyViewed(historyArr.filter((item: any) => item.productId !== product.productId)); // Không hiện chính nó ở mục đã xem

      // --- LOGIC: TRACKING VIEW ---
      trackingService.track({
        actionType: UserActionType.VIEW_PRODUCT,
        productId: product.productId,
        userId: user?.id,
        contextData: { category: product.category?.name }
      });
    }
  }, [product]);

  // 3. Load Sản phẩm tương tự (Mock: Lấy list sp mới nhất)
  useEffect(() => {
    if (product) {
      // Tùy thuộc vào cấu trúc BE trả về brand.id hay brand.brandId
      const currentBrandId = product.brand?.id;

      if (currentBrandId) {
        dispatch(fetchProducts({ limit: 5, brandId: currentBrandId }));
      } else {
        // Fallback: Nếu sản phẩm không có thương hiệu thì lấy random/mới nhất
        dispatch(fetchProducts({ limit: 5 }));
      }
    }
  }, [dispatch, product]);

  // 4. Kiểm tra trạng thái yêu thích
  useEffect(() => {
    if (product && user) {
      wishlistService.checkInWishlist(product.productId)
        .then((res: any) => setIsInWishlist(res.isInWishlist))
        .catch(() => setIsInWishlist(false));
    }
  }, [product, user]);

  const handleToggleWishlist = async () => {
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

  if (isLoading || !product) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fcfbf9]"><Loader2 className="w-12 h-12 animate-spin text-orange-600" /></div>;
  }

  // Lấy giá và tồn kho hiển thị
  const displayPrice = product.price;
  const displayStock = product.stockQuantity;

  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }
    


    try {
      await dispatch(upsertCartItem({
        productId: product.productId,
        quantity: quantity
      })).unwrap();
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');

      // --- LOGIC: TRACKING CART ---
      trackingService.track({
        actionType: UserActionType.ADD_TO_CART,
        productId: product.productId,
        userId: user?.id,
        contextData: { quantity }
      });
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ======================= CHI TIẾT SẢN PHẨM ======================= */}
        <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-sm border border-stone-100 flex flex-col lg:flex-row gap-10 lg:gap-16 mb-16">

          {/* CỘT TRÁI: THƯ VIỆN ẢNH */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="w-full aspect-square bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden">
              <img src={mainImage} alt={product.productName} className="w-full h-full object-cover" />
            </div>
            {/* Ảnh nhỏ */}
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
              {product.images?.map((img: any) => (
                <div
                  key={img.imageId}
                  onClick={() => setMainImage(img.imageUrl)}
                  className={`w-20 h-20 rounded-xl cursor-pointer overflow-hidden border-2 flex-shrink-0 transition-all ${mainImage === img.imageUrl ? 'border-orange-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN & MUA HÀNG */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <span className="text-sm font-black text-orange-600 tracking-widest uppercase mb-2">{product.brand?.name}</span>
            <h1 className="text-3xl lg:text-4xl font-black text-stone-900 leading-tight mb-4">{product.productName}</h1>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100">
              <div className="flex text-orange-400"><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /><Star size={18} fill="currentColor" /></div>
              <span className="text-stone-500 text-sm">| Đã bán: 120+</span>
            </div>

            <div className="mb-8 flex items-end gap-4">
              <div className="flex flex-col">
                {product.originalPrice > displayPrice && (
                  <span className="text-lg text-stone-400 line-through font-medium">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-4xl font-black text-stone-900">{formatPrice(displayPrice)}</span>
              </div>
              
              {product.originalPrice > displayPrice && (
                <div className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-xl text-sm font-black mb-1">
                  TIẾT KIỆM {Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)}%
                </div>
              )}
              
              {product.status === 'INACTIVE' && <span className="mb-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-sm font-bold">Ngừng kinh doanh</span>}
            </div>



            {/* MUA HÀNG */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border-2 border-stone-200 rounded-xl bg-stone-50 h-14">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-5 font-bold text-stone-500 hover:text-orange-600">-</button>
                <span className="font-bold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(displayStock, quantity + 1))} className="px-5 font-bold text-stone-500 hover:text-orange-600">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={displayStock === 0 || product.status === 'INACTIVE'}
                className="flex-1 bg-stone-900 text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={22} />
                {displayStock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-stone-500 font-medium">
                {`Kho còn: ${displayStock} sản phẩm`}
              </p>

              {/* Nút Yêu thích */}
              <button 
                onClick={handleToggleWishlist}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${isInWishlist ? 'text-red-500' : 'text-stone-400 hover:text-red-500'}`}
              >
                <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                {isInWishlist ? 'Đã thêm vào Yêu thích' : 'Yêu thích'}
              </button>
            </div>

            {/* Cam kết */}
            <div className="mt-auto pt-8 flex gap-6 border-t border-stone-100">
              <div className="flex items-center gap-3"><ShieldCheck className="text-green-500" size={24} /><span className="text-sm font-bold text-stone-700">Bảo hành 12 tháng</span></div>
              <div className="flex items-center gap-3"><Truck className="text-blue-500" size={24} /><span className="text-sm font-bold text-stone-700">Miễn phí vận chuyển</span></div>
            </div>
          </div>
        </div>

        {/* ======================= MÔ TẢ CHI TIẾT ======================= */}
        <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-sm border border-stone-100 mb-16">
          <h2 className="text-2xl font-black text-stone-900 mb-6">Mô tả sản phẩm</h2>
          <div className="prose max-w-none text-stone-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.productDescription || 'Chưa có mô tả chi tiết.' }} />
        </div>

        {/* ======================= SẢN PHẨM TƯƠNG TỰ ======================= */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-black text-stone-900">Sản phẩm tương tự</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {allProducts.filter(p => p.productId !== product.productId).slice(0, 4).map(p => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        </div>

        {/* ======================= SẢN PHẨM ĐÃ XEM ======================= */}
        {recentlyViewed.length > 0 && (
          <div>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-black text-stone-900">Bạn vừa xem</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 opacity-80 hover:opacity-100 transition-opacity">
              {recentlyViewed.slice(0, 4).map(p => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};