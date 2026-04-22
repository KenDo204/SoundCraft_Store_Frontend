import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Loader2, Mail, Lock, User, KeyRound } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerThunk, loginGoogleThunk } from '@/store/slices/authSlice';
import { registerSchema } from '@/schemas/auth.schema';
import { useGoogleLogin } from '@react-oauth/google';

const SignupForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux States
  const { isLoading, isGoogleLoading } = useAppSelector(state => state.auth);
  const isAnyLoading = isLoading || isGoogleLoading;

  // Local States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Xử lý Đăng ký trực tiếp
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyLoading) return;

    // Validate bằng Zod
    const validation = registerSchema.safeParse(form);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    // Gọi Thunk đăng ký (truyền full_name, email, password)
    const { type } = await dispatch(registerThunk({
      full_name: form.full_name,
      email: form.email,
      password: form.password
    }));

    if (type.search('rejected') === -1) {
      toast.success("Đăng ký tài khoản thành công!");
      navigate("/login");
    }
  };

  // Google Login
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await dispatch(loginGoogleThunk({ token: tokenResponse.access_token }));
      navigate("/");
    },
    onError: () => toast.error("Đăng nhập Google thất bại"),
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-theme-olive uppercase tracking-tight">Tạo tài khoản mới</h2>
        <p className="text-sm text-stone-500 mt-1">Gia nhập cộng đồng yêu nhạc cụ ShopMe</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Họ và Tên */}
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-stone-700">Họ và Tên</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <Input
              id="full_name"
              placeholder="Nguyễn Văn A"
              className="pl-10 focus-visible:ring-theme-olive"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-stone-700">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="pl-10 focus-visible:ring-theme-olive"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        {/* Mật khẩu */}
        <div className="space-y-2">
          <Label htmlFor="password text-stone-700">Mật khẩu</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="pl-10 pr-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="space-y-2">
          <Label htmlFor="confirm text-stone-700">Xác nhận mật khẩu</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <Input
              id="confirm"
              type={showConfirmPassword ? "text" : "password"}
              className="pl-10 pr-10"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Nút Đăng ký */}
        <Button
          type="submit"
          disabled={isAnyLoading}
          className="w-full bg-theme-olive hover:bg-[#665924] text-white font-bold h-12 rounded-lg transition-all shadow-md mt-2"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            "Đăng ký ngay"
          )}
        </Button>

        {/* Đường kẻ ngang */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-100"></span></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-stone-400">Hoặc đăng ký bằng</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-1 gap-4">
          <Button
            type="button"
            variant="outline"
            className="border-stone-200 hover:bg-stone-50 hover:text-[#DB4437] transition-all"
            onClick={() => loginWithGoogle()}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>
          {/* <Button
            type="button"
            variant="outline"
            className="border-stone-200 hover:bg-stone-50 hover:text-[#4267B2] transition-all"
            onClick={() => { }}
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
            Facebook
          </Button> */}
        </div>
      </form>
    </div>
  );
};

export default SignupForm;