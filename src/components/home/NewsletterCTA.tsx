import React from 'react';

const NewsletterCTA: React.FC = () => (
  <section className="py-12">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-[60px] bg-stone-950 p-12 md:p-24 overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-700/10 blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-stone-700/10 blur-[100px] -ml-32 -mb-32" />

        <div className="relative z-10 flex-1">
          <h2 className="text-white text-4xl md:text-6xl font-black tracking-tighter mb-6 italic leading-none">
            KHỞI ĐẦU <br /> GIAO HƯỞNG <br /> CỦA RIÊNG BẠN
          </h2>
          <p className="text-stone-400 text-base md:text-lg font-medium max-w-lg leading-relaxed mb-10">
            Đăng ký bản tin để nhận ưu đãi đặc quyền cho các dòng sản phẩm giới hạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="bg-white/5 border border-white/10 rounded-full px-8 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-700 w-full sm:w-auto min-w-[300px]"
            />
            <button className="bg-orange-700 hover:bg-orange-800 text-white font-black px-10 py-4 rounded-full text-xs tracking-widest uppercase transition-all shadow-xl active:scale-95 shrink-0">
              Đăng ký
            </button>
          </div>
        </div>

        <div className="relative z-10 shrink-0 select-none hidden md:block">
          <div className="text-[200px] font-black text-white/[0.02] tracking-tighter leading-none italic select-none">
            MUSIC
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default NewsletterCTA;
