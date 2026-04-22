import React from 'react';

// --- TYPES ---
interface NavItem {
  label: string;
  href: string;
}

interface NavBlockProps {
  title: string;
  items: NavItem[];
}

// --- MOCK DATA ---
const brandLinks: NavItem[] = [
  { label: 'Ibanez', href: '#' },
  { label: 'PRS', href: '#' },
  { label: 'Martin', href: '#' },
  { label: 'Marshall', href: '#' },
  { label: 'Heritage', href: '#' },
  { label: 'Fender', href: '#' },
];

const categoryLinks: NavItem[] = [
  { label: 'Hàng mới về', href: '#' },
  { label: 'Guitars & Basses', href: '#' },
  { label: 'Phụ kiện', href: '#' },
  { label: 'Amplifiers & Monitors', href: '#' },
  { label: 'Trống & Bộ gõ', href: '#' },
  { label: 'Pedals & Pedalboards', href: '#' },
];

const serviceLinks: NavItem[] = [
  { label: 'Trung tâm trợ giúp', href: '#' },
  { label: 'Đặt hàng & Thanh toán', href: '#' },
  { label: 'Giao nhận', href: '#' },
  { label: 'Bán Hoặc Trao Đổi', href: '#' },
  { label: 'Chế độ bảo hành', href: '#' },
];

const infoLinks: NavItem[] = [
  { label: 'Rewards', href: '#' },
  { label: 'Click & Collect', href: '#' },
  { label: 'Ưu đãi khuyến học', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Hướng dẫn mua hàng', href: '#' },
];

const aboutLinks: NavItem[] = [
  { label: 'Giới thiệu', href: '#' },
  { label: 'Điều khoản sử dụng', href: '#' },
  { label: 'Quyền riêng tư', href: '#' },
  { label: 'Tuyển dụng', href: '#' },
  { label: 'Press', href: '#' },
];

const contactLinks: NavItem[] = [
  { label: 'Tìm vị trí', href: '#' },
  { label: 'Liên hệ', href: '#' },
];

// Component hiển thị một cột danh sách link
const NavBlock: React.FC<NavBlockProps> = ({ title, items }) => {
  return (
    <div>
      <h4 className="text-stone-400 font-semibold mb-4 text-[15px]">{title}</h4>
      <ul className="space-y-2 text-[15px] text-[#f5f4ef]">
        {items.map((item, idx) => (
          <li key={idx}>
            {/* Sử dụng theme-gold (#9f8a46) khi hover */}
            <a href={item.href} className="hover:text-[#9f8a46] transition-colors">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const NewsletterForm: React.FC = () => {
  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
  
    <div className="flex-1">
        <h3 className="text-[15px] font-bold uppercase tracking-wide mb-2 text-[#f5f4ef]">
        Đăng ký nhận thông báo qua mail
        </h3>
        <p className="text-[15px] text-stone-300 mb-0 md:mb-0">
        Đăng ký nhận thông tin ưu đãi từ SoundCraft!
        </p>
    </div>

    <form className="flex gap-4 w-full md:w-auto">
        <input
        type="email"
        placeholder="Enter your email address"
        className="w-full md:w-80 bg-[#f5f4ef] text-stone-900 px-4 py-2.5 rounded-sm outline-none placeholder:text-stone-500 focus:ring-2 focus:ring-[#9f8a46]/50"
        />
        <button
        type="button"
        className="bg-[#9f8a46] hover:bg-[#7a6b2b] text-[#f5f4ef] px-8 py-2.5 rounded-sm font-semibold transition-colors whitespace-nowrap"
        >
        Đăng ký
        </button>
    </form>

    </div>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1c1a17] text-[#f5f4ef] py-12 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-10">
          <NewsletterForm />
        </div>

        {/* Links Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Block 1 */}
          <div className="grid grid-cols-2 gap-6 p-8 border-b">
            <NavBlock title="Thương hiệu" items={brandLinks} />
            <NavBlock title="Thể loại" items={categoryLinks} />
          </div>

          {/* Block 2 */}
          <div className="grid grid-cols-2 gap-6 p-8 border-b">
            <NavBlock title="Dịch vụ khách hàng" items={serviceLinks} />
            <NavBlock title="Thông tin hữu ích" items={infoLinks} />
          </div>

          {/* Block 3 */}
          <div className="grid grid-cols-2 gap-6 p-8 border-b">
            <NavBlock title="Về" items={aboutLinks} />
            
            <div>
              <NavBlock title="Liên hệ" items={contactLinks} />
              
              {/* Social Icons */}
              <div className="flex items-center gap-3 mt-6">
                <a href="#" className="w-8 h-8 rounded-full bg-stone-400/80 flex items-center justify-center text-[#1c1a17] hover:bg-[#9f8a46] hover:text-[#f5f4ef] transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-stone-400/80 flex items-center justify-center text-[#1c1a17] hover:bg-[#9f8a46] hover:text-[#f5f4ef] transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.20 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.105a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-sm">Bản quyền © 2026 SoundCraft. Đã đăng ký bản quyền.</p>
      <div className="flex items-center gap-4">
        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=25&fit=crop" alt="Visa" className="h-6 opacity-70"/>
        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=25&fit=crop" alt="Mastercard" className="h-6 opacity-70"/>
        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=40&h=25&fit=crop" alt="PayPal" className="h-6 opacity-70"/>
      </div>
    </div>
      </div>
    </footer>
  );
};

export default Footer;