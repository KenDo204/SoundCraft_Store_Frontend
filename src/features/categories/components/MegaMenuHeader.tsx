import React from 'react';
import { LayoutGrid, Type, ArrowLeft, X } from 'lucide-react';

interface Props {
  activeSection: string;
  viewMode: 'hierarchy' | 'alphabet';
  onBack: () => void;
  onChangeView: (mode: 'hierarchy' | 'alphabet') => void;
  onClose: () => void;
}

export const MegaMenuHeader: React.FC<Props> = ({ activeSection, viewMode, onBack, onChangeView, onClose }) => {
  return (
    <div className="h-16 border-b border-stone-100 flex items-center justify-between px-10 bg-white shrink-0 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-8">
        {activeSection !== 'main' && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase text-stone-500 hover:text-orange-700 transition-colors mr-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <ArrowLeft size={16} strokeWidth={2.5} /> Quay lại
          </button>
        )}

        {activeSection === 'categories' && (
          <>
            <button 
               onClick={() => onChangeView('hierarchy')}
               className={`flex items-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase transition-all ${
                 viewMode === 'hierarchy' ? 'text-orange-700' : 'text-stone-400 hover:text-stone-600'
               }`}
               style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <LayoutGrid size={16} strokeWidth={2.5} /> Danh mục chính
            </button>
            <button 
               onClick={() => onChangeView('alphabet')}
               className={`flex items-center gap-2 text-[11px] font-black tracking-[0.2em] uppercase transition-all ${
                 viewMode === 'alphabet' ? 'text-orange-700' : 'text-stone-400 hover:text-stone-600'
               }`}
               style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <Type size={16} strokeWidth={2.5} /> Tra cứu A-Z
            </button>
          </>
        )}
        
        {activeSection === 'main' && (
           <span className="text-[11px] font-black tracking-[0.3em] uppercase text-stone-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>
             Khám phá Sound Craft
           </span>
        )}
      </div>
      
      <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-all active:scale-95">
        <X className="w-6 h-6 text-stone-900 hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
};