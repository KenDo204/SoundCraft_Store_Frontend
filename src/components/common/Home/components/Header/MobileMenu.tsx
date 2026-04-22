import React, { useState, useMemo } from 'react';
import type { CategoryResponse } from '@/types/category.type';
import { ChevronRight, LayoutGrid, Type, X } from 'lucide-react';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const MobileMenu: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void;
    categories: CategoryResponse[];
}> = ({ isOpen, onClose, categories }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'alphabet'>('hierarchy');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const toggleCategory = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredAlphabetCategories = useMemo(() => {
    if (!selectedLetter) return categories;
    return categories.filter(cat => cat.name.toUpperCase().startsWith(selectedLetter));
  }, [categories, selectedLetter]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-right duration-300">
      {/* Mobile Top Bar */}
      <div className="h-20 border-b border-stone-100 flex items-center justify-between px-6 shrink-0">
        <h2 className="text-xl font-black text-stone-900 tracking-tighter italic">SOUND CRAFT</h2>
        <button onClick={onClose} className="p-2 bg-stone-100 rounded-full">
            <X size={20} className="text-stone-900" />
        </button>
      </div>

      {/* View Switcher */}
      <div className="bg-stone-50 p-2 flex gap-2 mx-6 mt-6 rounded-2xl border border-stone-100">
         <button 
            onClick={() => setViewMode('hierarchy')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all ${
                viewMode === 'hierarchy' ? 'bg-white text-orange-700 shadow-sm' : 'text-stone-400'
            }`}
         >
            <LayoutGrid size={14} /> Danh mục
         </button>
         <button 
            onClick={() => setViewMode('alphabet')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all ${
                viewMode === 'alphabet' ? 'bg-white text-orange-700 shadow-sm' : 'text-stone-400'
            }`}
         >
            <Type size={14} /> ABC
         </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
        {viewMode === 'hierarchy' ? (
            <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                    <div key={cat.category_id} className={`rounded-2xl transition-all ${expandedId === cat.category_id ? 'bg-stone-50 ring-1 ring-stone-200/50' : ''}`}>
                        <button 
                            onClick={() => toggleCategory(cat.category_id)}
                            className="w-full flex items-center justify-between p-5"
                        >
                            <span className={`font-bold text-[17px] tracking-tight ${expandedId === cat.category_id ? 'text-orange-700' : 'text-stone-900'}`}>{cat.name}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedId === cat.category_id ? 'bg-white text-orange-700 rotate-90 shadow-sm' : 'text-stone-300'}`}>
                                <ChevronRight size={18} />
                            </div>
                        </button>

                        {expandedId === cat.category_id && (
                            <div className="px-5 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                {/* Category Mobile Hero */}
                                {cat.image_url && (
                                    <div className="w-full h-32 rounded-2xl overflow-hidden mb-6 relative border border-stone-100 shadow-sm">
                                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-stone-900/10" />
                                    </div>
                                )}
                                
                                <div className="flex flex-col gap-6">
                                    {cat.children?.map((lvl2) => (
                                        <div key={lvl2.category_id}>
                                            <p className="text-[10px] font-black tracking-[0.2em] text-orange-700 uppercase mb-3 px-1">{lvl2.name}</p>
                                            <div className="grid grid-cols-1 gap-1">
                                                {lvl2.children?.map(lvl3 => (
                                                    <a 
                                                        key={lvl3.category_id}
                                                        href={`/collection/${lvl3.slug}`}
                                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white text-sm font-medium text-stone-500 hover:text-stone-900 transition-all border border-transparent hover:border-stone-100"
                                                    >
                                                        {lvl3.name}
                                                        <ChevronRight size={12} className="opacity-30" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ) : (
            <div className="animate-in fade-in duration-500">
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    <button 
                        onClick={() => setSelectedLetter(null)}
                        className={`w-12 h-12 rounded-2xl text-[12px] font-black transition-all ${
                            !selectedLetter ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-50 text-stone-400 border border-stone-100'
                        }`}
                    >
                        ALL
                    </button>
                    {ALPHABET.map(l => (
                        <button 
                            key={l}
                            onClick={() => setSelectedLetter(l)}
                            className={`w-12 h-12 rounded-2xl text-[12px] font-black transition-all ${
                                selectedLetter === l ? 'bg-orange-700 text-white shadow-lg' : 'bg-stone-50 text-stone-400 border border-stone-100'
                            }`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {filteredAlphabetCategories.map(cat => (
                        <a 
                            key={cat.category_id}
                            href={`/collection/${cat.slug}`}
                            className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex flex-col items-center justify-center gap-2 text-center py-6 active:scale-95 transition-all"
                        >
                            <span className="text-2xl font-black text-stone-200">{cat.name.charAt(0)}</span>
                            <span className="text-xs font-bold text-stone-600">{cat.name}</span>
                        </a>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Footer Quick Contact */}
      <div className="p-6 bg-stone-900 text-white shrink-0">
          <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black tracking-widest uppercase text-stone-500">Cần hỗ trợ?</span>
              <a href="tel:19001234" className="text-lg font-black text-orange-500 italic underline">1900.1234</a>
          </div>
          <p className="text-[9px] font-bold text-stone-600 tracking-[0.3em] uppercase">Est. 2026 • Sound Craft Music Co.</p>
      </div>
    </div>
  );
};

export default MobileMenu;
