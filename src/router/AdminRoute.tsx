import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const AdminRoute: React.FC = () => {
  // Giả sử hook useAuth của bạn trả về object user chứa thông tin role
  const { isAuthenticated, isInitialized, user } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#A68A48]" />
      </div>
    );
  }

  // 1. Chưa đăng nhập -> Đá về Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Đã đăng nhập nhưng không phải Admin/Owner -> Đá về Trang chủ
  // (Bạn cần điều chỉnh 'admin' và 'owner' cho khớp với data trả về từ Backend của bạn)
  const isAuthorized = user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_OWNER';
  
  if (!isAuthorized) {
    return <Navigate to="/" replace />; 
  }

  // 3. Hợp lệ -> Render Layout Admin
  return <Outlet />;
};

export default AdminRoute;