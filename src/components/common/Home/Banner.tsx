import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchActiveSliders } from '@/store/slices/slider.slice';

const Banner: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    // Lấy state từ Redux
    const { activeList: sliders, isLoading } = useAppSelector(state => state.sliders);
    
    // State cho Carousel
    const [currentIndex, setCurrentIndex] = useState(0);

    // Gọi API khi load component
    useEffect(() => {
        if (sliders.length === 0) {
            dispatch(fetchActiveSliders());
        }
    }, [dispatch, sliders.length]);

    // Tự động chuyển Slide sau 5 giây
    useEffect(() => {
        if (sliders.length <= 1) return; // Không cần auto-play nếu chỉ có 1 banner
        
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % sliders.length);
        }, 5000);
        
        return () => clearInterval(timer);
    }, [sliders.length]);

    // Hàm chuyển Slide thủ công
    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % sliders.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));

    return (
        <section className="bg-stone-50 py-12 font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                
                {/* =========================================
                    1. MAIN CAROUSEL BANNER (Dynamic)
                ========================================= */}
                <div className="relative rounded-[32px] overflow-hidden mb-10 group bg-stone-900 shadow-2xl h-[450px] md:h-[550px] lg:h-[650px]">
                    
                    {isLoading ? (
                        // Skeleton Loading khi đang chờ API
                        <div className="w-full h-full bg-stone-200 animate-pulse flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-stone-300 border-t-orange-500 rounded-full animate-spin" />
                        </div>
                    ) : sliders.length === 0 ? (
                        // Fallback nếu không có banner nào đang bật
                        <div className="w-full h-full bg-stone-800 flex flex-col items-center justify-center text-stone-400">
                            <span className="text-2xl font-black tracking-widest uppercase">SOUND CRAFT</span>
                            <span className="text-sm mt-2">Khơi nguồn cảm hứng âm nhạc</span>
                        </div>
                    ) : (
                        // Render danh sách Sliders từ Backend
                        sliders.map((slider, index) => (
                            <div 
                                key={slider.slider_id}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                    index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                                }`}
                            >
                                {/* Ảnh nền */}
                                <img
                                    src={slider.image_url} 
                                    alt={slider.title}
                                    className="w-full h-full object-cover opacity-80"
                                />
                                
                                {/* Lớp phủ Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/50 to-transparent flex items-center">
                                    <div className="px-8 md:px-16 lg:px-24 max-w-3xl transform transition-all duration-700 delay-300 translate-y-0 opacity-100">
                                        
                                        {/* Tên thương hiệu (Nếu có) */}
                                        <p className="text-orange-500 text-xs md:text-sm font-black tracking-[0.3em] mb-4 uppercase drop-shadow-md flex items-center gap-3">
                                            <span className="w-8 h-[2px] bg-orange-500"></span>
                                            {slider.brand ? slider.brand.name : 'Bộ Sưu Tập Mới'}
                                        </p>
                                        
                                        {/* Tiêu đề chính */}
                                        <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tighter drop-shadow-xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                            {slider.title}
                                        </h1>
                                        
                                        {/* Tiêu đề phụ (Sub-title) */}
                                        <p className="text-stone-300 text-sm md:text-lg mb-10 font-medium tracking-wide drop-shadow-md max-w-xl line-clamp-2">
                                            {slider.sub_title}
                                        </p>
                                        
                                        {/* Nút hành động */}
                                        <button 
                                            onClick={() => navigate(slider.target_url || '/')}
                                            className="bg-stone-100 hover:bg-orange-600 text-stone-900 hover:text-white font-black px-10 py-4 rounded-full transition-all duration-300 text-xs md:text-sm tracking-[0.2em] uppercase shadow-xl hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] active:scale-95"
                                        >
                                            Khám Phá Ngay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Controls (Chỉ hiện khi có nhiều hơn 1 banner) */}
                    {!isLoading && sliders.length > 1 && (
                        <>
                            {/* Nút Mũi tên */}
                            <button 
                                onClick={prevSlide}
                                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/10 active:scale-90"
                            >
                                <ChevronLeft className="w-8 h-8 ml-[-2px]" />
                            </button>
                            <button 
                                onClick={nextSlide}
                                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 border border-white/10 active:scale-90"
                            >
                                <ChevronRight className="w-8 h-8 mr-[-2px]" />
                            </button>

                            {/* Dải chấm phân trang */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                                {sliders.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-2 rounded-full transition-all duration-500 shadow-sm ${
                                            idx === currentIndex 
                                            ? 'w-8 bg-orange-500' 
                                            : 'w-2 bg-white/40 hover:bg-white/80'
                                        }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* =========================================
                    2. PROMOTION GRID BOXES (Tĩnh - Marketing phụ)
                ========================================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Ô TAMA */}
                    <div className="bg-white rounded-[32px] p-8 md:p-10 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all duration-500 cursor-pointer border border-stone-100 group">
                        <div className="flex-1 w-full text-center sm:text-left">
                            <div className="text-4xl font-black tracking-tighter italic text-stone-900 mb-6 drop-shadow-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                TAMA
                            </div>
                            <p className="text-[10px] font-black tracking-[0.2em] text-stone-400 mb-3 uppercase">
                                Uy lực và chuẩn xác
                            </p>
                            <h3 className="font-black text-2xl text-stone-900 leading-snug group-hover:text-orange-700 transition-colors">
                                Trống & Phụ Kiện <br className="hidden sm:block" /> Mới Nhất
                            </h3>
                        </div>
                        <div className="w-40 md:w-48 shrink-0">
                            <img
                                src="https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400&h=300&fit=crop" 
                                alt="TAMA Drums"
                                className="w-full h-auto object-cover rounded-2xl drop-shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700"
                            />
                        </div>
                    </div>

                    {/* Ô MONO */}
                    <div className="bg-stone-950 rounded-[32px] p-8 md:p-10 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 relative overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-500 cursor-pointer border border-stone-800 group">
                        {/* Text chìm nền */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[140px] font-black text-white/[0.02] pointer-events-none select-none tracking-tighter">
                            mono
                        </div>
                        
                        <div className="flex-1 w-full relative z-10 text-center sm:text-left">
                            <div className="text-4xl font-black tracking-tighter text-white mb-6 drop-shadow-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                                mono
                            </div>
                            <p className="text-[10px] font-black tracking-[0.2em] text-orange-500 mb-3 uppercase">
                                Tối ưu bảo vệ
                            </p>
                            <h3 className="font-black text-2xl text-white leading-snug group-hover:text-orange-500 transition-colors">
                                Hộp & Bao Đàn <br className="hidden sm:block" /> Cho Mọi Buổi Diễn
                            </h3>
                        </div>
                        
                        <div className="w-40 md:w-56 shrink-0 relative z-10">
                            <img
                                src="https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400&h=300&fit=crop" 
                                alt="Mono Cases"
                                className="w-full h-auto object-cover rounded-2xl drop-shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Banner;