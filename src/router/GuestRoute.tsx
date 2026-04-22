import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { PATHS } from '@/config/paths';

const GuestRoute: React.FC = () => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#A68A48]" />
      </div>
    );
  }

  // Đã đăng nhập rồi mà cố vào Login -> Đá về Home
  if (isAuthenticated) {
    return <Navigate to={PATHS.HOME} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;