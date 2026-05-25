import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategoryTree } from '@/store/slices/category.slice';
import { fetchProductsByParentCategory } from '@/store/slices/product.slice';
import type { CategoryResponse } from '@/types/category.type';
import SectionHeader from './SectionHeader';
import ProductGrid from './ProductGrid';

/**
 * Lấy tất cả danh mục level 3:
 * đi sâu hai cấp trong cây (root → children → grandchildren).
 */
function getLevel3Categories(tree: CategoryResponse[]): CategoryResponse[] {
  return tree.flatMap((root) =>
    (root.children ?? []).flatMap((child) => (child.children ?? []) as CategoryResponse[])
  );
}

const ProductsByCategory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tree } = useAppSelector((s) => s.categories);
  const { productsByCategory, isByCategoryLoading } = useAppSelector((s) => s.products);

  // Lấy danh mục level 3 từ cây (dùng làm tabs)
  const level3Categories = useMemo(() => getLevel3Categories(tree), [tree]);

  const [activeCatId, setActiveCatId] = useState<number | null>(null);

  // Ensure tree is loaded
  useEffect(() => {
    if (tree.length === 0) {
      dispatch(fetchCategoryTree());
    }
  }, [dispatch, tree.length]);

  // Mặc định chọn tab đầu tiên khi danh sách sẵn sàng
  useEffect(() => {
    if (level3Categories.length > 0 && activeCatId === null) {
      setActiveCatId(level3Categories[0].category_id);
    }
  }, [level3Categories, activeCatId]);

  // Fetch products whenever the active category changes
  useEffect(() => {
    if (activeCatId !== null) {
      dispatch(
        fetchProductsByParentCategory({ parentId: activeCatId, query: { limit: 8 } })
      );
    }
  }, [dispatch, activeCatId]);

  // Thông tin danh mục đang active (dùng cho link "xem tất cả")
  const activeCategory = level3Categories.find((c) => c.category_id === activeCatId);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Theo dòng nhạc cụ"
          title="Khám phá theo danh mục"
          icon={<Music size={14} />}
        />

        {/* Tab danh mục level 3 */}
        <div className="flex flex-wrap gap-3 mb-10">
          {level3Categories.map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => setActiveCatId(cat.category_id)}
              className={`px-5 py-2 rounded-full text-sm font-bold border transition-all duration-200 ${
                activeCatId === cat.category_id
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-orange-700 hover:text-orange-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <ProductGrid products={productsByCategory} loading={isByCategoryLoading} />

        {activeCategory && (
          <div className="mt-8 text-center">
            <Link
              to={`/collection/${activeCategory.slug}`}
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-full text-sm transition-all"
            >
              Xem tất cả "{activeCategory.name}" <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsByCategory;
