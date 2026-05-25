import React, { useEffect } from 'react';
import { Flame } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBestSellers } from '@/store/slices/product.slice';
import SectionHeader from './SectionHeader';
import ProductGrid from './ProductGrid';

const BestSellers: React.FC = () => {
  const dispatch = useAppDispatch();
  const { bestSellers, isBestSellersLoading } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchBestSellers({ limit: 8 }));
  }, [dispatch]);

  return (
    <section className="py-20 bg-[#faf9f7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Hàng nổi bật"
          title="Bán chạy nhất"
          subtitle="Những sản phẩm được yêu thích và mua nhiều nhất tại SoundCraft."
          icon={<Flame size={14} />}
          href="/products?sort=best-sellers"
        />
        <ProductGrid products={bestSellers} loading={isBestSellersLoading} />
      </div>
    </section>
  );
};

export default BestSellers;
