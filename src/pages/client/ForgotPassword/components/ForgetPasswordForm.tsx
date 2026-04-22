import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Loader2, Mail, Lock, KeyRound } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { decrementTimer, setIsOtpTimerActive, setOtpTimer } from '@/store/slices/timerSlice';
import { resetPasswordSchema } from '@/schemas/auth.schema';
import OTPInput from './OTPInput';

const ForgetPasswordForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { forgotPassword, resetPassword, isLoading, } = useAuth();
  
  // Lấy trạng thái từ store (Lưu ý: chỉnh lại tên reducer cho đúng với store của bạn)
  const isOtpForgetSent = useAppSelector(state => state.auth.isOtpForgetSent); 
  const { otpTimer, isOtpTimerActive } = useAppSelector(state => state.timer);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Quản lý đếm ngược OTP
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isOtpTimerActive && otpTimer > 0) {
      interval = setInterval(() => {
        dispatch(decrementTimer());
      }, 1000);
    } else if (otpTimer === 0 && isOtpTimerActive) {
      dispatch(setIsOtpTimerActive(false));
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isOtpTimerActive, otpTimer, dispatch]);

  // Gửi OTP lần đầu
  const handleSendOtp = async () => {
    if (!form.email) {
      toast.error("Vui lòng nhập email");
      return;
    }
    try {
      await forgotPassword({ email: form.email });
      toast.success("Mã OTP đã được gửi vào email của bạn");
      dispatch(setOtpTimer(30));
      dispatch(setIsOtpTimerActive(true));
    } catch (err) {
      // Lỗi đã được useAuth handle vào state error
    }
  };

  // Xác nhận đặt lại mật khẩu
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate bằng Zod
    const validation = resetPasswordSchema.safeParse({ 
      email: form.email, 
      otp: otp, 
      newPassword: form.newPassword 
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0]; 
      toast.error(firstError.message);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await resetPassword({ 
        email: form.email, 
        otp: otp, 
        newPassword: form.newPassword 
      });
      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-[#f5f4ef] rounded-xl shadow-sm border border-stone-200">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#9F8A46] uppercase tracking-tight">
          Quên mật khẩu
        </h1>
        <p className="text-sm text-stone-500 mt-2">
          {isOtpForgetSent 
            ? "Nhập mã xác thực và mật khẩu mới của bạn" 
            : "Nhập email để nhận mã xác thực đặt lại mật khẩu"}
        </p>
      </div>

      <form className="space-y-5" onSubmit={isOtpForgetSent ? handleResetSubmit : (e) => e.preventDefault()}>
        {/* Trường Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-stone-700 font-semibold">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
            <Input
              id="email"
              placeholder="example@gmail.com"
              disabled={isOtpForgetSent}
              className="pl-10 bg-white border-stone-200 focus-visible:ring-[#00927c]"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        {isOtpForgetSent && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Mật khẩu mới */}
            <div className="space-y-2">
              <Label htmlFor="newPassword text-stone-700 font-semibold">Mật khẩu mới</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10 bg-white"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nhập lại mật khẩu */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword text-stone-700 font-semibold">Xác nhận mật khẩu</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="pl-10 pr-10 bg-white"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* OTP Input */}
            <div className="space-y-3 pt-2">
              <Label className="text-stone-700 font-semibold text-center block">Mã xác thực OTP</Label>
              <div className="flex justify-center">
                <OTPInput 
                  otp={otp} 
                  length={6} 
                  setOtp={setOtp} 
                  onChange={(val) => setOtp(val)} 
                />
              </div>
              <div className="text-center">
                {isOtpTimerActive ? (
                  <p className="text-xs text-stone-500">Gửi lại mã sau <span className="font-bold text-theme-olive">{otpTimer}s</span></p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="text-xs font-bold text-[#00927c] hover:underline"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Nút bấm hành động */}
        <Button
          type="button"
          onClick={isOtpForgetSent ? handleResetSubmit : handleSendOtp}
          disabled={isLoading}
          className="w-full bg-[#9F8A46] hover:bg-[#7a6b2b] text-white font-bold h-11 transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : isOtpForgetSent ? (
            "Đặt lại mật khẩu"
          ) : (
            "Gửi mã OTP"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ForgetPasswordForm;