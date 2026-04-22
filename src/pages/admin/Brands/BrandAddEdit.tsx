import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createBrand, updateBrand, fetchBrandById } from '@/store/slices/brand.slice';
import { 
  Box, TextField, Button, Switch, 
  IconButton, CircularProgress, Typography 
} from '@mui/material';
import { ArrowLeft, Save, UploadCloud, X } from 'lucide-react';
import { toast } from 'react-toastify'; // Giả sử bạn dùng thư viện này để báo lỗi/thành công

const THEME_COLOR = '#9f8a46';

export const BrandAddEdit: React.FC = () => {
  const { brandId } = useParams();
  const isEditMode = Boolean(brandId);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux states
  const { currentBrand, isLoading } = useAppSelector((state) => state.brands);

  // Local Form States
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Image Upload States
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data nếu ở chế độ Edit
  useEffect(() => {
    if (isEditMode && brandId) {
      dispatch(fetchBrandById(brandId));
    }
  }, [brandId, isEditMode, dispatch]);

  // Đổ data vào form khi currentBrand thay đổi
  useEffect(() => {
    if (isEditMode && currentBrand) {
      setName(currentBrand.name || '');
      setCode(currentBrand.brand_code || '');
      setDescription(currentBrand.description || '');
      setIsActive(currentBrand.is_active ?? true);
      setPreviewUrl(currentBrand.brand_image || null);
    }
  }, [currentBrand, isEditMode]);

  // Xử lý chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Tạo link preview ngay lập tức
    }
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(isEditMode ? currentBrand?.brand_image || null : null);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name,
        brand_code: code,
        description,
        is_active: isActive,
        file: file, // Nếu có file thì gửi đi
      };

      if (isEditMode && brandId) {
        await dispatch(updateBrand({ id: Number(brandId), payload })).unwrap();
        toast.success('Cập nhật thương hiệu thành công!');
      } else {
        await dispatch(createBrand(payload)).unwrap();
        toast.success('Thêm thương hiệu mới thành công!');
      }
      navigate('/admin/brands'); // Quay về danh sách
    } catch (error: any) {
      toast.error(error || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Style chung cho Textfield
  const textFieldStyle = {
    backgroundColor: 'white',
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover fieldset': { borderColor: THEME_COLOR },
      '&.Mui-focused fieldset': { borderColor: THEME_COLOR, borderWidth: '2px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: THEME_COLOR },
  };

  if (isEditMode && isLoading && !currentBrand) {
    return <div className="min-h-screen flex items-center justify-center"><CircularProgress sx={{ color: THEME_COLOR }} /></div>;
  }

  return (
    <div className="p-4 lg:p-8 bg-[#fcfbf9] min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <IconButton 
            onClick={() => navigate('/admin/brands')} 
            className="bg-white shadow-sm border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-stone-600" />
          </IconButton>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {isEditMode ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
            </h1>
            <p className="text-sm text-stone-500 mt-1 font-medium">
              Thiết lập thông tin hiển thị cho đối tác thương hiệu của bạn
            </p>
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-8 space-y-6">
                <Typography variant="h6" className="font-bold text-stone-800" sx={{ mb: 2 }}>Thông tin chung</Typography>
                
                <Box>
                  <TextField
                    fullWidth
                    label="Tên thương hiệu"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Yamaha, Fender, Roland..."
                    required
                    sx={textFieldStyle}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Mã thương hiệu (Brand Code)"
                    variant="outlined"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())} // Ép tự động viết hoa
                    placeholder="VD: YAMAHA_01"
                    required
                    helperText="Mã chỉ chứa chữ hoa, số và dấu gạch dưới (_)"
                    inputProps={{ maxLength: 50, pattern: "^[A-Z0-9_]+$" }}
                    sx={textFieldStyle}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Mô tả thương hiệu"
                    variant="outlined"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Giới thiệu ngắn gọn về lịch sử hoặc điểm nổi bật của thương hiệu này..."
                    multiline
                    rows={4}
                    sx={textFieldStyle}
                  />
                </Box>
              </div>
            </div>

            {/* CỘT PHẢI: ẢNH LOGO & TRẠNG THÁI */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Box Upload Hình Ảnh */}
              <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-8">
                <Typography variant="h6" className="font-bold text-stone-800 mb-4">Logo / Hình ảnh</Typography>
                
                <div className="relative mt-2">
                  {/* Nút xóa ảnh (chỉ hiện khi đang chọn file mới) */}
                  {file && (
                    <IconButton 
                      onClick={handleRemoveImage}
                      size="small"
                      sx={{
                      position: 'absolute',
                      top: -12,
                      right: -12,
                      zIndex: 20, // Đảm bảo luôn nằm trên cùng
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
                  {/* Khu vực Preview Ảnh */}
                  <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-stone-300 flex items-center justify-center bg-stone-50 overflow-hidden relative group transition-colors hover:border-[#9f8a46] hover:bg-orange-50/30">
                    
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-bold text-sm">Nhấn để đổi ảnh</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-stone-400">
                        <UploadCloud size={40} className="mb-2 opacity-50" />
                        <span className="text-sm font-medium">Tải ảnh lên (JPG, PNG)</span>
                      </div>
                    )}

                    {/* Input ẩn dán đè lên toàn bộ khu vực */}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  
                </div>
              </div>

              {/* Box Trạng thái */}
              <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-8">
                <Typography variant="h6" className="font-bold text-stone-800 mb-4">Trạng thái</Typography>
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-stone-800 font-bold block">Đang hoạt động</span>
                    <span className="text-xs text-stone-500 font-medium">Hiển thị trên trang khách hàng</span>
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

            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-stone-200">
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/brands')}
              sx={{ 
                color: '#64748b', 
                borderColor: '#cbd5e1', 
                borderRadius: '12px',
                px: 4, py: 1.5,
                fontWeight: 'bold',
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
                boxShadow: 'none',
                '&:hover': { bgcolor: '#87743b', boxShadow: '0 4px 12px rgba(159,138,70,0.3)' } 
              }}
            >
              {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật thương hiệu' : 'Lưu thương hiệu')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};