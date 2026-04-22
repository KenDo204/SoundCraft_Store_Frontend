import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Disc3 } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfbf9] font-sans relative overflow-hidden">
      
      {/* Hiệu ứng ánh sáng nền (Glow Effect) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Typograhpy 404 & Đĩa xoay */}
        <div className="relative flex items-center justify-center mb-6">
          <h1 
            className="text-[140px] md:text-[200px] font-black text-stone-900 tracking-tighter leading-none select-none" 
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            4
            {/* Chữ số 0 được làm thành màu cam để chứa đĩa than */}
            <span className="text-orange-600 relative inline-block">
              0
              {/* Đĩa than xoay tròn liên tục */}
              <Disc3 
                className="absolute text-white w-14 h-14 md:w-20 md:h-20 animate-[spin_3s_linear_infinite]" 
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} 
                strokeWidth={1.5}
              />
            </span>
            4
          </h1>
        </div>

        {/* Thông báo lỗi */}
        <h2 className="text-3xl md:text-4xl font-black text-stone-800 mb-4 tracking-tight" 
        style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Lạc nhịp rồi!
        </h2>
        <p className="text-stone-500 font-medium max-w-md mx-auto mb-10 text-sm md:text-base leading-relaxed">
          Giai điệu bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không thể phát. Hãy thử quay lại trang chủ nhé.
        </p>

        {/* Nút điều hướng */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Nút Back (Quay lại trang trước đó) */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-stone-200 text-stone-600 font-bold hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 transition-all w-full sm:w-auto"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
          
          {/* Nút Home (Về trang chủ) */}
          <button
            onClick={() => navigate('/')}
            className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-stone-900 text-white font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Home size={18} className="group-hover:scale-110 transition-transform" />
            Về Trang Chủ
          </button>
        </div>
      </div>

      {/* Chữ ký thương hiệu phía dưới cùng */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
        <p className="text-[10px] font-black tracking-[0.3em] text-stone-300 uppercase">
          Sound Craft Music Co.
        </p>
      </div>
    </div>
  );
};