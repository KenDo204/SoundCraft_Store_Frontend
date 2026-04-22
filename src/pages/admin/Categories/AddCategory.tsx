import React, { useEffect, useState } from 'react';
import {
  TextField, Box, Switch, FormControlLabel, Button, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, KeyboardArrowRight, Save } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategoryTree, createCategory } from '@/store/slices/category.slice';
import { toast } from 'react-toastify';
import ParentCategoryPicker from '@/components/admin/Category/ParentCategoryPicker';
import { hasBadWords } from '@/lib/profanity';

const themeColor = '#9f8a46';
const themeHover = '#7a6b2b'

const AddCategory = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { tree } = useAppSelector((state) => state.categories);

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [parentPathText, setParentPathText] = useState<string>('Không có (Làm danh mục gốc)');
  
  // Đổi isTryOnSupported thành is_active để khớp BE
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (tree.length === 0) {
      dispatch(fetchCategoryTree());
    }
  }, [dispatch, tree.length]);

  const handleConfirmParent = (selectedId: number | null, pathText: string) => {
    setParentId(selectedId);
    setParentPathText(pathText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    if (hasBadWords(name)) {
      toast.error('Tên danh mục chứa từ ngữ không phù hợp');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createCategory({
        name: name.trim(),
        parent_id: parentId,
        is_active: isActive,
      })).unwrap();

      toast.success("Tạo danh mục thành công!");
      dispatch(fetchCategoryTree()); // Refresh tree
      navigate('/admin/categories');
    } catch (error: any) {
      toast.error(error || "Tạo danh mục thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <IconButton onClick={() => navigate('/admin/categories')} className="bg-white shadow-sm border border-gray-100 hover:bg-gray-100">
            <ArrowBack fontSize="small" className="text-gray-600" />
          </IconButton>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Thêm danh mục mới</h1>
            <p className="text-sm text-gray-500 mt-1">Tạo một danh mục để phân loại sản phẩm của bạn</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Box>
              <TextField
                fullWidth
                label="Tên danh mục"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Thời trang Nam, Áo sơ mi, Laptop..."
                required
                sx={{ /* Giữ nguyên styling cũ */
                  backgroundColor: 'white', borderRadius: '0.75rem',
                  '& .MuiOutlinedInput-root': { borderRadius: '0.75rem', '&:hover fieldset': { borderColor: '#00927c' }, '&.Mui-focused fieldset': { borderColor: '#00927c', borderWidth: '2px' } },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#00927c' }
                }}
              />
            </Box>

            <Box>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Danh mục cha</label>
              <div
                onClick={() => setIsPickerOpen(true)}
                className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-[#00927c] transition-colors bg-white"
              >
                <span className={parentId === null ? 'text-gray-800 font-medium' : 'text-[#00927c] font-medium'}>
                  {parentPathText}
                </span>
                <KeyboardArrowRight className="text-gray-400" />
              </div>
            </Box>

            <Box className="ml-1">
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: '#00927c' },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00927c' },
                    }}
                  />
                }
                label={
                  <div>
                    <span className="text-gray-800 font-medium">Trạng thái hoạt động</span>
                    <p className="text-xs text-gray-500 m-0">Hiển thị danh mục này trên giao diện người dùng</p>
                  </div>
                }
              />
            </Box>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="contained"
                onClick={() => navigate('/admin/categories')}
                sx={{ 
                  color: "#FFFFFF", 
                  backgroundColor: '#ef4444', 
                  '&:hover': { bgcolor: '#dc2626' } 
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                sx={{ bgcolor: themeColor, '&:hover': { bgcolor: themeHover } }}
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu danh mục'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ParentCategoryPicker
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        categoryTree={tree}
        onConfirm={handleConfirmParent}
      />
    </div>
  );
};

const IconButton = ({ children, onClick, className }: { children: React.ReactNode, onClick: () => void, className?: string }) => (
  <button type="button" onClick={onClick} className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${className}`}>
    {children}
  </button>
);

export default AddCategory;