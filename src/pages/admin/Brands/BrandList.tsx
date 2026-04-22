import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks'; // Đảm bảo đúng path
import { fetchAllBrands, deleteBrand, updateBrand } from '@/store/slices/brand.slice';
import { TextField, InputAdornment, Button, CircularProgress, Switch, IconButton, Tooltip } from '@mui/material';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import type { BrandResponse } from '@/types/brand.type';
import { toast } from 'react-toastify';

export const BrandList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { list, isLoading } = useAppSelector((state) => state.brands);
  
  const [searchQuery, setSearchQuery] = useState('');

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    dispatch(fetchAllBrands());
  }, [dispatch]);

  // Logic lọc tìm kiếm
  const filteredBrands = useMemo(() => {
    if (!searchQuery) return list;
    return list.filter(brand => 
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.brand_code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [list, searchQuery]);

  // Xử lý đổi trạng thái trực tiếp trên bảng
  const handleToggleStatus = async (brand: BrandResponse) => {
    // Gọi API update trạng thái (giả định payload chỉ cần is_active)
    await dispatch(updateBrand({ 
      id: brand.brand_id, 
      payload: { is_active: !brand.is_active } // Thay đổi tùy theo payload BE yêu cầu
    }));
    toast.success('Cập nhật trạng thái Thương hiệu thành công!');
  };

  // Xử lý xóa
  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thương hiệu "${name}" không?`)) {
      dispatch(deleteBrand(id));
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-[#fcfbf9] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Quản lý Thương hiệu</h1>
            <p className="text-sm text-stone-500 mt-1 font-medium">Xem, thêm, sửa, xóa danh sách thương hiệu sản phẩm</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <TextField
              placeholder="Tìm tên hoặc mã..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} className="text-stone-400" />
                  </InputAdornment>
                ),
                sx: { bgcolor: 'white', borderRadius: '12px', '& fieldset': { borderColor: '#e5e7eb' } }
              }}
              sx={{ width: { sm: 300 } }}
            />
            <Button
              onClick={() => navigate('/admin/brands/add')}
              variant="contained"
              startIcon={<Plus size={18} />}
              sx={{ 
                bgcolor: '#9f8a46', 
                '&:hover': { bgcolor: '#87743b' }, 
                borderRadius: '12px', 
                px: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                boxShadow: 'none'
              }}
            >
              Thêm mới
            </Button>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-200 text-stone-500 text-[11px] uppercase tracking-widest font-black">
                  <th className="px-6 py-5 w-20 text-center">STT</th>
                  <th className="px-6 py-5">Thương Hiệu</th>
                  <th className="px-6 py-5 w-48">Mô Tả / Slug</th>
                  <th className="px-6 py-5 w-32 text-center">Trạng Thái</th>
                  <th className="px-6 py-5 w-32 text-center">Thao Tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <CircularProgress size={32} sx={{ color: '#9f8a46' }} />
                      <p className="mt-3 text-stone-400 font-medium text-xs uppercase tracking-widest">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-stone-400">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={32} className="opacity-20 mb-2" />
                        <span className="font-medium">Không tìm thấy thương hiệu nào</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand, index) => (
                    <tr key={brand.brand_id} className="hover:bg-stone-50/50 transition-colors group">
                      {/* CỘT 1: STT */}
                      <td className="px-6 py-4 font-semibold text-stone-400 text-center">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>

                      {/* CỘT 2: THƯƠNG HIỆU (Gộp Image + Name + Code) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {/* Khung Ảnh */}
                          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                            {brand.brand_image ? (
                              <img src={brand.brand_image} alt={brand.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={20} className="text-stone-300" />
                            )}
                          </div>
                          {/* Tên & Mã */}
                          <div className="flex flex-col">
                            <span className="font-bold text-stone-900 text-[15px]">{brand.name}</span>
                            <span className="text-[11px] font-black tracking-widest text-orange-700 uppercase mt-0.5">
                              {brand.brand_code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CỘT 3: SLUG & MÔ TẢ */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-stone-400 mb-1">/{brand.slug}</span>
                          <span className="text-xs text-stone-600 line-clamp-1" title={brand.description}>
                            {brand.description || "Chưa có mô tả"}
                          </span>
                        </div>
                      </td>

                      {/* CỘT 4: TRẠNG THÁI */}
                      <td className="px-6 py-4 text-center">
                        <Tooltip title={brand.is_active ? 'Đang hoạt động' : 'Đã ẩn'}>
                          <Switch 
                            checked={brand.is_active}
                            onChange={() => handleToggleStatus(brand)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#00927c' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00927c' },
                            }}
                          />
                        </Tooltip>
                      </td>

                      {/* CỘT 5: THAO TÁC */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip title="Chỉnh sửa">
                            <IconButton 
                              size="small" 
                              onClick={() => navigate(`/admin/brands/edit/${brand.brand_id}`)}
                              sx={{ color: '#64748b', bgcolor: '#f8fafc', '&:hover': { color: '#0ea5e9', bgcolor: '#e0f2fe' } }}
                            >
                              <Edit2 size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(brand.brand_id, brand.name)}
                              sx={{ color: '#64748b', bgcolor: '#f8fafc', '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' } }}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer tổng kết */}
          {!isLoading && filteredBrands.length > 0 && (
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/30">
              <span className="text-xs font-bold text-stone-500">
                Tổng cộng: <span className="text-stone-900">{filteredBrands.length}</span> thương hiệu
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};