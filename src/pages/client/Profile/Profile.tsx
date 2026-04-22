import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchMyProfile } from '@/store/slices/user.slice';

// --- Thay thế MUI Icons bằng Lucide Icons cho chuẩn phong cách Shadcn ---
import { User, ShoppingBag, MapPin, LogOut } from 'lucide-react';

// --- Import các Components con ---
import { UserDetails } from './UserDetails'; // Component ta vừa tạo lúc nãy
import { Orders } from '../Orders/Orders';
// import { SavedCards } from './SavedCards';
// import { Addresses } from './Addresses';

// --- Giữ nguyên Snackbar của MUI theo ý bạn ---
import { Snackbar, Alert } from '@mui/material';
import { Addresses } from '../Address/Addresses';

const menu = [
    { name: "Hồ sơ cá nhân", path: "/account/profile", icon: <User size={20} /> },
    { name: "Đơn hàng của tôi", path: "/account/orders", icon: <ShoppingBag size={20} /> },
    // { name: "Thẻ thanh toán", path: "/account/saved-card", icon: <CreditCard size={20} /> },
    { name: "Sổ địa chỉ", path: "/account/addresses", icon: <MapPin size={20} /> },
    { name: "Đăng xuất", path: "/", icon: <LogOut size={20} /> }
];

const Profile = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    
    // Lấy THÔNG TIN THẬT từ slice User mà ta đã viết
    const { profile, isLoading, error } = useAppSelector(state => state.user);
    
    const [snackbarOpen, setOpenSnackbar] = useState(false);

    useEffect(() => {
        // Chỉ gọi API nếu chưa có profile trong Redux
        if (!profile) {
            dispatch(fetchMyProfile());
        }
    }, [dispatch, profile]);

    const handleLogout = () => {
        // Gọi action logout Redux ở đây nếu có
        // dispatch(logoutAction());
        navigate("/login");
    }

    const handleClick = (item: any) => {
        if (item.name === "Đăng xuất") {
            handleLogout();
        } else {
            navigate(item.path);
        }
    }

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    // Bắt lỗi từ Redux để hiện Snackbar
    useEffect(() => {
        if (error) {
            setOpenSnackbar(true);
        }
    }, [error]);

    return (
        <div className='bg-[#fcfbf9] min-h-screen py-10 pb-20 font-sans'>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* =========================================
                    HEADER GREETING
                ========================================= */}
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className='text-3xl md:text-4xl font-black text-stone-900 tracking-tight'>
                        Xin chào, <span className="text-orange-600">{profile?.full_name || 'Khách hàng'}</span>
                    </h1>
                    <p className="text-stone-500 mt-2 font-medium">Quản lý thông tin tài khoản, mật khẩu và lịch sử mua hàng của bạn.</p>
                </div>

                <div className='flex flex-col lg:flex-row gap-8 lg:gap-12'>
                    
                    {/* =========================================
                        SIDEBAR NAVIGATION
                    ========================================= */}
                    <div className="w-full lg:w-1/4 flex-shrink-0 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="bg-white p-4 rounded-[24px] shadow-sm border border-stone-200 sticky top-24 flex flex-col gap-1.5">
                            {menu.map((item) => {
                                // Logic check active route chính xác hơn
                                const isActive = location.pathname.includes(item.path) || (location.pathname === '/account' && item.path === '/account/profile');
                                const isLogout = item.name === "Đăng xuất";

                                return (
                                    <div
                                        key={item.name}
                                        onClick={() => handleClick(item)}
                                        className={`group flex items-center gap-3 px-5 py-3.5 rounded-xl cursor-pointer transition-all duration-300 font-bold text-[15px]
                                            ${isActive 
                                                ? "bg-[#9f8a46] text-white shadow-md transform scale-[1.02]" 
                                                : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                                            }
                                            ${isLogout ? "mt-2 text-red-700 bg-red-300 hover:bg-red-700 hover:text-white hover:scale-[1.02] shadow-sm" : ""}
                                        `}
                                    >
                                        <span className={`transition-transform duration-300 ${isActive ? "text-white" : "group-hover:scale-110"}`}>
                                            {item.icon}
                                        </span>
                                        <p>{item.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* =========================================
                        MAIN CONTENT AREA (Nơi chứa UserDetails)
                    ========================================= */}
                    <div className='w-full lg:w-3/4'>
                        <div className="bg-white rounded-[32px] shadow-sm border border-stone-200 p-6 sm:p-10 min-h-[60vh] animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {isLoading && !profile && (
                                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-stone-200 border-t-orange-600 rounded-full animate-spin" />
                                </div>
                            )}
                            <Routes>
                                {/* Mặc định khi vào /account sẽ render UserDetails */}
                                <Route path='/' element={<UserDetails user={profile} />} />
                                <Route path='/profile' element={<UserDetails user={profile} />} />
                                
                                {/* Các route khác (Bạn mở comment khi code xong component) */}
                                <Route path='/orders' element={<Orders />} />
                                {/* <Route path='/saved-card' element={<SavedCards />} /> */}
                                <Route path='/addresses' element={<Addresses />} />
                            </Routes>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================================
                SNACKBAR THÔNG BÁO CHUNG
            ========================================= */}
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={error ? "error" : "success"}
                    variant="filled"
                    sx={{ width: "100%", borderRadius: "12px", fontWeight: 'bold' }}
                >
                    {error || "Thao tác thành công"}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default Profile;