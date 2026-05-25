import React from 'react';
import { Link } from 'react-router-dom';
import { Music, ShoppingCart } from 'lucide-react';
import type { ProductResponse } from '@/types/product.type';

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const ProductCard: React.FC<{ product: ProductResponse }> = ({ product }) => {
  const thumb =
    product.images?.find((i) => i.isThumbnail)?.imageUrl ?? product.images?.[0]?.imageUrl;
  const hasDiscount = product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-3xl border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        {thumb ? (
          <img
            src={thumb}
            alt={product.productName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <Music size={48} />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-black px-2 py-1 rounded-full tracking-wider">
            -{discountPct}%
          </span>
        )}
        {!product.isStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-bold text-stone-500 bg-white px-3 py-1 rounded-full border">
              Hết hàng
            </span>
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
        <div className="mt-auto pt-2 flex items-end gap-2">
          <span className="text-base font-black text-stone-900">{formatVND(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-stone-400 line-through">
              {formatVND(product.originalPrice)}
            </span>
          )}
        </div>
        <button
          className="mt-2 w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-orange-700 text-white text-xs font-bold py-2 rounded-xl transition-colors duration-200 active:scale-95"
          onClick={(e) => {
            e.preventDefault();
            // TODO: dispatch addToCart
          }}
        >
          <ShoppingCart size={14} /> Thêm vào giỏ
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
