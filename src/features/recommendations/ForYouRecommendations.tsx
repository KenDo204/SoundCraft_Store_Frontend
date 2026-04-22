import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchForYouRecommendations } from '@/store/slices/recommendation.slice';
import { ProductCard } from '@/pages/client/Product/components/ProductCard';
import { Sparkles } from 'lucide-react';

interface ForYouRecommendationsProps {
  userId: number;
}

export const ForYouRecommendations: React.FC<ForYouRecommendationsProps> = ({ userId }) => {
  const dispatch = useAppDispatch();
  const { forYouProducts, isLoadingForYou } = useAppSelector((state) => state.recommendations);

  useEffect(() => {
    if (userId) {
      dispatch(fetchForYouRecommendations(userId));
    }
  }, [dispatch, userId]);

  if (isLoadingForYou) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-stone-400 font-bold text-sm uppercase tracking-widest">Đang chuẩn bị gợi ý cho bạn...</span>
    </div>
  );
  
  if (!forYouProducts || forYouProducts.length === 0) return null;

  return (
    <section className="py-20 bg-[#fcfbf9] border-y border-stone-100 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <Sparkles size={20} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase italic">DÀNH RIÊNG CHO BẠN</h2>
            <p className="text-xs text-stone-500 font-medium">Khám phá các sản phẩm phù hợp với gu âm nhạc của bạn</p>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-8 snap-x no-scrollbar">
          {forYouProducts.map((product) => (
            <div key={product.productId} className="flex-none w-[280px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
          {/* Spacer for scroll end */}
          <div className="flex-none w-1 hidden lg:block" />
        </div>
      </div>
    </section>
  );
};
