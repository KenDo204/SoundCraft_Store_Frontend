import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllBrands } from '@/store/slices/brand.slice';

const BrandPartners: React.FC = () => {
  const dispatch = useAppDispatch();
  const { list: brands, isLoading } = useAppSelector((s) => s.brands);

  useEffect(() => {
    if (brands.length === 0) {
      dispatch(fetchAllBrands());
    }
  }, [dispatch, brands.length]);

  return (
    <section className="py-24 border-t border-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[9px] font-black tracking-[0.4em] text-stone-400 uppercase">
            Đối tác tin cậy
          </p>
        </div>

        {isLoading ? (
          /* Skeleton while loading */
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-28 rounded bg-stone-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
            {brands
              .filter((b) => b.is_active)
              .map((brand) => (
                <Link
                  key={brand.brand_id}
                  to={`/collection/${brand.slug}`}
                  title={brand.name}
                  className="group flex flex-col items-center gap-3 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500"
                >
                  {brand.brand_image ? (
                    <img
                      src={brand.brand_image}
                      alt={brand.name}
                      className="h-10 object-contain"
                    />
                  ) : (
                    <span className="text-3xl font-black tracking-tighter italic text-stone-900 uppercase group-hover:text-orange-700 transition-colors">
                      {brand.name}
                    </span>
                  )}
                </Link>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BrandPartners;
