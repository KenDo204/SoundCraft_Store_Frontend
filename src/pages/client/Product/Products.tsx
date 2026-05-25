import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts, fetchNewArrivals } from '@/store/slices/product.slice';
import { fetchAllBrands } from '@/store/slices/brand.slice';

import { ProductCard } from './components/ProductCard';
import { Search, Loader2 } from 'lucide-react';
import { Pagination } from '@mui/material';
import { FilterSection, type FilterState } from './components/FilterSection';

export const Products = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Lấy tags từ URL (?tags=...)
  const searchParams = new URLSearchParams(location.search);
  const tags = searchParams.get('tags');
  
  // Lấy state từ Redux
  const { list: products, pagination, isLoading } = useAppSelector(state => state.products);
  const { list: brands } = useAppSelector(state => state.brands);

  // States quản lý Metadata cho Collection
  const [metadata, setMetadata] = useState<{
    name: string;
    description: string;
    image: string;
    type: 'brand' | 'category' | 'newarrival';
    id?: number;
  } | null>(null);


  // States quản lý Bộ lọc
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  const [filters, setFilters] = useState<FilterState>({
    categoryId: null,
    brandId: null,
    priceMin: '',
    priceMax: '',
    inStock: null,
    color: null
  });

  // 1. Fetch Metadata (Metadata fetch)
  useEffect(() => {
    // Không còn gọi getBySlug để lấy ID riêng nữa, ta dùng Slug trực tiếp trong fetchProducts
    if (slug === 'new-arrivals') {
      setMetadata({
        name: tags ? `Hàng mới về: ${tags}` : 'Sản phẩm mới nhất',
        description: `Khám phá những sản phẩm ${tags ? tags : ''} vừa cập bến tại Sound Craft Studio.`,
        image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80',
        type: 'newarrival'
      });
    } else if (slug) {
      // Tạm thời đặt tên metadata theo slug nếu chưa có dữ liệu từ sản phẩm
      // Sau khi fetchProducts xong, ta có thể lấy info từ item đầu tiên nếu cần
      setMetadata({
        name: slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        description: 'Khám phá bộ sưu tập sản phẩm chất lượng cao.',
        image: '',
        type: 'brand' // Mặc định là brand, có thể check sâu hơn sau
      });
    } else {
      setMetadata(null);
    }
    dispatch(fetchAllBrands());
  }, [slug, tags, dispatch]);

  // 1.1 Update Metadata from Results (nếu slug khớp)
  useEffect(() => {
    if (products.length > 0 && slug && slug !== 'new-arrivals') {
      const first = products[0];
      if (first.brand?.slug === slug) {
        setMetadata({
          name: first.brand.name,
          description: metadata?.description || '',
          image: first.brand.image_url || '',
          type: 'brand',
          id: Number(first.brand.id)
        });
      } else if (first.category?.slug === slug) {
        setMetadata({
          name: first.category.name,
          description: metadata?.description || '',
          image: first.category.image_url || '',
          type: 'category',
          id: Number(first.category.category_id)
        });
      }
    }
  }, [products, slug, metadata?.description]);

  // 2. Lấy danh sách Sản phẩm
  useEffect(() => {
    // Reset filters and page when slug changes
    if (slug === 'new-arrivals') {
      dispatch(fetchNewArrivals({ 
        page, 
        limit: 12, 
        tags,
        ...filters
      }));
    } else {
      const queryParams: any = {
        page,
        limit: 12,
        keyword,
        slug: slug || undefined, // Truyền slug trực tiếp vào backend
        brandId: filters.brandId,
        categoryId: filters.categoryId,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        inStock: filters.inStock,
        color: filters.color,
        tags: tags // Lấy từ URL query params (?tags=...)
      };
      const cleanParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, v]) => v !== null && v !== '')
      );
      dispatch(fetchProducts(cleanParams));
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, page, keyword, filters, slug, tags]);

  return (
    <div className="bg-[#fcfbf9] min-h-screen pb-20">
      
      {/* ================= HEADER / HERO SECTION ================= */}
      {metadata ? (
        <div className="relative h-[400px] w-full overflow-hidden mb-12">
          <div className="absolute inset-0">
            <img 
              src={metadata.image || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80'} 
              alt={metadata.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/60 to-transparent" />
          </div>
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-white">
            <span className="text-sm font-black tracking-[0.4em] text-orange-500 uppercase mb-4">
              Cửa hàng / {metadata.type === 'brand' ? 'Thương hiệu' : metadata.type === 'newarrival' ? 'Hàng mới về' : 'Danh mục'}
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {metadata.name}
            </h1>
            <p className="max-w-2xl text-lg text-stone-300 font-medium leading-relaxed line-clamp-3">
              {metadata.description || "Khám phá bộ sưu tập nhạc cụ và thiết bị âm thanh chất lượng cao."}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-stone-900 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Tất cả sản phẩm
          </h1>
          <p className="text-stone-500 mt-3 text-lg">Khám phá bộ sưu tập nhạc cụ và phụ kiện cao cấp của chúng tôi.</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* SIDEBAR FILTER */}
          <div className="w-full lg:w-1/4 shrink-0 space-y-6">
            <div className="relative group mb-4">
              <input
                type="text"
                placeholder={metadata ? `Tìm trong ${metadata.name}...` : "Nhập tên đàn, model..."}
                className="w-full bg-white border border-stone-200 rounded-[16px] py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-orange-500 transition-colors shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setKeyword(e.currentTarget.value);
                    setPage(1);
                  }
                }}
              />
              <Search size={18} className="absolute left-4 top-3.5 text-stone-400 group-focus-within:text-orange-500 transition-colors" />
            </div>

            <FilterSection filters={filters} setFilters={setFilters} brands={brands} />
          </div>

          {/* MAIN PRODUCT GRID */}
          <div className="w-full lg:w-3/4">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-[50vh] bg-white rounded-[32px] border border-stone-200 shadow-sm">
                <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
                <p className="text-stone-500 font-medium">Đang tải sản phẩm...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[32px] border border-stone-200 shadow-sm">
                <Search className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                <p className="text-stone-500 font-medium text-lg">Không tìm thấy sản phẩm nào phù hợp.</p>
                <button
                  onClick={() => {
                    setKeyword('');
                    setFilters({ categoryId: null, brandId: null, priceMin: '', priceMax: '', inStock: null, color: null });
                  }}
                  className="mt-6 text-orange-600 font-bold hover:underline"
                >
                  Xóa toàn bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6 px-2">
                   <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">
                     Hiển thị {products.length} / {pagination.meta.totalElements} sản phẩm
                   </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>

                {pagination.meta.totalPages > 1 && (
                  <div className="mt-12 flex justify-center bg-white p-4 rounded-2xl shadow-sm border border-stone-200 w-fit mx-auto">
                    <Pagination
                      count={pagination.meta.totalPages}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      sx={{
                        '& .Mui-selected': { bgcolor: '#ea580c !important', color: 'white', fontWeight: 'bold' },
                        '& .MuiPaginationItem-root:hover': { bgcolor: '#ffedd5', color: '#ea580c' }
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};