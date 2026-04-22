import { useEffect, useRef } from 'react'
// import { useAuth } from '@/hooks/useAuth';
import AppRouter from '@/router/index';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '@clerk/clerk-react';
import { useAppDispatch } from '@/store/hooks';
// import type { UserInfo } from './types/auth.types';
import { setAuthUser } from './store/slices/authSlice';

const App: React.FC = () => {
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();
  const dispatch = useAppDispatch();
  // Dùng ref để đảm bảo hydrateAuth chỉ chạy 1 lần khi khởi tạo (không phụ thuộc vào user)
  const hydrated = useRef(false);

  useEffect(() => {
    // Guard: Chỉ chạy 1 lần duy nhất khi app khởi động
    if (hydrated.current) return;
    hydrated.current = true;

    const hydrateAuth = async () => {
      // 1. Ưu tiên số 1: Nếu Redux chưa có user, kiểm tra LocalStorage
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          dispatch(setAuthUser(parsedUser));
          return; // Đã có user từ BE thì không cần check Clerk nữa
        } catch {
          // JSON parse lỗi → xóa đi
          localStorage.removeItem("user");
        }
      }

      // 2. Ưu tiên số 2: Nếu không có ở LocalStorage, mới check Clerk (cho Facebook/SSO khác)
      if (isSignedIn && isLoaded && clerkUser) {
        const clerkData = {
          email: clerkUser.emailAddresses[0].emailAddress,
          full_name: clerkUser.firstName + " " + clerkUser.lastName,
          avatar: clerkUser.imageUrl,
          mobile: clerkUser.phoneNumbers?.[0]?.phoneNumber || "",
          id: -1,
          role: "CUSTOMER",
        };
        dispatch(setAuthUser(clerkData));
        localStorage.setItem("user", JSON.stringify(clerkData));
      }
    };

    hydrateAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chạy 1 lần duy nhất khi mount

  return (
    <>
      <AppRouter />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App
