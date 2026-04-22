import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';

// Định nghĩa Type cho Bộ lọc
export interface FilterState {
  categoryId: number | null;
  brandId: number | null;
  priceMin: number | '';
  priceMax: number | '';
  inStock: boolean | null; // null: Tất cả, true: Còn hàng, false: Hết hàng
  color: string | null;
}

interface FilterSectionProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  brands: any[];
}

// Mock Data tạm thời (Bạn có thể thay bằng API Redux sau)
const CATEGORIES = [
  { id: 1, name: 'Đàn Guitar' },
  { id: 2, name: 'Đàn Piano' },
  { id: 3, name: 'Trống & Bộ gõ' },
  { id: 4, name: 'Phụ kiện Âm nhạc' },
];

const COLORS = ['Màu Đen', 'Màu Trắng', 'Gỗ tự nhiên', 'Màu Đỏ', 'Sunburst'];

export const FilterSection: React.FC<FilterSectionProps> = ({ filters, setFilters, brands }) => {
  // State quản lý việc thu/phóng từng phần của bộ lọc
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    brand: true,
    status: true,
    color: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleUpdateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Nút xóa tất cả bộ lọc
  const clearFilters = () => {
    setFilters({ categoryId: null, brandId: null, priceMin: '', priceMax: '', inStock: null, color: null });
  };

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-stone-200 sticky top-24">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2 font-black text-stone-900 text-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <Filter size={20} className="text-orange-600" /> Bộ lọc
        </div>
        <button onClick={clearFilters} className="text-xs font-bold text-orange-600 hover:underline">
          Xóa tất cả
        </button>
      </div>

      <div className="space-y-6">
        {/* 1. DANH MỤC */}
        <div>
          <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleSection('category')}>
            <p className="font-bold text-sm text-stone-800 uppercase tracking-wider">Danh mục</p>
            {openSections.category ? <ChevronUp size={16} className="text-stone-400"/> : <ChevronDown size={16} className="text-stone-400"/>}
          </div>
          {openSections.category && (
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={filters.categoryId === null} onChange={() => handleUpdateFilter('categoryId', null)} className="w-4 h-4 accent-orange-600 cursor-pointer" />
                <span className={`text-sm font-medium transition-colors ${filters.categoryId === null ? 'text-orange-600 font-bold' : 'text-stone-600 group-hover:text-orange-600'}`}>Tất cả</span>
              </label>
              {CATEGORIES.map(cat => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" checked={filters.categoryId === cat.id} onChange={() => handleUpdateFilter('categoryId', cat.id)} className="w-4 h-4 accent-orange-600 cursor-pointer" />
                  <span className={`text-sm font-medium transition-colors ${filters.categoryId === cat.id ? 'text-orange-600 font-bold' : 'text-stone-600 group-hover:text-orange-600'}`}>{cat.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 2. KHOẢNG GIÁ */}
        <div className="pt-4 border-t border-stone-100">
          <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleSection('price')}>
            <p className="font-bold text-sm text-stone-800 uppercase tracking-wider">Khoảng giá</p>
            {openSections.price ? <ChevronUp size={16} className="text-stone-400"/> : <ChevronDown size={16} className="text-stone-400"/>}
          </div>
          {openSections.price && (
            <div className="flex items-center gap-2">
              <input 
                type="number" placeholder="TỪ" value={filters.priceMin}
                onChange={(e) => handleUpdateFilter('priceMin', e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-orange-500"
              />
              <span className="text-stone-400 font-bold">-</span>
              <input 
                type="number" placeholder="ĐẾN" value={filters.priceMax}
                onChange={(e) => handleUpdateFilter('priceMax', e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          )}
        </div>

        {/* 3. TÌNH TRẠNG KHO */}
        <div className="pt-4 border-t border-stone-100">
          <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleSection('status')}>
            <p className="font-bold text-sm text-stone-800 uppercase tracking-wider">Tình trạng</p>
            {openSections.status ? <ChevronUp size={16} className="text-stone-400"/> : <ChevronDown size={16} className="text-stone-400"/>}
          </div>
          {openSections.status && (
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={filters.inStock === null} onChange={() => handleUpdateFilter('inStock', null)} className="w-4 h-4 accent-orange-600" />
                <span className="text-sm font-medium text-stone-600 group-hover:text-orange-600">Tất cả</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={filters.inStock === true} onChange={() => handleUpdateFilter('inStock', true)} className="w-4 h-4 accent-orange-600" />
                <span className="text-sm font-medium text-stone-600 group-hover:text-orange-600">Còn hàng</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={filters.inStock === false} onChange={() => handleUpdateFilter('inStock', false)} className="w-4 h-4 accent-orange-600" />
                <span className="text-sm font-medium text-stone-600 group-hover:text-orange-600">Hết hàng</span>
              </label>
            </div>
          )}
        </div>

        {/* 4. THƯƠNG HIỆU */}
        <div className="pt-4 border-t border-stone-100">
          <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleSection('brand')}>
            <p className="font-bold text-sm text-stone-800 uppercase tracking-wider">Thương hiệu</p>
            {openSections.brand ? <ChevronUp size={16} className="text-stone-400"/> : <ChevronDown size={16} className="text-stone-400"/>}
          </div>
          {openSections.brand && (
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" checked={filters.brandId === null} onChange={() => handleUpdateFilter('brandId', null)} className="w-4 h-4 accent-orange-600" />
                <span className={`text-sm font-medium transition-colors ${filters.brandId === null ? 'text-orange-600 font-bold' : 'text-stone-600 group-hover:text-orange-600'}`}>Tất cả</span>
              </label>
              {brands?.map((brand: any) => (
                <label key={brand.id || brand.brand_id} className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" checked={filters.brandId === (brand.id || brand.brand_id)} onChange={() => handleUpdateFilter('brandId', brand.id || brand.brand_id)} className="w-4 h-4 accent-orange-600" />
                  <span className={`text-sm font-medium transition-colors ${filters.brandId === (brand.id || brand.brand_id) ? 'text-orange-600 font-bold' : 'text-stone-600 group-hover:text-orange-600'}`}>{brand.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 5. MÀU SẮC */}
        <div className="pt-4 border-t border-stone-100">
          <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleSection('color')}>
            <p className="font-bold text-sm text-stone-800 uppercase tracking-wider">Màu sắc</p>
            {openSections.color ? <ChevronUp size={16} className="text-stone-400"/> : <ChevronDown size={16} className="text-stone-400"/>}
          </div>
          {openSections.color && (
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => handleUpdateFilter('color', filters.color === color ? null : color)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    filters.color === color 
                      ? 'bg-orange-50 border-orange-600 text-orange-600' 
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-orange-300'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};