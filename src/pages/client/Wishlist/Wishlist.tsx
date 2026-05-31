import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyWishlist } from '@/store/slices/wishlist.slice';
import ProductCard from '@/components/home/ProductCard';
import { Heart, Loader2, PackageX } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Wishlist = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector(state => state.wishlist);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchMyWishlist({ limit: 100 }));
    }
  }, [dispatch, user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
          <Heart size={40} />
        </div>
        <h2 className="text-2xl font-black text-stone-900">Danh sách yêu thích trống</h2>
        <p className="text-stone-500 text-center max-w-md">Vui lòng đăng nhập để xem danh sách sản phẩm bạn đã yêu thích.</p>
        <Link to="/login" className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">Đăng nhập ngay</Link>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-orange-600" size={40} /></div>;
  }

  // Phân loại sản phẩm: Active và Inactive
  const activeItems = items.filter(product => product.status === 'ACTIVE');
  const inactiveItems = items.filter(product => product.status !== 'ACTIVE');

  return (
    <div className="min-h-screen bg-[#fcfbf9] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <Heart fill="currentColor" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-stone-900 uppercase tracking-tight">Danh sách yêu thích</h1>
            <p className="text-stone-500 font-medium">Bạn có {items.length} sản phẩm trong danh sách</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center border border-stone-100 shadow-sm flex flex-col items-center">
            <PackageX size={64} className="text-stone-200 mb-4" />
            <h3 className="text-xl font-bold text-stone-800 mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-stone-500 mb-8">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và thêm chúng vào danh sách yêu thích.</p>
            <Link to="/products" className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">Khám phá ngay</Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* DANH SÁCH SẢN PHẨM CÒN HÀNG */}
            {activeItems.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {activeItems.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            )}

            {/* PHÂN CÁCH SẢN PHẨM HẾT HÀNG */}
            {inactiveItems.length > 0 && (
              <div className="space-y-8">
                <div className="relative py-4 flex items-center">
                  <div className="flex-grow border-t border-stone-200"></div>
                  <span className="flex-shrink mx-4 text-stone-400 font-black text-sm uppercase tracking-widest px-4 py-1 bg-stone-100 rounded-full">Sản phẩm hết hàng</span>
                  <div className="flex-grow border-t border-stone-200"></div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 opacity-80">
                  {inactiveItems.map((product) => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};


