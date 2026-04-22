interface NavLink {
  label: string;
  href: string;
  isHighlight?: boolean; // Dùng để highlight màu cam (VD: "CÓ GÌ MỚI")
}

const topBarLinks: NavLink[] = [
  { label: 'Liên Hệ', href: '#' },
  { label: 'Tìm Cửa Hàng', href: '#' },
  { label: 'Mua Sắm Với Chuyên Gia', href: '#' },
];

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

const TopBar: React.FC = () => (
  <div className="bg-[#f5f4ef] text-stone-600 border-b border-stone-200">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-8 text-[11px] uppercase tracking-wider font-medium">
        {/* Left Top */}
        <div className="hidden md:flex items-center gap-5">
          {topBarLinks.map((link, idx) => (
            <a key={idx} href={link.href} className="hover:text-stone-900 transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Top */}
        <div className="flex items-center gap-4 ml-auto md:ml-0">
          <span className="hidden sm:inline font-bold text-stone-800">Bắt đầu tích điểm</span>
          <a href="#" className="flex items-center gap-1.5 hover:text-stone-900 transition-colors">
            {/* Vị trí icon hoặc text bổ sung nếu có */}
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default TopBar;