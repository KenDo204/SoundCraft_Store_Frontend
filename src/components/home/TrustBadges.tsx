import React from 'react';
import { Zap, ShieldCheck, Star } from 'lucide-react';

const features = [
  { icon: <Zap size={24} />, title: 'Giao hàng siêu tốc', desc: 'Nhận nhạc cụ trong 24h tại nội thành.' },
  { icon: <ShieldCheck size={24} />, title: 'Bảo hành chính hãng', desc: 'Cam kết 100% sản phẩm từ thương hiệu lớn.' },
  { icon: <Star size={24} />, title: 'Chuyên gia tư vấn', desc: 'Đội ngũ nghệ sĩ hỗ trợ chọn nhạc cụ phù hợp.' },
];

const TrustBadges: React.FC = () => (
  <section className="py-12 bg-[#fcfbf9] border-y border-stone-100">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-orange-700 border border-stone-100 shrink-0">
              {f.icon}
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base mb-1">{f.title}</h3>
              <p className="text-stone-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBadges;
