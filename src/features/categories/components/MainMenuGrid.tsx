import React from 'react';
import { ChevronRight } from 'lucide-react';

const MAIN_MENU_ITEMS = [
  { 
    id: 'newarrival', 
    title: 'CÓ GÌ MỚI', 
    subtitle: 'Khám phá các sản phẩm vừa ra mắt', 
    img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80' // Ảnh Studio/Guitar hiện đại
  },
  { 
    id: 'categories', 
    title: 'DANH MỤC', 
    subtitle: 'Bộ sưu tập nhạc cụ đa dạng', 
    img: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&q=80' // Ảnh Guitar Classic cực nghệ
  },
  { 
    id: 'brands', 
    title: 'THƯƠNG HIỆU', 
    subtitle: 'Các nhà sản xuất danh tiếng nhất', 
    img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80' // Ảnh Electric Guitar biểu diễn
  },
  { 
    id: 'deals', 
    title: 'ƯU ĐÃI', 
    subtitle: 'Chương trình khuyến mãi đặc biệt', 
    img: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?auto=format&fit=crop&q=80' // Ảnh Dàn trống/Vibe sôi động cho khuyến mãi
  },
];

interface Props {
  onNavigate: (sectionId: string) => void;
}

export const MainMenuGrid: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in zoom-in-95 duration-500">
      {MAIN_MENU_ITEMS.map((item) => (
        <div 
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="group relative overflow-hidden cursor-pointer border-r border-stone-800/10 last:border-0"
        >
          <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-110 opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-stone-900/10 transition-opacity duration-500 group-hover:bg-stone-900/40" />
          
          <div className="absolute inset-0 p-10 flex flex-col justify-end">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-3 transform transition-transform duration-500 group-hover:-translate-y-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {item.title}
            </h2>
            <p className="text-stone-200 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
              {item.subtitle}
            </p>
            <div className="absolute bottom-10 right-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500 delay-100">
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};