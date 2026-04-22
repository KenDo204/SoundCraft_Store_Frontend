import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyProfile, updateMyProfile, changeMyPassword } from '@/store/slices/user.slice';
import { updateProfileSchema, changePasswordSchema, type UpdateProfileFormValues, type ChangePasswordFormValues } from '@/schemas/auth.schema';
import { Box, TextField, Button, MenuItem, Typography, Avatar, IconButton, CircularProgress, Chip } from '@mui/material';
import { PhotoCamera, Email, AdminPanelSettings, CalendarMonth } from '@mui/icons-material';
import { Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const THEME_COLOR = '#9f8a46';

export const AdminProfile = () => {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isUpdating } = useAppSelector((state) => state.user);
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form Thông tin
  const profileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    values: profile ? {
      full_name: profile.full_name || '',
      mobile: profile.mobile || '',
      dob: profile.dob || '',
      gender: profile.gender || 'OTHER',
    } : undefined,
  });

  // Form Mật khẩu
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (!profile) {
      dispatch(fetchMyProfile());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || '',
        mobile: profile.mobile || '',
        dob: profile.dob || '',
        gender: profile.gender || 'OTHER',
      });
      setPreviewUrl(profile.avatar || null);
    }
  }, [profile, profileForm]);

  useEffect(() => {
    if (profile?.avatar) {
      setPreviewUrl(profile.avatar);
    }
  }, [profile?.avatar])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const onProfileSubmit = async (data: UpdateProfileFormValues) => {
    try {
      await dispatch(updateMyProfile({ ...data, file })).unwrap();
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra");
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await dispatch(changeMyPassword({ currentPassword: data.currentPassword, newPassword: data.newPassword })).unwrap();
      toast.success("Đổi mật khẩu thành công!");
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error || "Đổi mật khẩu thất bại");
    }
  };

  const textFieldStyle = {
    backgroundColor: 'white',
    '& .MuiOutlinedInput-root': { borderRadius: '12px', '&:hover fieldset': { borderColor: THEME_COLOR }, '&.Mui-focused fieldset': { borderColor: THEME_COLOR, borderWidth: '2px' } },
    '& .MuiInputLabel-root.Mui-focused': { color: THEME_COLOR },
  };

  return (
    <div className="p-4 lg:p-8 bg-[#fcfbf9] min-h-screen font-sans relative">
      {(isLoading && !profile) && (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
            <CircularProgress sx={{ color: THEME_COLOR }} />
            <Typography sx={{ mt: 2, color: THEME_COLOR, fontWeight: 'bold' }}>Đang tải dữ liệu...</Typography>
        </div>
      )}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* KHU VỰC 1: THÔNG TIN CÁ NHÂN */}
        <div className="bg-white rounded-[32px] shadow-sm border border-stone-200 overflow-hidden transform transition-all duration-500 hover:shadow-md">
          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-[#9f8a46] to-[#d4c38d] relative">
              <div className="absolute -bottom-10 left-8">
                  <div className="relative">
                    <Avatar src={previewUrl || ''} sx={{ width: 100, height: 100, border: '4px solid white', bgcolor: '#f3f4f6', color: '#9ca3af', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                      {profile?.full_name?.charAt(0)}
                    </Avatar>
                    <IconButton color="primary" aria-label="upload picture" component="label" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'white', boxShadow: 2, p: 0.5, border: '1px solid #e5e7eb', '&:hover': { bgcolor: '#f8fafc' } }}>
                      <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                      <PhotoCamera sx={{ color: THEME_COLOR, fontSize: 18 }} />
                    </IconButton>
                  </div>
              </div>
          </div>

          <div className="pt-14 p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                   <Typography variant="h5" className="font-black text-stone-900 tracking-tight">Hồ sơ Quản trị viên</Typography>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                       <Typography variant="body2" color="textSecondary">Quản lý các thông tin cá nhân và quyền hạn.</Typography>
                       {profile?.created_at && (
                        <Typography variant="caption" display="flex" alignItems="center" gap={0.5} color="textSecondary" sx={{ bgcolor: 'stone.100', px: 1, py: 0.2, borderRadius: 1 }}>
                            <CalendarMonth sx={{ fontSize: 14 }} />
                            Gia nhập: {dayjs(profile.created_at).format('DD/MM/YYYY')}
                        </Typography>
                       )}
                   </Box>
                </div>
                {profile?.role && (
                   <Chip 
                     icon={<AdminPanelSettings sx={{ fontSize: '16px !important', color: `${THEME_COLOR} !important` }} />} 
                     label={profile.role.replace('ROLE_', '')} 
                     sx={{ bgcolor: '#fefce8', color: THEME_COLOR, fontWeight: 'bold', border: `1px solid ${THEME_COLOR}33`, borderRadius: '8px', px: 1 }} 
                   />
                )}
            </div>
            
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Section */}
                <Box className="md:col-span-2 p-4 bg-stone-50 rounded-xl border border-stone-100 flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-stone-200 shadow-sm">
                        <Email sx={{ color: THEME_COLOR, fontSize: 20 }} />
                    </div>
                    <div>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', display: 'block', mb: -0.5 }}>ĐỊA CHỈ EMAIL</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>{profile?.email || 'N/A'}</Typography>
                    </div>
                </Box>
                <TextField 
                  fullWidth label="Họ và tên" sx={textFieldStyle}
                  InputLabelProps={{ shrink: true }}
                {...profileForm.register('full_name')}
                error={!!profileForm.formState.errors.full_name}
                helperText={profileForm.formState.errors.full_name?.message}
              />
              <TextField 
                fullWidth label="Số điện thoại" sx={textFieldStyle}
                {...profileForm.register('mobile')}
                error={!!profileForm.formState.errors.mobile}
                helperText={profileForm.formState.errors.mobile?.message}
              />
              <TextField 
                fullWidth type="date" label="Ngày sinh" InputLabelProps={{ shrink: true }} sx={textFieldStyle}
                {...profileForm.register('dob')}
              />
              <TextField 
                select fullWidth label="Giới tính" defaultValue="OTHER" sx={textFieldStyle}
                {...profileForm.register('gender')}
              >
                <MenuItem value="MALE">Nam</MenuItem>
                <MenuItem value="FEMALE">Nữ</MenuItem>
                <MenuItem value="OTHER">Khác</MenuItem>
              </TextField>
            </div>

            <Button 
              type="submit" variant="contained" disabled={isUpdating}
              startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ mt: 4, bgcolor: THEME_COLOR, color: 'white', borderRadius: '10px', px: 4, py: 1.5, fontWeight: 'bold', boxShadow: 'none', '&:hover': { bgcolor: '#87743b' } }}
            >
              Lưu Thông Tin
            </Button>
          </form>
        </div>

        {/* KHU VỰC 2: ĐỔI MẬT KHẨU */}
        <div className="bg-white rounded-[32px] shadow-sm border border-stone-200 p-8 transform transition-all duration-500 hover:shadow-md">
          <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Shield size={24} />
              </div>
              <Typography variant="h5" className="font-black text-stone-900 tracking-tight">Đổi mật khẩu</Typography>
          </div>
          
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="max-w-md space-y-5">
            <TextField 
              fullWidth type="password" label="Mật khẩu hiện tại" sx={textFieldStyle}
              {...passwordForm.register('currentPassword')}
              error={!!passwordForm.formState.errors.currentPassword}
              helperText={passwordForm.formState.errors.currentPassword?.message}
            />
            <TextField 
              fullWidth type="password" label="Mật khẩu mới" sx={textFieldStyle}
              {...passwordForm.register('newPassword')}
              error={!!passwordForm.formState.errors.newPassword}
              helperText={passwordForm.formState.errors.newPassword?.message}
            />
            <TextField 
              fullWidth type="password" label="Xác nhận mật khẩu mới" sx={textFieldStyle}
              {...passwordForm.register('confirmPassword')}
              error={!!passwordForm.formState.errors.confirmPassword}
              helperText={passwordForm.formState.errors.confirmPassword?.message}
            />
            
            <Button 
              type="submit" variant="outlined" disabled={isUpdating}
              startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ mt: 2, color: THEME_COLOR, borderColor: THEME_COLOR, borderRadius: '10px', px: 4, py: 1.5, fontWeight: 'bold', '&:hover': { borderColor: '#87743b', bgcolor: '#fefce8' } }}
            >
              Cập nhật Mật khẩu
            </Button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};