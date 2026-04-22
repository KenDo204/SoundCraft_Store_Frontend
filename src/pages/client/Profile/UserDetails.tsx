import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyProfile, updateMyProfile, changeMyPassword } from '@/store/slices/user.slice';
import { updateProfileSchema, changePasswordSchema, type UpdateProfileFormValues, type ChangePasswordFormValues } from '@/schemas/auth.schema';
import { Camera, Loader2, Mail, CalendarRange } from 'lucide-react';
import { toast } from 'react-toastify';
import type { UserInfo } from '@/types/user.type';
import dayjs from 'dayjs';

export const UserDetails = ({ user: userProp }: { user: UserInfo | null }) => {
  const dispatch = useAppDispatch();
  const { profile: userStore, isUpdating } = useAppSelector((state) => state.user);
  
  // Ưu tiên user từ store (được cập nhật real-time) hơn prop
  const user = userStore || userProp;
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- FORM 1: THÔNG TIN CÁ NHÂN ---
  const profileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      full_name: '', mobile: '', dob: '', gender: 'OTHER'
    },
    values: user ? {
      full_name: user.full_name || '',
      mobile: user.mobile || '',
      dob: user.dob || '',
      gender: user.gender || 'OTHER',
    } : undefined,
  });

  // --- FORM 2: ĐỔI MẬT KHẨU ---
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  // Gọi API lấy profile nếu chưa có dữ liệu
  useEffect(() => {
    if (!user) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.avatar) {
      setPreviewUrl(user.avatar);
    }
  }, [user?.avatar]);

  // Đổ dữ liệu khi có profile
  useEffect(() => {
    console.log("Check cấu trúc user từ Redux:", user);
    if (user) {
      profileForm.reset({
        full_name: user.full_name || '',
        mobile: user.mobile || '',
        dob: user.dob || '',
        gender: user.gender || 'OTHER',
      });
      setPreviewUrl(user.avatar || null);
    }
  }, [user, profileForm]);

  // Xử lý chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) {
         toast.error("Kích thước ảnh không được vượt quá 2MB");
         return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Submit Cập nhật thông tin
  const onProfileSubmit = async (data: UpdateProfileFormValues) => {
    try {
      await dispatch(updateMyProfile({ ...data, file })).unwrap();
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra");
    }
  };

  // Submit Đổi mật khẩu
  const onPasswordSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await dispatch(changeMyPassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })).unwrap();
      toast.success("Đổi mật khẩu thành công!");
      passwordForm.reset(); // Xóa trắng form sau khi đổi xong
    } catch (error: any) {
      toast.error(error || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* KHU VỰC 1: THÔNG TIN CÁ NHÂN */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-6">Thông tin cá nhân</h2>
        
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full border-2 border-stone-200 overflow-hidden bg-stone-50">
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100 font-bold text-2xl">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white w-6 h-6" />
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">Ảnh đại diện</p>
              <p className="text-xs text-stone-500 mt-1">Định dạng JPG, PNG. Tối đa 2MB.</p>
              {/* {user?.role && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-[11px] font-bold text-orange-700 uppercase tracking-wider">
                  <ShieldCheck size={12} />
                  {user.role.replace('ROLE_', '')}
                </div>
              )} */}
              {user?.created_at && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                  <CalendarRange size={12} />
                  Thành viên từ: {dayjs(user.created_at).format('DD/MM/YYYY')}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email (Read only) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Địa chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input 
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="flex h-11 w-full rounded-md border border-stone-200 bg-stone-50 pl-10 pr-3 py-2 text-sm text-stone-500 cursor-not-allowed italic"
                />
              </div>
            </div>
            {/* Họ và tên (Shadcn style) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Họ và tên <span className="text-red-500">*</span></label>
              <input 
                {...profileForm.register('full_name')}
                className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              />
              {profileForm.formState.errors.full_name && <p className="text-xs text-red-500">{profileForm.formState.errors.full_name.message}</p>}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Số điện thoại</label>
              <input 
                {...profileForm.register('mobile')}
                className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition-all"
              />
              {profileForm.formState.errors.mobile && <p className="text-xs text-red-500">{profileForm.formState.errors.mobile.message}</p>}
            </div>

            {/* Ngày sinh */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Ngày sinh</label>
              <input 
                type="date"
                {...profileForm.register('dob')}
                className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              />
            </div>

            {/* Giới tính */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Giới tính</label>
              <select 
                {...profileForm.register('gender')}
                className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isUpdating}
            className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50 bg-stone-900 text-white hover:bg-orange-600 h-11 px-8"
          >
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Lưu thay đổi
          </button>
        </form>
      </section>

      <hr className="border-stone-100" />

      {/* KHU VỰC 2: ĐỔI MẬT KHẨU */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-6">Đổi mật khẩu</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700">Mật khẩu hiện tại</label>
            <input 
              type="password"
              {...passwordForm.register('currentPassword')}
              className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            />
            {passwordForm.formState.errors.currentPassword && <p className="text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700">Mật khẩu mới</label>
            <input 
              type="password"
              {...passwordForm.register('newPassword')}
              className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            />
            {passwordForm.formState.errors.newPassword && <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700">Xác nhận mật khẩu mới</label>
            <input 
              type="password"
              {...passwordForm.register('confirmPassword')}
              className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            />
            {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isUpdating}
            className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50 bg-stone-100 text-stone-900 hover:bg-stone-200 h-11 px-8 border border-stone-200"
          >
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Cập nhật mật khẩu
          </button>
        </form>
      </section>

    </div>
  );
};