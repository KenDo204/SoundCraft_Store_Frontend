import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CategoryResponse } from '@/types/category.type';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

// --- IMPORT CÁC MẢNH GHÉP (PRESENTATIONAL COMPONENTS) ---
import { MegaMenuHeader } from './MegaMenuHeader';
import { MainMenuGrid } from './MainMenuGrid';
import { HierarchyView } from './HierarchyView';
import { AlphabetView } from './AlphabetView';
// Giả sử sau này bạn tạo thêm:
import { BrandsView } from '@/features/brands/BrandsView';
import { fetchAllBrands } from '@/store/slices/brand.slice';
import { NewArrivalsView } from './NewArrivalsView';

interface CategoryMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryResponse[];
  initialSection?: string;
}

const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({ isOpen, onClose, categories, initialSection = 'main' }) => {
  // ==========================================
  // 1. QUẢN LÝ TRẠNG THÁI UI (UI STATE)
  // ==========================================
  const [activeSection, setActiveSection] = useState<string>('main');
  const [activeTab, setActiveTab] = useState<CategoryResponse | null>(null);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'alphabet'>('hierarchy');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // ==========================================
  // 2. KẾT NỐI REDUX (DATA STATE)
  // ==========================================
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Khai báo sẵn các state từ Redux (Ví dụ sau này bạn có slice riêng cho MegaMenu)
  const { list: brands, isLoading } = useAppSelector(state => state.brands);

  // ==========================================
  // 3. XỬ LÝ SIDE EFFECTS (GỌI API THÔNG MINH)
  // ==========================================
  // Reset khi đóng menu
  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
      if (initialSection === 'categories' && categories.length > 0) {
        setActiveTab(categories[0]);
      }
      } else {
      // Khi section là brands hoặc newarrival, chúng ta không reset về main ngay lập tức khi đang mở.
      // Nhưng nếu menu đóng hẳn, ta reset về main.
      if (!isOpen) {
        setActiveSection('main');
        setActiveTab(null);
        setViewMode('hierarchy');
        setSelectedLetter(null);
      }
    }
  }, [isOpen, initialSection, categories]);

  // Lazy Load: Chỉ gọi API khi người dùng thực sự bấm vào mục đó
  useEffect(() => {
    if (!isOpen) return;

    if (activeSection === 'brands') {
      // Nếu chưa có data thì mới gọi API
      // if (brands.length === 0) dispatch(fetchBrandsForMenu());
    } else if (activeSection === 'new') {
      // if (newArrivals.length === 0) dispatch(fetchNewArrivalsForMenu());
    }
  }, [activeSection, isOpen, dispatch]); 

  useEffect(() => {
    if (!isOpen) return;

    // Khi người dùng chọn vào mục Brands, nếu mảng rỗng thì mới gọi API
    if (activeSection === 'brands' && brands.length === 0) {
      dispatch(fetchAllBrands());
    }
  }, [activeSection, isOpen, dispatch, brands.length]);

  // ==========================================
  // 4. HÀM ĐIỀU HƯỚNG (ROUTER LAYER)
  // ==========================================
  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId); // Chuyển màn hình
    
    // Logic setup riêng cho từng màn hình
    if (sectionId === 'categories' && categories.length > 0) {
      setActiveTab(categories[0]);
    }
  };

  // ==========================================
  // 5. RENDER (CHỈ TRUYỀN PROPS, KHÔNG VIẾT GIAO DIỆN Ở ĐÂY)
  // ==========================================
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col font-sans">
      {/* Lớp phủ mờ */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity duration-500" onClick={onClose} />

      {/* Cửa sổ chính */}
      <div className="relative bg-white w-full shadow-2xl flex flex-col mt-[112px] animate-in slide-in-from-top duration-500 ease-out h-[70vh] max-h-[800px] overflow-hidden rounded-b-[40px] border-t border-stone-100">
        
        {/* HEADER: Component quản lý thanh ngang trên cùng */}
        <MegaMenuHeader 
          activeSection={activeSection}
          viewMode={viewMode}
          onBack={() => setActiveSection('main')}
          onChangeView={(mode) => setViewMode(mode)}
          onClose={onClose}
        />

        {/* CONTAINER CHÍNH: Nơi chuyển đổi các Component */}
        <div className="flex flex-1 overflow-hidden h-full bg-stone-50">
          
          {/* Màn hình 1: Lưới Main Menu */}
          {activeSection === 'main' && (
            <MainMenuGrid onNavigate={handleNavigate} />
          )}

          {/* Màn hình 2a: Danh mục (Cấu trúc cây) */}
          {activeSection === 'categories' && viewMode === 'hierarchy' && (
            <HierarchyView 
              categories={categories} 
              activeTab={activeTab} 
              onSelectTab={setActiveTab} 
              onSelectCategory={(slug) => {
                navigate(`/collection/${slug}`);
                onClose();
              }}
            />
          )}

          {/* Màn hình 2b: Danh mục (Tra cứu A-Z) */}
          {activeSection === 'categories' && viewMode === 'alphabet' && (
            <AlphabetView 
              categories={categories} 
              selectedLetter={selectedLetter} 
              onSelectLetter={setSelectedLetter} 
              onSelectCategory={(slug) => {
                navigate(`/collection/${slug}`);
                onClose();
              }}
            />
          )}

          {/* SẴN SÀNG CHO TƯƠNG LAI: Chỉ việc thêm component vào đây */}
          {activeSection === 'brands' && (
            <BrandsView 
              brands={brands} 
              isLoading={isLoading} 
              onSelectBrand={(slug) => {
                  navigate(`/collection/${slug}`);
                  onClose(); 
                }}
            />
          )} 
         
          {activeSection === 'newarrival' && (
            <NewArrivalsView 
              categories={categories} 
              onClose={onClose} 
            />
          )} 


        </div>
      </div>
    </div>
  );
};

export default CategoryMegaMenu;