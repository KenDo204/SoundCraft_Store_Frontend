import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createSlider, updateSlider, fetchSliderById } from '@/store/slices/slider.slice';
import { fetchAllBrands } from '@/store/slices/brand.slice'; // Để lấy data dropdown
import { 
  Box, TextField, Button, Switch, IconButton, 
  CircularProgress, Typography, MenuItem 
} from '@mui/material';
import { ArrowLeft, Save, UploadCloud, X } from 'lucide-react';
import { toast } from 'react-toastify';

const THEME_COLOR = '#9f8a46';

export const SliderAddEdit: React.FC = () => {
  const { sliderId } = useParams();
  const isEditMode = Boolean(sliderId);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux states
  const { currentSlider, isLoading: isSliderLoading } = useAppSelector((state) => state.sliders);
  const { list: brands, isLoading: isBrandsLoading } = useAppSelector((state) => state.brands); // Lấy danh sách Brand

  // Local Form States
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  
  // Image Upload States
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Data
  useEffect(() => {
    if (brands.length === 0) {
      dispatch(fetchAllBrands()); // Load brands cho Dropdown
    }
    if (isEditMode && sliderId) {
      dispatch(fetchSliderById(sliderId));
    }
  }, [sliderId, isEditMode, dispatch, brands.length]);

  // Đổ data vào form
  useEffect(() => {
    if (isEditMode && currentSlider) {
      setTitle(currentSlider.title || '');
      setSubTitle(currentSlider.sub_title || '');
      setTargetUrl(currentSlider.target_url || '');
      const beBrandId = currentSlider.brand?.brand_id;
      setBrandId(beBrandId ? Number(beBrandId) : '');
      setIsActive(currentSlider.is_active ?? true);
      setPreviewUrl(currentSlider.image_url || null);
    }
  }, [currentSlider, isEditMode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(isEditMode ? currentSlider?.image_url || null : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !previewUrl) {
      toast.error('Vui lòng chọn ảnh cho Banner!');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        sub_title: subTitle,
        target_url: targetUrl,
        brand_id: brandId === '' ? undefined : brandId,
        is_active: isActive,
        file: file,
      };

      if (isEditMode && sliderId) {
        await dispatch(updateSlider({ id: sliderId, payload })).unwrap();
        toast.success('Cập nhật Banner thành công!');
      } else {
        await dispatch(createSlider(payload)).unwrap();
        toast.success('Tạo Banner mới thành công!');
      }
      navigate('/admin/banners');
    } catch (error: any) {
      toast.error(error || 'Có lỗi xảy ra!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const textFieldStyle = {
    backgroundColor: 'white',
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      '&:hover fieldset': { borderColor: THEME_COLOR },
      '&.Mui-focused fieldset': { borderColor: THEME_COLOR, borderWidth: '2px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: THEME_COLOR },
  };

  if (isEditMode && isSliderLoading && !currentSlider) {
    return <div className="min-h-screen flex items-center justify-center"><CircularProgress sx={{ color: THEME_COLOR }} /></div>;
  }

  return (
    <div className="p-4 lg:p-8 bg-[#fcfbf9] min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <IconButton 
            onClick={() => navigate('/admin/banners')} 
            className="bg-white shadow-sm border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft size={20} className="text-stone-600" />
          </IconButton>
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
              {isEditMode ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
            </h1>
            <p className="text-sm text-stone-500 mt-1 font-medium">
              Hình ảnh sẽ hiển thị trên Slider trang chủ
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* KHU VỰC 1: UPLOAD ẢNH BANNER (CHIẾM FULL CHIỀU RỘNG VÌ LÀ BANNER) */}
          <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-8 mb-8">
            <Typography variant="h6" className="font-bold text-stone-800 mb-4">Hình ảnh Banner <span className="text-red-500">*</span></Typography>
            
            <div className="relative">
              {/* Tỉ lệ aspect-[21/9] mô phỏng banner ngang chuẩn */}
              <div className="w-full aspect-[21/9] rounded-2xl border-2 border-dashed border-stone-300 flex items-center justify-center bg-stone-50 overflow-hidden relative group transition-colors hover:border-[#9f8a46] hover:bg-orange-50/30">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <UploadCloud size={32} className="mb-2" />
                      <span className="font-bold text-sm">Nhấn để đổi ảnh khác</span>
                      <span className="text-xs text-white/70 mt-1">Khuyên dùng ảnh 1920x800px</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-stone-400">
                    <UploadCloud size={48} className="mb-3 opacity-50" />
                    <span className="text-base font-bold text-stone-600">Tải ảnh Banner lên</span>
                    <span className="text-sm mt-1">Định dạng JPG, PNG (Khuyên dùng 1920x800px)</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {file && (
                <IconButton 
                  onClick={handleRemoveImage} size="small"
                  className="absolute -top-3 -right-3 bg-red-500 text-white hover:bg-red-600 shadow-md"
                >
                  <X size={16} />
                </IconButton>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CỘT TRÁI: THÔNG TIN TEXT */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-8 space-y-6">
                <Typography variant="h6" className="font-bold text-stone-800" sx={{ mb: 2 }}>Nội dung hiển thị</Typography>
                
                <Box>
                  <TextField
                    fullWidth
                    label="Tiêu đề chính (Title)"
                    variant="outlined"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: KHUYẾN MÃI MÙA HÈ"
                    sx={textFieldStyle}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Tiêu đề phụ (Sub-title)"
                    variant="outlined"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="VD: Giảm giá lên đến 50% cho tất cả Guitar"
                    sx={textFieldStyle}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Đường dẫn đích (Target URL)"
                    variant="outlined"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="VD: /category/guitar-acoustic"
                    helperText="Link chuyển đến khi khách hàng click vào Banner"
                    sx={textFieldStyle}
                  />
                </Box>
              </div>
            </div>

            {/* CỘT PHẢI: BRAND & STATUS */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-8">
                <Typography variant="h6" className="font-bold text-stone-800" sx={{ mb: 2 }}>Liên kết Thương hiệu</Typography>
                <TextField
                  select
                  fullWidth
                  label="Chọn thương hiệu (Tùy chọn)"
                  value={brandId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBrandId(value === '' ? '' : Number(value)); 
                  }}
                  sx={textFieldStyle}
                  disabled={isBrandsLoading}
                >
                  <MenuItem value=""><em>Không gắn thương hiệu</em></MenuItem>
                  {brands.map((brand) => (
                    <MenuItem key={brand.brand_id} value={brand.brand_id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 p-8">
                <Typography variant="h6" className="font-bold text-stone-800 mb-4">Trạng thái</Typography>
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-stone-800 font-bold block">Hiển thị Banner</span>
                    <span className="text-xs text-stone-500 font-medium">Bật/Tắt trên trang chủ</span>
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
              onClick={() => navigate('/admin/banners')}
              sx={{ color: '#64748b', borderColor: '#cbd5e1', borderRadius: '12px', px: 4, py: 1.5, fontWeight: 'bold' }}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
              sx={{ 
                bgcolor: THEME_COLOR, color: 'white', borderRadius: '12px', px: 4, py: 1.5, fontWeight: 'bold',
                boxShadow: 'none', '&:hover': { bgcolor: '#87743b' } 
              }}
            >
              {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật Banner' : 'Lưu Banner')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};