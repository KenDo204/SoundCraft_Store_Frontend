import React, { useEffect } from 'react';
import Banner from '@/components/common/Home/Banner';
import { useAppSelector } from '@/store/hooks';
import { ChevronRight, Music, Star, Zap, ShieldCheck } from 'lucide-react';
import { ForYouRecommendations } from '@/features/recommendations/ForYouRecommendations';
import { trackingService, UserActionType } from '@/services/tracking.service';

const homeFeatures = [
    { icon: <Zap size={24} />, title: 'Giao hàng siêu tốc', desc: 'Nhận nhạc cụ trong 24h tại nội thành.' },
    { icon: <ShieldCheck size={24} />, title: 'Bảo hành chính hãng', desc: 'Cam kết 100% sản phẩm từ thương hiệu lớn.' },
    { icon: <Star size={24} />, title: 'Chuyên gia tư vấn', desc: 'Đội ngũ nghệ sĩ hỗ trợ chọn nhạc cụ phù hợp.' },
];

const Home: React.FC = () => {
    const { tree } = useAppSelector((state) => state.categories);
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // Track homepage view
        trackingService.track({
            actionType: UserActionType.SEARCH, // Just an example, maybe define VIEW_HOME in future
            keyword: 'homepage',
            contextData: { source: 'direct' }
        });
    }, []);

    return (
        <main className="bg-white min-h-screen font-sans overflow-hidden">
            {/* 1. HERO BANNER */}
            <Banner />

            {/* 1.1 RECOMMENDATIONS FOR YOU */}
            {user && <ForYouRecommendations userId={user.id} />}

            {/* 2. TRUST BADGES */}
            <section className="py-12 bg-[#fcfbf9] border-y border-stone-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {homeFeatures.map((f, i) => (
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

            {/* 3. BROWSE BY CATEGORY */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <span className="text-[10px] font-black tracking-[0.3em] text-orange-700 uppercase mb-4 block">Bộ sưu tập 2026</span>
                            <h2 className="text-4xl md:text-5xl font-black text-stone-900 tracking-tighter italic">KHÁM PHÁ THEO <br className="hidden md:block" /> DÒNG NHẠC CỤ</h2>
                        </div>
                        <p className="max-w-md text-stone-500 text-sm leading-relaxed mb-1">
                            Từ những chiếc guitar thủ công đến bộ gõ uy lực, chúng tôi mang cả thế giới âm nhạc đến tầm tay bạn.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {tree.slice(0, 4).map((cat) => (
                            <a 
                                key={cat.category_id}
                                href={`/collection/${cat.slug}`}
                                className="group relative aspect-[4/5] rounded-[40px] overflow-hidden bg-stone-100 border border-stone-100 hover:shadow-2xl transition-all duration-700"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                
                                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-4 group-hover:bg-orange-700 transition-all duration-500">
                                        <Music size={20} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">{cat.name}</h3>
                                    <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold tracking-widest uppercase group-hover:text-white transition-colors">
                                        Khám phá ngay <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Placeholder Image with hover zoom */}
                                <div className={`absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-orange-700/20 transition-all`} />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. CALL TO ACTION - "THE SOUND EXPERIENCE" */}
            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-[60px] bg-stone-950 p-12 md:p-24 overflow-hidden group text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
                        {/* Abstract Background Elements */}
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

            {/* 5. BRAND PARTNERS (Simple scrolling logotype) */}
            <section className="py-24 border-t border-stone-50">
                 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                         <p className="text-[9px] font-black tracking-[0.4em] text-stone-400 uppercase">Đối tác tin cậy</p>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        <span className="text-3xl font-black tracking-tighter italic text-stone-900">YAMAHA</span>
                        <span className="text-3xl font-black tracking-tighter italic text-stone-900">FENDER</span>
                        <span className="text-3xl font-black tracking-tighter italic text-stone-900">ROLAND</span>
                        <span className="text-3xl font-black tracking-tighter italic text-stone-900">MARSHALL</span>
                        <span className="text-3xl font-black tracking-tighter italic text-stone-900">KAWAI</span>
                    </div>
                 </div>
            </section>
        </main>
    );
};

export default Home;
