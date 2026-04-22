import { Menu } from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
  isHighlight?: boolean; // Dùng để highlight màu cam (VD: "CÓ GÌ MỚI")
}

const mainNavLinks: NavLink[] = [
  { label: 'DEALS', href: '#' },
  { label: 'THƯƠNG HIỆU', href: '/brands' },
  { label: 'SẢN PHẨM', href: '/products' },
];

const DesktopNav: React.FC<{ onOpenMegaMenu: (section?: string) => void; isCompact?: boolean }> = ({ onOpenMegaMenu, isCompact }) => {

  return (
    <nav className={`hidden lg:flex items-center gap-4 text-sm font-bold tracking-wide transition-all duration-500 
    ${isCompact ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
      <div 
        className="flex items-center gap-2 text-stone-900 cursor-pointer group transition-all"
        onClick={() => onOpenMegaMenu('main')}
      >
        <div className="p-1.5 bg-stone-100 rounded group-hover:bg-stone-300 group-hover:text-theme-gold transition-colors">
          <Menu className="w-4 h-4" />
        </div>
      </div>

      <button 
        onClick={() => onOpenMegaMenu('newarrival')}
        className="font-bold uppercase tracking-widest text-theme-gold transition-colors hover:text-orange-600 active:scale-95"
      >
        CÓ GÌ HOT!
      </button>

      <button 
        onClick={() => onOpenMegaMenu('brands')}
        className="text-stone-900 hover:text-orange-600 transition-colors uppercase tracking-wide font-bold"
      >
        THƯƠNG HIỆU
      </button>

      <button 
        onClick={() => onOpenMegaMenu('categories')}
        className="text-stone-900 hover:text-orange-600 transition-colors uppercase tracking-wide font-bold"
      >
        SẢN PHẨM
      </button>

      <a href="/deals" className="text-stone-900 hover:text-orange-600 transition-colors uppercase tracking-wide">
        DEALS
      </a>
    </nav>
  );
};

export default DesktopNav;
