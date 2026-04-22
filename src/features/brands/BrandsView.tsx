import React, { useState, useMemo } from 'react';
import { Search, Star, Type } from 'lucide-react';
import type { BrandResponse } from '@/types/brand.type';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface Props {
  brands: BrandResponse[];
  isLoading: boolean;
  onSelectBrand?: (brandSlug: string) => void;
}

export const BrandsView: React.FC<Props> = ({ brands, isLoading, onSelectBrand }) => {
  const [viewMode, setViewMode] = useState<'featured' | 'alphabet'>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // 0. Chỉ lấy những thương hiệu đang hoạt động (is_active = true)
  const activeBrands = useMemo(() => {
    return brands.filter(b => b.is_active);
  }, [brands]);

  // 1. Lọc theo từ khóa Search
  const searchFilteredBrands = useMemo(() => {
    if (!searchQuery) return activeBrands;
    return activeBrands.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeBrands, searchQuery]);

  // 2. Lọc tiếp theo chữ cái A-Z (Dành cho chế độ Alphabet)
  const alphabetFilteredBrands = useMemo(() => {
    if (!selectedLetter) return searchFilteredBrands;
    return searchFilteredBrands.filter(b => b.name.toUpperCase().startsWith(selectedLetter));
  }, [searchFilteredBrands, selectedLetter]);

  // 3. Lấy Top nổi bật (Dành cho chế độ Featured)
  const featuredBrands = searchFilteredBrands.slice(0, 6);

  // Khi người dùng gõ tìm kiếm, tự động chuyển về view phù hợp và reset chữ cái
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedLetter(null);
  };

  return (
    <div className="w-full h-full flex animate-in slide-in-from-bottom-8 fade-in duration-500 bg-stone-50">
      
      {/* ========================================== */}
      {/* CỘT TRÁI: BẢNG ĐIỀU KHIỂN & TÌM KIẾM */}
      {/* ========================================== */}
      <div className="w-[340px] bg-[#fcfbf9] border-r border-stone-100 flex flex-col h-full overflow-hidden shadow-[inset_-10px_0_20px_-15px_rgba(0,0,0,0.05)] shrink-0">
        
        {/* Ô Tìm kiếm */}
        <div className="p-8 border-b border-stone-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Tìm thương hiệu..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-white border border-stone-200 rounded-2xl py-3.5 pl-11 pr-4 text-[13px] font-bold text-stone-700 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all placeholder:font-medium placeholder:text-stone-400 shadow-sm"
            />
          </div>
        </div>

        {/* Nút chuyển chế độ */}
        <div className="flex flex-col px-4 py-4 gap-2">
          <button
            onClick={() => setViewMode('featured')}
            className={`group flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${
              viewMode === 'featured' ? 'bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]' : 'hover:bg-stone-200/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${viewMode === 'featured' ? 'bg-orange-50 text-orange-700' : 'bg-stone-100 text-stone-400 group-hover:bg-white group-hover:text-stone-600'}`}>
                <Star size={16} strokeWidth={2.5} />
              </div>
              <span className={`text-[14px] font-bold tracking-wide ${viewMode === 'featured' ? 'text-stone-900' : 'text-stone-500'}`}>Thương hiệu nổi bật</span>
            </div>
            {viewMode === 'featured' && <div className="w-1.5 h-6 bg-orange-700 rounded-full" />}
          </button>

          <button
            onClick={() => setViewMode('alphabet')}
            className={`group flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 ${
              viewMode === 'alphabet' ? 'bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]' : 'hover:bg-stone-200/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${viewMode === 'alphabet' ? 'bg-orange-50 text-orange-700' : 'bg-stone-100 text-stone-400 group-hover:bg-white group-hover:text-stone-600'}`}>
                <Type size={16} strokeWidth={2.5} />
              </div>
              <span className={`text-[14px] font-bold tracking-wide ${viewMode === 'alphabet' ? 'text-stone-900' : 'text-stone-500'}`}>Ký tự A-Z</span>
            </div>
            {viewMode === 'alphabet' && <div className="w-1.5 h-6 bg-orange-700 rounded-full" />}
          </button>
        </div>

        <div className="mt-auto p-10 bg-gradient-to-t from-stone-100/50 to-transparent pointer-events-none">
          <p className="text-[10px] font-black tracking-[0.3em] text-stone-300 uppercase leading-relaxed text-center">Di sản âm nhạc thế giới</p>
        </div>
      </div>

      {/* ========================================== */}
      {/* CỘT PHẢI: NỘI DUNG HIỂN THỊ */}
      {/* ========================================== */}
      <div className="flex-1 bg-white overflow-y-auto px-16 py-12 scrollbar-hide relative">
        {isLoading ? (
           <div className="h-full flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-stone-200 border-t-orange-700 rounded-full animate-spin" />
           </div>
        ) : searchFilteredBrands.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in">
             <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-stone-300" />
             </div>
             <h4 className="text-xl font-black text-stone-800 mb-2">Không tìm thấy kết quả</h4>
             <p className="text-sm font-medium text-stone-400">Thử thay đổi từ khóa tìm kiếm của bạn.</p>
           </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            
            {/* TIÊU ĐỀ TRANG */}
            <div className="flex items-end justify-between mb-12 border-b border-stone-100 pb-8">
              <div>
                <span className="text-[10px] font-black tracking-[0.4em] text-orange-700 uppercase mb-4 block">
                  {viewMode === 'featured' ? 'Top Brands' : 'Brand Directory'}
                </span>
                <h3 className="text-5xl font-black text-stone-900 tracking-[-0.02em] leading-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {viewMode === 'featured' 
                    ? 'Thương Hiệu Nổi Bật' 
                    : `Ký tự: ${selectedLetter || 'TẤT CẢ'}`
                  }
                </h3>
              </div>
              <span className="text-sm font-bold text-stone-400 bg-stone-50 px-4 py-2 rounded-full">
                {viewMode === 'featured' 
                    ? featuredBrands.length 
                    : alphabetFilteredBrands.length
                } 
                Thương hiệu
              </span>
            </div>

            {/* CHẾ ĐỘ 1: LƯỚI NỔI BẬT (FEATURED) */}
            {viewMode === 'featured' && (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                {featuredBrands.map((brand, idx) => (
                  <a 
                    key={brand.brand_id}
                    href={`/brands/${brand.slug}`}
                    className="group relative h-[240px] rounded-[32px] overflow-hidden bg-stone-900 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
                    style={{ animationDelay: `${idx * 50}ms` }}
                    onClick={(e) => {
                      if (onSelectBrand) { e.preventDefault(); onSelectBrand(brand.slug); }
                    }}
                  >
                    <img 
                      src={brand.brand_image || 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80'} 
                      alt={brand.name} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
                    
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                         <Star className="w-5 h-5 text-orange-700" />
                      </div>
                      <h4 className="text-3xl font-black text-white tracking-tight mb-2">{brand.name}</h4>
                      <p className="text-stone-300 text-sm font-medium line-clamp-2">
                        {brand.description || "Nhà sản xuất nhạc cụ hàng đầu thế giới."}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* CHẾ ĐỘ 2: DANH BẠ A-Z (ALPHABET) */}
            {viewMode === 'alphabet' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Dải nút Alphabet */}
                <div className="flex flex-wrap gap-3 mb-12">
                    <button 
                        onClick={() => setSelectedLetter(null)}
                        className={`px-5 h-10 rounded-xl text-[12px] font-black transition-all ${
                            !selectedLetter ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-50 text-stone-400 border border-stone-100 hover:border-orange-200'
                        }`}
                    >
                        ALL
                    </button>
                    {ALPHABET.map(letter => {
                        // Tùy chọn: Làm mờ những chữ cái không có thương hiệu nào
                        const hasBrands = searchFilteredBrands.some(b => b.name.toUpperCase().startsWith(letter));
                        
                        return (
                            <button 
                                key={letter}
                                onClick={() => hasBrands && setSelectedLetter(letter)}
                                disabled={!hasBrands}
                                className={`w-10 h-10 rounded-xl text-[13px] font-black transition-all ${
                                    selectedLetter === letter 
                                    ? 'bg-stone-900 text-white shadow-lg scale-110' 
                                    : hasBrands 
                                    ? 'bg-white text-stone-500 border border-stone-200 hover:border-orange-400 hover:text-orange-700 shadow-sm hover:shadow-md'
                                    : 'bg-stone-50 text-stone-300 cursor-not-allowed border border-transparent'
                                }`}
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                {letter}
                            </button>
                        )
                    })}
                </div>

                {/* Lưới kết quả Thương hiệu */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {alphabetFilteredBrands.map(brand => (
                        <a 
                            key={brand.brand_id} 
                            href={`/brands/${brand.slug}`}
                            className="group p-6 rounded-[24px] bg-white border border-stone-200 hover:shadow-xl hover:border-orange-300 transition-all text-center flex flex-col items-center justify-center aspect-square"
                            onClick={(e) => {
                              if (onSelectBrand) { e.preventDefault(); onSelectBrand(brand.slug); }
                            }}
                        >
                            {/* Ưu tiên hiển thị hình ảnh nếu có, không có thì hiện chữ cái đầu */}
                            {brand.brand_image ? (
                              <div className="w-16 h-16 rounded-full overflow-hidden mb-4 border border-stone-100 group-hover:scale-110 transition-transform duration-500">
                                <img src={brand.brand_image} alt={brand.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <span className="text-4xl font-black text-stone-200 mb-4 group-hover:text-orange-700 transition-colors" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                  {brand.name.charAt(0)}
                              </span>
                            )}
                            <span className="text-sm font-bold text-stone-700 group-hover:text-stone-900 tracking-tight">{brand.name}</span>
                        </a>
                    ))}
                </div>
                
                {alphabetFilteredBrands.length === 0 && selectedLetter && (
                    <div className="py-20 text-center text-stone-300 italic">Không có thương hiệu nào bắt đầu bằng chữ "{selectedLetter}"</div>
                )}
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
};