import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGoogleLogin } from '@react-oauth/google';
import { Truck, Award, CreditCard, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/schemas/auth.schema';

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginGoogle, isLoading, error } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Setup React Hook Form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle Đăng nhập truyền thống
  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      toast.success("Đăng nhập thành công");
      navigate('/'); // Thành công thì về trang chủ
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      // Lỗi đã được lưu trong Redux state `error`
    }
  };

  // Handle Đăng nhập bằng Google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        // Gửi access_token của Google xuống BE của bạn
        await loginGoogle({ token: tokenResponse.access_token });
        toast.success("Đăng nhập thành công");
        navigate('/');
      } catch (err) {
        console.error('Lỗi đăng nhập Google:', err);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      console.error('Đăng nhập Google thất bại');
    },
  });

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 py-12 font-sans">
      <div className="max-w-225 w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 bg-white p-8 md:p-12 shadow-sm border border-stone-200">
        
        {/* ================= TRÁI: FORM ĐĂNG NHẬP ================= */}
        <div className="flex flex-col border border-stone-200 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#A68A48] mb-2 uppercase">Đăng nhập</h2>
          <p className="text-sm text-black-600 mb-8">
            Chưa đăng ký thành viên?{' '}
            <Link to="/register" className="text-[#A68A48] underline hover:text-stone-500">Đăng ký</Link> tại đây
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Field Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-stone-700 font-normal">Địa chỉ email</FormLabel>
                    <FormControl>
                      {/* Override CSS Shadcn: Xóa viền quanh, chỉ giữ viền dưới */}
                      <Input 
                        {...field} 
                        className="border-0 border-b border-stone-300 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-[#A68A48] focus-visible:border-b-2 transition-colors bg-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Field Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-stone-700 font-normal">Mật Khẩu</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        {...field} 
                        className="border-0 border-b border-stone-300 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-[#A68A48] focus-visible:border-b-2 transition-colors bg-transparent"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Báo lỗi từ Redux (nếu sai tài khoản/mật khẩu) */}
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              {/* Nút Đăng nhập */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#A68A48] hover:bg-[#8e7539] text-white font-bold h-12 text-base transition-colors"
              >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Đăng nhập'}
              </Button>

              <div className="mt-2">
                <Link to="/forgot-password" className="text-sm text-stone-900 underline hover:text-[#A68A48] transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
            </form>
          </Form>

          {/* Social Login */}
          <div className="mt-8 space-y-3">
            <Button 
              variant="outline" 
              type="button"
              disabled={googleLoading}
              onClick={() => handleGoogleLogin()}
              className="w-full h-12 border-stone-300 hover:bg-stone-50 flex items-center justify-center gap-3 text-stone-700 font-semibold"
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Đăng nhập với Google
            </Button>

            {/* <Button 
              variant="outline" 
              type="button"
              className="w-full h-12 border-stone-300 hover:bg-stone-50 flex items-center justify-center gap-3 text-stone-700 font-semibold"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Đăng nhập với Facebook
            </Button> */}
          </div>
        </div>

        {/* ================= PHẢI: THÔNG TIN LỢI ÍCH ================= */}
        <div className="flex flex-col pt-4 md:pt-8 md:pl-6">
          <h2 className="text-lg md:text-xl font-bold text-[#A68A48] mb-4 uppercase">Lý do đăng ký?</h2>
          <p className="text-stone-700 mb-8 leading-relaxed">
            Tạo tài khoản nhanh chóng, dễ dàng và miễn phí! Hơn nữa, bạn sẽ được truy cập vào những tính năng tuyệt vời chỉ dành riêng cho thành viên:
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 border border-stone-300 rounded-full shrink-0">
                <Truck className="w-5 h-5 text-stone-700" />
              </div>
              <p className="text-stone-800 pt-1">Theo dõi đơn hàng online dễ dàng</p>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 border border-stone-300 rounded-full shrink-0">
                <Award className="w-5 h-5 text-stone-700" />
              </div>
              <p className="text-stone-800 pt-1">Tích điểm, nhận thưởng độc quyền và nhiều lợi ích chỉ dành cho thành viên</p>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 border border-stone-300 rounded-full shrink-0">
                <CreditCard className="w-5 h-5 text-stone-700" />
              </div>
              <p className="text-stone-800 pt-1">Thao tác thanh toán nhanh gọn</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;