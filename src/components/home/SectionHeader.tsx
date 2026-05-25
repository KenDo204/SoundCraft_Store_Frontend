import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  badge: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  href?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ badge, title, subtitle, icon, href }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
    <div>
      <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.3em] text-orange-700 uppercase mb-3">
        {icon} {badge}
      </span>
      <h2 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">{title}</h2>
      {subtitle && <p className="mt-2 text-stone-500 text-sm max-w-md">{subtitle}</p>}
    </div>
    {href && (
      <Link
        to={href}
        className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:text-orange-800 transition-colors shrink-0"
      >
        Xem tất cả <ChevronRight size={14} />
      </Link>
    )}
  </div>
);

export default SectionHeader;
