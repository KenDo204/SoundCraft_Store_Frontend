import React, { useMemo } from 'react';
import type { CategoryResponse } from '@/types/category.type';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface Props {
  categories: CategoryResponse[];
  selectedLetter: string | null;
  onSelectLetter: (letter: string | null) => void;
  onSelectCategory?: (slug: string) => void;
}

export const AlphabetView: React.FC<Props> = ({ categories, selectedLetter, onSelectLetter, onSelectCategory }) => {
  const filteredAlphabetCategories = useMemo(() => {
    if (!selectedLetter) return categories;
    return categories.filter(cat => cat.name.toUpperCase().startsWith(selectedLetter));
  }, [categories, selectedLetter]);

  return (
    <div className="w-full h-full flex animate-in fade-in duration-500 bg-stone-50">
      {/* CỘT TRÁI */}
      <div className="w-[340px] bg-[#fcfbf9] border-r border-stone-100 flex flex-col h-full overflow-y-auto pt-4 shrink-0">
        <div className="p-8 flex flex-wrap gap-2 justify-center">
            <button 
                onClick={() => onSelectLetter(null)}
                className={`w-10 h-10 rounded-xl text-[12px] font-black transition-all ${!selectedLetter ? 'bg-stone-900 text-white shadow-lg' : 'bg-white text-stone-400 border border-stone-100 hover:border-orange-200'}`}
            >
                ALL
            </button>
            {ALPHABET.map(letter => {

              const hasBrands = filteredAlphabetCategories.some(b => b.name.toUpperCase().startsWith(letter));
              return (
                <button 
                    key={letter}
                    onClick={() => hasBrands && onSelectLetter(letter)}
                    disabled={!hasBrands}
                    className={`w-10 h-10 rounded-xl text-[12px] font-black transition-all ${
                      !hasBrands
                        ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                        : selectedLetter === letter
                          ? 'bg-stone-900 text-white shadow-lg'
                          : 'bg-white text-stone-400 border border-stone-100 hover:border-orange-400 hover:text-orange-700'
                    }`}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                    {letter}
                </button>
              )
            })}
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="flex-1 bg-white overflow-y-auto px-16 py-12 scrollbar-hide">
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-12 border-b border-stone-100 pb-8">
                <h3 className="text-3xl font-black text-stone-900 tracking-tighter" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Ký tự : {selectedLetter || 'TẤT CẢ'}
                </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {filteredAlphabetCategories.map(cat => (
                    <button 
                        key={cat.category_id} 
                        onClick={() => onSelectCategory?.(cat.slug)}
                        className="group p-8 rounded-[32px] bg-stone-50 border border-stone-100 hover:bg-white hover:shadow-xl hover:border-orange-200 transition-all text-center flex flex-col items-center justify-center aspect-square"
                    >
                        <span className="text-4xl font-black text-stone-200 mb-2 group-hover:text-orange-700 transition-colors">
                            {cat.name.charAt(0)}
                        </span>
                        <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900">{cat.name}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};