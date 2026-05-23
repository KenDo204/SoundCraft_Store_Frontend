import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createAdminUser,
  updateAdminUser,
  fetchAdminUserById,
  clearCurrentUser
} from '@/store/slices/customer.slice';
import {
  Box,
  TextField,
  Button,
  Switch,
  IconButton,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { ArrowLeft, Save, UploadCloud, X } from 'lucide-react';
import { toast } from 'react-toastify';
import type { UserRole, Gender } from '@/types/user.type';

const THEME_COLOR = '#9f8a46';

const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_SUPER_ADMIN: 'Super Admin',
  ROLE_ADMIN: 'Admin',
  ROLE_OWNER: 'Owner',
  ROLE_MANAGER: 'Manager',
  ROLE_STAFF: 'Staff',
  ROLE_CUSTOMER: 'Khách hàng',
};

const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

export const CustomerAddEdit: React.FC = () => {
  const { userId } = useParams();
  const isEditMode = Boolean(userId);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Selectors
  const { currentUser: apiUser, isLoading, isSubmitting } = useAppSelector((state) => state.customers);
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const loggedInUserRole = loggedInUser?.role || 'ROLE_CUSTOMER';

  // Form Local States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<UserRole>('ROLE_CUSTOMER');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [isActive, setIsActive] = useState(true);

  // Avatar Upload States
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load User Data if in Edit Mode
  useEffect(() => {
    if (isEditMode && userId) {
      dispatch(fetchAdminUserById(Number(userId)));
    }
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [userId, isEditMode, dispatch]);

  // Bind Data to Form Fields
  useEffect(() => {
    if (isEditMode && apiUser) {
      setFullName(apiUser.full_name || '');
      setEmail(apiUser.email || '');
      setMobile(apiUser.mobile || '');
      setRole(apiUser.role || 'ROLE_CUSTOMER');
      setDob(apiUser.dob ? apiUser.dob.substring(0, 10) : '');
      setGender(apiUser.gender || 'MALE');
      setIsActive(apiUser.is_active ?? true);
      setPreviewUrl(apiUser.avatar || null);
    }
  }, [apiUser, isEditMode]);

  // Filter Roles Based on Hierarchy
  const allowedRoles = React.useMemo(() => {
    if (loggedInUserRole === 'ROLE_SUPER_ADMIN') {
      return ['ROLE_CUSTOMER', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_OWNER'] as UserRole[];
    }
    if (loggedInUserRole === 'ROLE_ADMIN' || loggedInUserRole === 'ROLE_OWNER') {
      return ['ROLE_CUSTOMER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_OWNER'] as UserRole[];
    }
    if (loggedInUserRole === 'ROLE_MANAGER') {
      return ['ROLE_STAFF'] as UserRole[];
    }
    return ['ROLE_CUSTOMER'] as UserRole[];
  }, [loggedInUserRole]);

  // Auto-select valid role if currently selected role is not allowed
  useEffect(() => {
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      setRole(allowedRoles[0]);
    }
  }, [allowedRoles, role]);

  // Validate Age (>= 18)
  const validateAge = (dateString: string): boolean => {
    if (!dateString) return true; // Optional field
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  // Handle Photo Picker
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Remove Selected Image
  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(isEditMode ? apiUser?.avatar || null : null);
  };

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validations
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      toast.error('Họ và tên phải từ 2 đến 100 ký tự');
      return;
    }

    if (!isEditMode && !password) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }

    if (password && password.length < 6) {
      toast.error('Mật khẩu phải tối thiểu 6 ký tự');
      return;
    }

    if (mobile && !/^(0|84)(3|5|7|8|9)[0-9]{8}$/.test(mobile)) {
      toast.error('Số điện thoại không đúng định dạng Việt Nam');
      return;
    }

    if (dob && !validateAge(dob)) {
      toast.error('Người dùng phải từ 18 tuổi trở lên');
      return;
    }

    try {
      const payload: any = {
        full_name: fullName.trim(),
        email: email.trim(),
        mobile: mobile.trim() || undefined,
        role,
        dob: dob || undefined,
        gender,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      if (isEditMode) {
        payload.is_active = isActive;
        if (file) {
          payload.file = file;
        }
        await dispatch(updateAdminUser({ id: Number(userId), payload })).unwrap();
        toast.success('Cập nhật tài khoản thành công!');
      } else {
        await dispatch(createAdminUser(payload)).unwrap();
        toast.success('Tạo tài khoản thành công!');
      }

      navigate('/admin/customers');
    } catch (err: any) {
      toast.error(err || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại!');
    }
  };

  // Common Custom Styling for Form Fields
  const formFieldStyle = {
    backgroundColor: 'white',
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover fieldset': { borderColor: THEME_COLOR },
      '&.Mui-focused fieldset': { borderColor: THEME_COLOR, borderWidth: '2px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: THEME_COLOR },
  };

  if (isEditMode && isLoading && !apiUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf9]">
        <CircularProgress sx={{ color: THEME_COLOR }} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-[#fcfbf9] min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <IconButton
            onClick={() => navigate('/admin/customers')}
            className="bg-white shadow-sm border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-stone-600" />
          </IconButton>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {isEditMode ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
            </h1>
            <p className="text-sm text-stone-500 mt-1 font-medium">
              Thiết lập thông tin cá nhân, định danh và vai trò quản trị trong hệ thống
            </p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN: BASIC INFORMATION */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-8 space-y-6">
                <Typography variant="h6" className="font-bold text-stone-800">Thông tin chung</Typography>

                {/* Full name */}
                <Box>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    variant="outlined"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập đầy đủ họ tên..."
                    required
                    sx={formFieldStyle}
                  />
                </Box>

                {/* Email */}
                <Box>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    disabled={isEditMode}
                    sx={formFieldStyle}
                  />
                  {isEditMode && (
                    <FormHelperText sx={{ ml: 1 }}>Không thể chỉnh sửa Email của tài khoản sau khi tạo</FormHelperText>
                  )}
                </Box>

                {/* Password */}
                <Box>
                  <TextField
                    fullWidth
                    type="password"
                    label={isEditMode ? "Mật khẩu mới (Bỏ trống nếu giữ nguyên)" : "Mật khẩu"}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    required={!isEditMode}
                    sx={formFieldStyle}
                  />
                </Box>

                {/* Mobile & Date of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Box>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      variant="outlined"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="VD: 0987654321"
                      sx={formFieldStyle}
                    />
                  </Box>

                  <Box>
                    <TextField
                      fullWidth
                      type="date"
                      label="Ngày sinh"
                      variant="outlined"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={formFieldStyle}
                    />
                  </Box>
                </div>

                {/* Gender */}
                <Box>
                  <FormControl fullWidth sx={formFieldStyle}>
                    <InputLabel id="gender-label">Giới tính</InputLabel>
                    <Select
                      labelId="gender-label"
                      value={gender}
                      label="Giới tính"
                      onChange={(e) => setGender(e.target.value as Gender)}
                      sx={{ borderRadius: '12px' }}
                    >
                      {Object.entries(GENDER_LABELS).map(([value, label]) => (
                        <MenuItem key={value} value={value}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </div>
            </div>

            {/* RIGHT COLUMN: ROLE & STATUS & AVATAR */}
            <div className="lg:col-span-1 space-y-6">

              {/* Photo Upload Area */}
              <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-8">
                <Typography variant="h6" className="font-bold text-stone-800 mb-4">Ảnh đại diện</Typography>

                <div className="relative mt-2">
                  {/* Remove Button */}
                  {file && (
                    <IconButton
                      onClick={handleRemoveImage}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: -12,
                        zIndex: 20,
                        backgroundColor: '#ef4444',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          backgroundColor: '#dc2626',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <X size={16} />
                    </IconButton>
                  )}
                  {/* Dropzone Container */}
                  <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-stone-300 flex items-center justify-center bg-stone-50 overflow-hidden relative group transition-all hover:border-[#9f8a46] hover:bg-orange-50/30">

                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-bold text-sm">Nhấn để đổi ảnh</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-stone-400">
                        <UploadCloud size={40} className="mb-2 opacity-50" />
                        <span className="text-sm font-medium">Tải ảnh đại diện</span>
                      </div>
                    )}

                    {/* Hidden input overlay */}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Role Dropdown */}
              <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-8 space-y-4">
                <Typography variant="h6" className="font-bold text-stone-800">Phân quyền</Typography>
                <FormControl fullWidth sx={formFieldStyle} >
                  <InputLabel id="role-label">Vai trò</InputLabel>
                  <Select
                    labelId="role-label"
                    value={role}
                    label="Vai trò"
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    sx={{ borderRadius: '12px' }}
                  >
                    {allowedRoles.map((roleKey) => (
                      <MenuItem key={roleKey} value={roleKey}>
                        {ROLE_LABELS[roleKey]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Status Switch (Only visible in edit mode) */}
              {isEditMode && (
                <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-8">
                  <Typography variant="h6" className="font-bold text-stone-800 mb-4">Trạng thái</Typography>
                  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-stone-800 font-bold block">Kích hoạt</span>
                      <span className="text-xs text-stone-500 font-medium">Cho phép đăng nhập hệ thống</span>
                    </div>
                    <Switch
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: THEME_COLOR },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: THEME_COLOR },
                      }}
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-stone-200">
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/customers')}
              sx={{
                color: '#64748b',
                borderColor: '#cbd5e1',
                borderRadius: '12px',
                px: 4, py: 1.5,
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
              sx={{
                bgcolor: THEME_COLOR,
                color: 'white',
                borderRadius: '12px',
                px: 4, py: 1.5,
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#87743b', boxShadow: '0 4px 12px rgba(159,138,70,0.3)' }
              }}
            >
              {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật tài khoản' : 'Tạo tài khoản')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerAddEdit;
