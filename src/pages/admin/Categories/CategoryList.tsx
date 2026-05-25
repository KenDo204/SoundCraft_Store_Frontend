import React, { useState, useEffect, useMemo } from 'react';
import { 
  IconButton, CircularProgress, Tooltip, Collapse,
  Dialog, DialogTitle, Switch,
  DialogContent, DialogActions, Button, Typography, TextField, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, FolderOpen, Folder, KeyboardArrowRight, 
  KeyboardArrowDown, Segment, WarningAmber, Search 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminCategories, deleteCategory, toggleCategoryStatus } from '@/store/slices/category.slice';
import type { CategoryAdmin } from '@/types/category.type';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

const CategoryList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { adminList, isLoading } = useAppSelector((state) => state.categories);
  console.log("Dữ liệu từ Redux:", adminList);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [keyword, setKeyword] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminCategories({ keyword: keyword || undefined }));
  }, [dispatch, keyword]);

  const handleSearchChange = useMemo(
    () => debounce((value: string) => setKeyword(value), 500),
    []
  );

  const handleToggleExpand = (categoryId: number) => {
    setExpandedIds((prev) => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const listToTree = (list: CategoryAdmin[]): CategoryAdmin[] => {
  const map: { [key: string]: number } = {};
  const tree: CategoryAdmin[] = [];
  
  if (!Array.isArray(list)) return [];

  // Tạo một bản sao sâu để không làm hỏng dữ liệu gốc trong Redux
  const roots: CategoryAdmin[] = list.map((item, index) => {
    map[item.category_id.toString()] = index;
    return { ...item, children: [] };
  });

  roots.forEach((item) => {
    if (item.parent_id !== null && item.parent_id !== undefined && item.parent_id !== 0) {
      const parentIndex = map[item.parent_id.toString()];
      if (parentIndex !== undefined) {
        roots[parentIndex].children?.push(item);
      } else {
        // Trường hợp không tìm thấy cha (cha bị xóa hoặc lỗi data), đưa ra ngoài gốc
        tree.push(item);
      }
    } else {
      // Danh mục gốc
      tree.push(item);
    }
  });

  return tree;
};

const sortedCategoryTree = useMemo(() => {
  // Bước 1: Chuyển list phẳng thành cây
  const treeData = listToTree(adminList);
  
  // Bước 2: Sắp xếp các nhánh cây theo ID (cần ép kiểu sang number để trừ)
  const sortTree = (nodes: CategoryAdmin[]): CategoryAdmin[] => {
    return [...nodes]
      .sort((a, b) => Number(a.category_id) - Number(b.category_id))
      .map(node => ({
        ...node,
        children: node.children ? sortTree(node.children as CategoryAdmin[]) : []
      }));
  };
  
  return sortTree(treeData);
}, [adminList]);

  const CategoryRow = ({ category, index }: { category: CategoryAdmin, index?: number }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.includes(Number(category.category_id));
    const [isUpdating, setIsUpdating] = useState(false);

    // Sử dụng API PATCH toggle tối ưu từ BE
    const handleToggleActive = async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      setIsUpdating(true);
      try {
        await dispatch(toggleCategoryStatus(category.category_id)).unwrap();
        toast.success(`Đã ${!category.is_active ? 'bật' : 'tắt'} danh mục`);
        dispatch(fetchAdminCategories({ keyword: keyword || undefined }));
      } catch (error: any) {
        toast.error(error || "Thao tác thất bại");
      } finally {
        setIsUpdating(false);
      }
    };

    const levelDisplay = category.level || 1; // BE trả về level (1, 2, 3...)

    return (
      <React.Fragment>
        <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
          <td className="px-6 py-4 font-medium text-gray-500 w-24 text-center">
            {levelDisplay === 1 && index !== undefined ? index + 1 : ""}
          </td>

          <td className="px-6 py-4">
            <div 
              className="flex items-center"
              style={{ paddingLeft: `${(levelDisplay - 1) * 2}rem` }}
            >
              <div className="w-8 flex justify-center">
                {hasChildren ? (
                  <IconButton 
                    size="small" 
                    onClick={() => handleToggleExpand(Number(category.category_id))}
                    sx={{ p: 0.5 }}
                  >
                    {isExpanded ? <KeyboardArrowDown fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}
                  </IconButton>
                ) : (
                  <span className="w-8"></span> 
                )}
              </div>

              {levelDisplay === 1 ? (
                <FolderOpen className="text-blue-500 mr-2" fontSize="small" />
              ) : levelDisplay === 2 ? (
                <Folder className="text-emerald-500 mr-2" fontSize="small" />
              ) : (
                <Segment className="text-amber-500 mr-2" fontSize="small" />
              )}
              
              <span className={`${levelDisplay === 1 ? 'font-semibold text-gray-800' : 'text-gray-600'} cursor-pointer`}
                    onClick={() => hasChildren && handleToggleExpand(Number(category.category_id))}>
                {category.name}
              </span>
            </div>
          </td>
          <td className="px-6 py-4 text-center w-32">
            {category.level === 1 && (
              <img src={category.image_url} alt={category.name} className="w-12 h-12 object-cover rounded mx-auto" />
            )}
          </td>

          <td className="px-6 py-4 text-center w-32">
            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border
              ${levelDisplay === 1 ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                levelDisplay === 2 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                'bg-amber-50 text-amber-700 border-amber-100'}`}
            >
              Cấp {levelDisplay}
            </span>
          </td>

          <td className="px-6 py-4 text-center w-40">
            <div className="flex items-center justify-center gap-2">
              <Switch 
                checked={category.is_active ?? true} 
                onChange={handleToggleActive}
                disabled={isUpdating}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#00927c' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00927c' },
                }}
              />
              {isUpdating && <CircularProgress size={14} sx={{ color: '#00927c' }} />}
            </div>
          </td>

          <td className="px-6 py-4 text-center w-32">
            <div className="flex items-center justify-center gap-1">
              <Tooltip title="Chỉnh sửa" arrow>
                <IconButton 
                  onClick={() => navigate(`/admin/categories/edit/${category.category_id}`)}
                  size="small"
                  sx={{ color: '#00927c', bgcolor: '#f0fdfa', '&:hover': { bgcolor: '#ccfbf1' } }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xóa" arrow>
                <IconButton 
                  onClick={() => handleDeleteClick(Number(category.category_id))}
                  size="small"
                  sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </td>
        </tr>

        {hasChildren && (
          <tr>
            <td colSpan={6} className="p-0 border-0">
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {category.children!.map((child: any) => (
                      <CategoryRow key={child.category_id} category={child} />
                    ))}
                  </tbody>
                </table>
              </Collapse>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      await dispatch(deleteCategory(itemToDelete)).unwrap();
      toast.success("Xóa danh mục thành công");
      dispatch(fetchAdminCategories({ keyword: keyword || undefined }));
    } catch (error: any) {
      toast.error(error || "Không thể gỡ danh mục lúc này!");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
            <p className="text-sm text-gray-500 mt-1">Xem, thêm, sửa, xóa cấu trúc danh mục sản phẩm của hệ thống</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <TextField
              placeholder="Tìm tên danh mục..."
              size="small"
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><Search sx={{ fontSize: 20 }} /></InputAdornment>),
                sx: { bgcolor: 'white', borderRadius: '8px' }
              }}
              sx={{ width: { sm: 300 } }}
            />
            <Button
              onClick={() => navigate('/admin/categories/add')}
              variant="contained"
              startIcon={<Add />}
              sx={{ bgcolor: '#9f8a46', '&:hover': { bgcolor: '#7a6b2b' }, borderRadius: '8px', px: 3 }}
            >
              Thêm mới
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold w-24 text-center">STT</th>
                  <th className="px-6 py-4 font-semibold">Tên Danh Mục</th>
                  <th className="px-6 py-4 font-semibold text-center">Hình Ảnh</th>
                  <th className="px-6 py-4 font-semibold w-32 text-center">Cấp Độ</th>
                  <th className="px-6 py-4 font-semibold w-40 text-center">Hoạt Động</th>
                  <th className="px-6 py-4 font-semibold w-32 text-center">Thao Tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <CircularProgress size={32} sx={{ color: '#9f8a46' }} />
                      <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : sortedCategoryTree.length > 0 ? (
                  sortedCategoryTree.map((cat, index) => (
                    <CategoryRow key={cat.category_id} category={cat} index={index} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <img src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" alt="Empty" className="w-20 h-20 opacity-50 mb-4" />
                        <p className="text-gray-500 font-medium">Chưa có danh mục nào</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* POPUP XÁC NHẬN XÓA (Giữ nguyên như cũ) */}
      <Dialog open={deleteModalOpen} onClose={() => !isDeleting && setDeleteModalOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle className="flex items-center gap-2"><WarningAmber className="text-red-500" /> Xác nhận xóa</DialogTitle>
        <DialogContent><Typography>Hành động này không thể hoàn tác. Danh mục con (nếu có) cũng sẽ bị ảnh hưởng.</Typography></DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteModalOpen(false)} disabled={isDeleting} sx={{ color: 'stone.500' }}>Hủy</Button>
          <Button onClick={executeDelete} disabled={isDeleting} variant="contained" sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : "Xác nhận xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CategoryList;