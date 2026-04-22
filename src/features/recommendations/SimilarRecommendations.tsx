import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSimilarRecommendations } from '@/store/slices/recommendation.slice';

interface SimilarRecommendationsProps {
  productId: number;
}

export const SimilarRecommendations: React.FC<SimilarRecommendationsProps> = ({ productId }) => {
  const dispatch = useAppDispatch();
  const { similarProducts, isLoadingSimilar } = useAppSelector((state) => state.recommendations);

  useEffect(() => {
    if (productId) {
      dispatch(fetchSimilarRecommendations(productId));
    }
  }, [dispatch, productId]);

  if (isLoadingSimilar) return <div className="py-8 text-center">Đang tải sản phẩm tương tự...</div>;
  if (!similarProducts || similarProducts.length === 0) return null;

  return (
    <section className="py-12 border-t mt-12">
      <h2 className="text-2xl font-bold mb-6">Các nhạc cụ tương tự</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
        {similarProducts.map((product) => (
          <div key={product.productId} className="flex-none w-48 border rounded-lg p-3 shadow-sm snap-start hover:shadow-md cursor-pointer transition-shadow">
             <div className="aspect-square bg-gray-100 rounded-md mb-3 overflow-hidden">
               {product.images && product.images[0] ? (
                 <img src={product.images[0].imageUrl} alt={product.productName} className="object-cover w-full h-full hover:scale-105 transition-transform" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
               )}
            </div>
            <h3 className="text-sm font-medium line-clamp-2">{product.productName}</h3>
            <p className="text-red-500 font-semibold mt-1 text-sm">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
