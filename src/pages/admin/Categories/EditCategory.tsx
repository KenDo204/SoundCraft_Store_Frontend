import React, { useEffect, useState } from 'react';

import { TextField, Box, Switch, FormControlLabel, Button, CircularProgress } from '@mui/material';
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
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Unused logic removed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || hasBadWords(name)) {
      toast.error('Tên danh mục không hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateCategory({
        id: Number(categoryId),
        payload: {
          name: name.trim(),
          parent_id: parentId,
          is_active: isActive,
        }
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
              <TextField fullWidth label="Tên danh mục" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} required />
            </Box>

            <Box className="opacity-70">
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Danh mục cha (Không thể thay đổi)</label>
              <div className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-xl cursor-not-allowed bg-gray-50">
                <span className={parentId === null ? 'text-gray-800' : 'text-[#00927c]'}>{parentPathText}</span>
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