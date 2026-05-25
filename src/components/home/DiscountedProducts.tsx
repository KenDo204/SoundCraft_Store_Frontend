import React, { useEffect } from 'react';
import { Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDiscountedProducts } from '@/store/slices/product.slice';
import SectionHeader from './SectionHeader';
import ProductGrid from './ProductGrid';

const DiscountedProducts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { discountedProducts, isDiscountedLoading } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchDiscountedProducts({ limit: 8 }));
  }, [dispatch]);

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Ưu đãi đặc biệt"
          title="Đang giảm giá"
          subtitle="Chớp ngay cơ hội sở hữu nhạc cụ chất lượng với giá tốt nhất."
          icon={<Tag size={14} />}
          href="/products?hasDiscount=true"
        />
        <ProductGrid products={discountedProducts} loading={isDiscountedLoading} />
      </div>
    </section>
  );
};

export default DiscountedProducts;
