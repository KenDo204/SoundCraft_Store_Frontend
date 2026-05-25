import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNewArrivals } from '@/store/slices/product.slice';
import SectionHeader from './SectionHeader';
import ProductGrid from './ProductGrid';

const NewArrivals: React.FC = () => {
  const dispatch = useAppDispatch();
  const { newArrivals, isArrivalsLoading } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchNewArrivals({ limit: 8 }));
  }, [dispatch]);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Mới nhất"
          title="Hàng mới về"
          subtitle="Những sản phẩm mới nhất vừa được cập nhật vào kho hàng."
          icon={<Sparkles size={14} />}
          href="/products?sort=newest"
        />
        <ProductGrid products={newArrivals} loading={isArrivalsLoading} />
      </div>
    </section>
  );
};

export default NewArrivals;
