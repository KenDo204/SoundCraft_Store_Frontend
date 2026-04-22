import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CategoryResponse } from '@/types/category.type';
import { ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  categories: CategoryResponse[];
  onClose: () => void;
}

export const NewArrivalsView: React.FC<Props> = ({ categories, onClose }) => {
  const navigate = useNavigate();

  // Lấy danh sách các danh mục level 3 (Cháu)
  // Trong cấu trúc cây: Root -> Level 1 -> Level 2 (children) -> Level 3 (children của children)
  const getAllLevel3Categories = (cats: CategoryResponse[]): CategoryResponse[] => {
    let results: CategoryResponse[] = [];
    cats.forEach(lvl1 => {
        lvl1.children?.forEach(lvl2 => {
            lvl2.children?.forEach(lvl3 => {
                results.push(lvl3);
            });
        });
    });
    return results;
  };

  const level3Categories = getAllLevel3Categories(categories).slice(0, 3);

  const handleCategoryClick = (cat: CategoryResponse) => {
    // Chỉ cho phép click nếu là level 3 (trong trường hợp này chúng ta đã lọc sẵn rồi)
    const url = `/collection/new-arrivals?tags=${encodeURIComponent(cat.name)}`;
    navigate(url);
    onClose();
  };

  return (
    <div className="w-full h-full p-12 bg-white animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10 border-b border-stone-100 pb-8">
            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                <Sparkles size={28} />
            </div>
            <div>
                <h2 className="text-4xl font-black text-stone-900 tracking-tighter uppercase italic">Sản phẩm mới về</h2>
                <p className="text-stone-400 font-medium">Khám phá những nhạc cụ và thiết bị âm thanh vừa cập bến Sound Craft</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {level3Categories.length > 0 ? (
            level3Categories.map((cat, idx) => (
              <div 
                key={cat.category_id}
                onClick={() => handleCategoryClick(cat)}
                className="group relative h-[300px] rounded-[32px] overflow-hidden cursor-pointer shadow-xl hover:shadow-orange-200/50 transition-all duration-500 border border-stone-100 animate-in fade-in slide-in-from-right-8"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* Background Image */}
                <img 
                  src={cat.image_url || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80'} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent group-hover:from-orange-900/90 transition-colors duration-500" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end h-full text-white">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-70 mb-2">Bộ sưu tập mới</span>
                  <h3 className="text-2xl font-black mb-4 tracking-tight leading-tight group-hover:translate-x-2 transition-transform duration-500 uppercase italic">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400 group-hover:text-white transition-colors">
                    KHÁM PHÁ NGAY <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-20 text-center bg-stone-50 rounded-[40px] border border-stone-100 border-dashed">
                <p className="text-stone-400 font-bold italic">Đang cập nhật danh mục mới...</p>
            </div>
          )}
        </div>

        {/* Quick links header recommendation or something similar can go here */}
        <div className="mt-16 p-10 bg-stone-50 rounded-[40px] border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-1000 delay-500">
            <div className="max-w-md">
                <h4 className="text-lg font-black text-stone-900 mb-2 uppercase italic tracking-tight">Vẫn chưa tìm thấy đam mê?</h4>
                <p className="text-stone-400 text-sm font-medium">Bấm vào mục "SẢN PHẨM" để xem toàn bộ danh mục của chúng tôi với hơn 10,000 thiết bị âm nhạc chính hãng.</p>
            </div>
            <button 
                onClick={() => navigate('/products')}
                className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-orange-600 transition-all active:scale-95 shadow-xl shrink-0"
            >
                Xem tất cả sản phẩm
            </button>
        </div>
      </div>
    </div>
  );
};
