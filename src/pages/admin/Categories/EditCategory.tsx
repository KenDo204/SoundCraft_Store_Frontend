import React, { useEffect, useState } from 'react';

import { TextField, Box, Switch, FormControlLabel, Button, CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAdminCategories,
  fetchCategoryById,
  updateCategory,
  clearSelectedCategory
} from '@/store/slices/category.slice';
import { toast } from 'react-toastify';
import { hasBadWords } from '@/lib/profanity';

const themeColor = '#9f8a46';
const themeHover = '#7a6b2b'

const EditCategory = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { categoryId } = useParams<{ categoryId: string }>();

  const { tree, selectedCategory, isLoading: isReduxLoading } = useAppSelector((state) => state.categories);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [parentPathText, setParentPathText] = useState<string>('Đang tải...');
  const [keyword] = useState(''); // Keep keyword if needed for refresh, though currently unused as search
  const [file, setFile] = useState<File | null>(null);
  // Holds the original image URL from the DB (used for deletion on backend)
  const [oldImageUrl, setOldImageUrl] = useState<string>('');
  // URL used for preview (either old image or newly selected file)
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState<boolean>(false);

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Show preview of the newly selected file
      const preview = URL.createObjectURL(selectedFile);
      setPreviewUrl(preview);
    }
  };

  // 1. Khởi tạo dữ liệu (Cây danh mục)
  useEffect(() => {
    if (tree.length === 0) {
      dispatch(fetchAdminCategories({ keyword: keyword || undefined }));
    }
  }, [dispatch, tree.length, keyword]);

  // 2. Lấy chi tiết danh mục qua Thunk
  useEffect(() => {
    if (categoryId) {
      dispatch(fetchCategoryById(categoryId));
    }
    // Cleanup khi rời trang
    return () => {
      dispatch(clearSelectedCategory());
    };
  }, [dispatch, categoryId]);

  // 3. Đồng bộ dữ liệu từ Redux vào Form state
  useEffect(() => {
    if (selectedCategory) {
      setName(selectedCategory.name);
      setParentId(selectedCategory.parent_id);
      setIsActive(selectedCategory.is_active);
      setOldImageUrl(selectedCategory.image_url ?? '');
      setPreviewUrl(selectedCategory.image_url ?? '');

      // Xử lý text đường dẫn cha
      if (selectedCategory.parent_id && tree.length > 0) {
        const pathString = findParentPath(tree, selectedCategory.parent_id.toString());
        setParentPathText(pathString || 'Không xác định');
      } else {
        setParentPathText('Không có (Làm danh mục gốc)');
      }
    }
  }, [selectedCategory, tree]);

  const findParentPath = (nodes: any[], targetId: string, currentPath = ""): string | null => {
    for (const node of nodes) {
      if (node.category_id.toString() === targetId) {
        return currentPath ? `${currentPath} > ${node.name}` : node.name;
      }
      if (node.children && node.children.length > 0) {
        const foundChild = findParentPath(node.children, targetId, currentPath ? `${currentPath} > ${node.name}` : node.name);
        if (foundChild) return foundChild;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || hasBadWords(name)) {
      toast.error('Tên danh mục không hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('is_active', String(isActive));
      if (parentId !== null) formData.append('parent_id', String(parentId));
      // Append image file if provided; otherwise send existing image URL
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('image_url', oldImageUrl);
      }

      await dispatch(updateCategory({
        id: Number(categoryId),
        payload: formData as any,
      })).unwrap();

      toast.success("Cập nhật danh mục thành công");
      dispatch(fetchAdminCategories({ keyword: keyword || undefined }));
      navigate('/admin/categories');
    } catch (error: any) {
      toast.error(error || "Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isReduxLoading && !selectedCategory) return <div className="flex justify-center mt-20"><CircularProgress /></div>;

  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header tương tự AddCategory */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Box>
              <TextField
                fullWidth
                label="Tên danh mục"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Box>
            {/* Image upload only for root categories (no parent) */}
            {parentId === null && (
              <Box className="mt-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                {/* Show current or newly selected image preview */}
                {previewUrl && (
                  <img src={previewUrl} alt="Category" className="w-24 h-24 object-cover rounded mb-2" />
                )}
                <div className="relative w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#00927c] transition-colors bg-gray-50 overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <span className="text-sm font-medium text-[#00927c] px-4 text-center truncate w-full">{file.name}</span>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <CloudUpload className="text-gray-400" />
                      <span className="text-sm text-gray-500">Nhấn để chọn ảnh</span>
                    </div>
                  )}
                </div>
              </Box>
            )}
            <Box className="opacity-70">
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Danh mục cha (Không thể thay đổi)</label>
              <div className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-xl cursor-not-allowed bg-gray-50">
                <span className={parentId === null ? 'text-gray-800' : 'text-[#7a6b2b]'}>{parentPathText}</span>
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
                label={<div><span className="font-medium">Trạng thái hoạt động</span></div>}
              />
            </Box>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
              <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ bgcolor: themeColor, '&:hover': { bgcolor: themeHover } }}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCategory;