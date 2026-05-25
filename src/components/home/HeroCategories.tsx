import React from 'react';
import { Music, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

const HeroCategories: React.FC = () => {
  const { tree } = useAppSelector((s) => s.categories);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-[10px] font-black tracking-[0.3em] text-orange-700 uppercase mb-4 block">
              Bộ sưu tập 2026
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tighter italic">
              KHÁM PHÁ THEO <br className="hidden md:block" /> DÒNG NHẠC CỤ
            </h2>
          </div>
          <p className="max-w-md text-stone-500 text-sm leading-relaxed mb-1">
            Từ những chiếc guitar thủ công đến bộ gõ uy lực, chúng tôi mang cả thế giới âm nhạc
            đến tầm tay bạn.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {tree.slice(0, 4).map((cat) => (
            <a
              key={cat.category_id}
              href={`/collection/${cat.slug}`}
              className="group relative aspect-[4/5] rounded-[40px] overflow-hidden bg-stone-100 border border-stone-100 hover:shadow-2xl transition-all duration-700"
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent opacity-70 group-hover:opacity-80 transition-opacity z-10" />
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-700/0 rounded-full blur-3xl group-hover:bg-orange-700/20 transition-all duration-700 pointer-events-none z-20" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-30">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-4 group-hover:bg-orange-700 transition-all duration-500">
                  <Music size={20} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">
                  {cat.name}
                </h3>
                <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold tracking-widest uppercase group-hover:text-white transition-colors">
                  Khám phá ngay{' '}
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCategories;
