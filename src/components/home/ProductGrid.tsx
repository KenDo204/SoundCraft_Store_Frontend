import React from 'react';
import ProductCard from './ProductCard';
import type { ProductResponse } from '@/types/product.type';

const SkeletonCard = () => (
  <div className="flex flex-col rounded-3xl bg-stone-100 overflow-hidden animate-pulse">
    <div className="aspect-square bg-stone-200" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-stone-200 rounded w-1/3" />
      <div className="h-4 bg-stone-200 rounded w-3/4" />
      <div className="h-4 bg-stone-200 rounded w-1/2" />
      <div className="h-8 bg-stone-200 rounded-xl mt-2" />
    </div>
  </div>
);

interface ProductGridProps {
  products: ProductResponse[];
  loading: boolean;
  count?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, count = 8 }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  if (!products.length) {
    return (
      <div className="text-center py-16 text-stone-400 text-sm">Không có sản phẩm nào.</div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.slice(0, count).map((p) => (
        <ProductCard key={p.productId} product={p} />
      ))}
    </div>
  );
};

export default ProductGrid;
