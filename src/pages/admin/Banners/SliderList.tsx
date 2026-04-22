import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllAdminSliders, toggleSliderStatus, deleteSlider } from '@/store/slices/slider.slice';
import { Button, CircularProgress, Switch, IconButton, Tooltip, Chip } from '@mui/material';
import { Plus, Edit2, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
// import type { SliderResponse } from '@/types/slider.type';
import { toast } from 'react-toastify';

export const SliderList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { adminList, isLoading } = useAppSelector((state) => state.sliders);

  useEffect(() => {
    dispatch(fetchAllAdminSliders());
  }, [dispatch]);

  const handleToggleStatus = (id: number) => {
    dispatch(toggleSliderStatus(id)); // Gọi API toggle cực nhanh
    toast.success('Cập nhật trạng thái Banner thành công!');
  };

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa Banner "${title}" không?`)) {
      dispatch(deleteSlider(id));
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-[#fcfbf9] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Quản lý Banners</h1>
            <p className="text-sm text-stone-500 mt-1 font-medium">Cấu hình các slider quảng cáo trên trang chủ</p>
          </div>
          <Button
            onClick={() => navigate('/admin/banners/add')}
            variant="contained"
            startIcon={<Plus size={18} />}
            sx={{ 
              bgcolor: '#9f8a46', 
              '&:hover': { bgcolor: '#87743b' }, 
              borderRadius: '12px', 
              px: 3, py: 1,
              textTransform: 'none',
              fontWeight: 'bold',
              boxShadow: 'none'
            }}
          >
            Thêm Banner Mới
          </Button>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="bg-white rounded-[24px] shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-200 text-stone-500 text-[11px] uppercase tracking-widest font-black">
                  <th className="px-6 py-5 w-16 text-center">STT</th>
                  <th className="px-6 py-5 w-64">Hình Ảnh</th>
                  <th className="px-6 py-5">Thông Tin Banner</th>
                  <th className="px-6 py-5 w-32 text-center">Trạng Thái</th>
                  <th className="px-6 py-5 w-32 text-center">Thao Tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                {isLoading && adminList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <CircularProgress size={32} sx={{ color: '#9f8a46' }} />
                    </td>
                  </tr>
                ) : adminList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-stone-400 font-medium">
                      Chưa có Banner nào trong hệ thống.
                    </td>
                  </tr>
                ) : (
                  adminList.map((slider, index) => (
                    <tr key={slider.slider_id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-stone-400 text-center">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>

                      {/* HÌNH ẢNH BANNER (Tỉ lệ ngang) */}
                      <td className="px-6 py-4">
                        <div className="w-48 h-20 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group-hover:shadow-md transition-all">
                          {slider.image_url ? (
                            <img src={slider.image_url} alt={slider.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={24} className="text-stone-300" />
                          )}
                        </div>
                      </td>

                      {/* THÔNG TIN */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-black text-stone-900 text-base line-clamp-1">{slider.title || '—'}</span>
                          <span className="text-xs font-medium text-stone-500 line-clamp-1">{slider.sub_title || '—'}</span>
                          
                          <div className="flex items-center gap-3 mt-1">
                            {slider.brand && (
                              <Chip 
                                label={slider.brand.name} 
                                size="small" 
                                sx={{ bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 'bold', fontSize: '10px', height: '20px' }} 
                              />
                            )}
                            {slider.target_url && (
                              <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                                <LinkIcon size={12} /> {slider.target_url}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="px-6 py-4 text-center">
                        <Tooltip title={slider.is_active ? 'Đang bật trên trang chủ' : 'Đang ẩn'}>
                          <Switch 
                            checked={slider.is_active}
                            onChange={() => handleToggleStatus(slider.slider_id)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#00927c' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00927c' },
                            }}
                          />
                        </Tooltip>
                      </td>

                      {/* THAO TÁC */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip title="Chỉnh sửa">
                            <IconButton 
                              size="small" 
                              onClick={() => navigate(`/admin/banners/edit/${slider.slider_id}`)}
                              sx={{ color: '#64748b', bgcolor: '#f8fafc', '&:hover': { color: '#0ea5e9', bgcolor: '#e0f2fe' } }}
                            >
                              <Edit2 size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDelete(slider.slider_id, slider.title)}
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
        </div>
      </div>
    </div>
  );
};