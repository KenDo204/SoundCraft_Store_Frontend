import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { CategoryResponse } from '@/types/category.type';

interface Props {
  categories: CategoryResponse[];
  activeTab: CategoryResponse | null;
  onSelectTab: (cat: CategoryResponse) => void;
  onSelectCategory?: (slug: string) => void;
}

export const HierarchyView: React.FC<Props> = ({ categories, activeTab, onSelectTab, onSelectCategory }) => {
  return (
    <div className="w-full h-full flex animate-in slide-in-from-right-8 fade-in duration-500 bg-stone-50">
      {/* CỘT TRÁI */}
      <div className="w-[340px] bg-[#fcfbf9] border-r border-stone-100 flex flex-col h-full overflow-y-auto pt-4 shadow-[inset_-10px_0_20px_-15px_rgba(0,0,0,0.05)] shrink-0">
        <div className="flex flex-col px-4">
          {categories.map((cat) => (
            <div
                key={cat.category_id}
                onMouseEnter={() => onSelectTab(cat)}
                className={`group relative flex items-center justify-between px-8 py-5 rounded-2xl cursor-pointer transition-all ${
                    activeTab?.category_id === cat.category_id 
                    ? 'bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]' 
                    : 'hover:bg-stone-200/40'
                }`}
            >
                <span className={`text-[16px] font-bold tracking-tight transition-colors ${activeTab?.category_id === cat.category_id ? 'text-stone-900' : 'text-stone-500'}`}>
                    {cat.name}
                </span>
                <ChevronRight className={`w-4 h-4 transition-all duration-300 ${activeTab?.category_id === cat.category_id ? 'translate-x-0 text-orange-700 opacity-100' : 'opacity-0 -translate-x-2'}`} />
                {activeTab?.category_id === cat.category_id && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-orange-700 rounded-full" />}
            </div>
          ))}
        </div>
        <div className="mt-auto p-10 bg-gradient-to-t from-stone-100/50 to-transparent pointer-events-none">
            <p className="text-[10px] font-black tracking-widest text-stone-300 uppercase leading-relaxed">Khám phá tinh hoa<br/>âm nhạc từ 2026</p>
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="flex-1 bg-white overflow-y-auto px-16 py-12 scrollbar-hide relative">
        {activeTab && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="flex items-start justify-between mb-12 border-b border-stone-100 pb-10 relative">
                    <div className="flex-1">
                        <span className="text-[10px] font-black tracking-[0.3em] text-orange-700 uppercase mb-4 block">Bộ sưu tập chính hãng</span>
                        <h3 className="text-5xl font-black text-stone-900 tracking-tighter mb-4 leading-tight">{activeTab.name}</h3>
                        <p className="text-stone-400 text-base font-medium tracking-wide max-w-sm">{activeTab.description || "Khám phá bộ sưu tập nhạc cụ đẳng cấp thế giới."}</p>
                        <div className="mt-8">
                            <button 
                                onClick={() => onSelectCategory?.(activeTab.slug)} 
                                className="group inline-flex items-center gap-4 bg-stone-900 text-white px-10 py-4 rounded-full text-xs font-black tracking-widest uppercase hover:bg-orange-700 transition-all active:scale-95 shadow-xl"
                            >
                                XEM BỘ SƯU TẬP <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                    <div className="hidden xl:block w-[320px] h-[220px] rounded-[32px] overflow-hidden shadow-2xl border-[8px] border-stone-50">
                        {activeTab.image_url ? (
                            <img src={activeTab.image_url} alt={activeTab.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300 font-black text-[10px] tracking-widest uppercase">Sound Craft Studio</div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-12">
                    {activeTab.children?.map((lvl2, idx) => (
                        <div key={lvl2.category_id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <h4 className="text-[11px] font-black tracking-[0.3em] text-orange-700 uppercase mb-6 flex items-center gap-3">
                                <span className="w-6 h-px bg-orange-700/30" /> {lvl2.name}
                            </h4>
                            <ul className="space-y-4">
                                {lvl2.children?.map(lvl3 => (
                                    <li key={lvl3.category_id}>
                                        <button 
                                            onClick={() => onSelectCategory?.(lvl3.slug)} 
                                            className="group flex items-center justify-between w-full text-[15px] font-bold text-stone-500 hover:text-stone-900 transition-all"
                                        >
                                            <span>{lvl3.name}</span>
                                            <div className="w-5 h-5 rounded-full border border-stone-100 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-stone-50 transition-all rotate-[-45deg]">
                                                <ChevronRight size={10} />
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};