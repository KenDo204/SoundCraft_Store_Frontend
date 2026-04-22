import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  // Đang kiểm tra token ngầm khi F5, hiện màn hình loading trắng
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#A68A48]" />
      </div>
    );
  }

  // Đã kiểm tra xong nhưng không có quyền -> Đá về Login, kèm theo URL cũ để đăng nhập xong quay lại
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Hợp lệ -> Cho phép truy cập component con
  return <Outlet />;
};

export default ProtectedRoute;