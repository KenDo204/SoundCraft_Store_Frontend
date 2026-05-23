import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminBlogs, deleteAdminBlog, publishAdminBlog, hideAdminBlog } from '@/store/slices/blog.slice';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, FileText, Eye, Clock, Globe, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { PATHS } from '@/config/paths'; // Trỏ đúng path của bạn
import { CircularProgress } from '@mui/material';

export const AdminBlogList = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Lấy dữ liệu từ Redux Store
  const { adminBlogs, isLoading, isActionLoading } = useAppSelector(state => state.blog);

  // Local state cho Pagination
  const [page, setPage] = useState(1);
  const limit = 10; // Cố định 10 bài / 1 trang

  useEffect(() => {
    // Gọi API mỗi khi `page` thay đổi
    dispatch(fetchAdminBlogs({ page, limit }));
  }, [dispatch, page, limit]);

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa bài viết "${title}" không?`)) {
      try {
        await dispatch(deleteAdminBlog(id)).unwrap();
        toast.success('Đã xóa bài viết thành công');
        // Nếu xóa hết bài ở trang hiện tại (trừ trang 1), thì lùi về trang trước
        if (adminBlogs?.data?.length === 1 && page > 1) {
          setPage(page - 1);
        }
      } catch (error: any) {
        toast.error(error);
      }
    }
  };

  const handlePublish = async (id: number, title: string) => {
    if (window.confirm(`Bạn có chắc muốn xuất bản bài viết "${title}" không?`)) {
      try {
        await dispatch(publishAdminBlog(id)).unwrap();
        toast.success('Đã xuất bản bài viết');
        dispatch(fetchAdminBlogs({ page, limit }));
      } catch (error: any) {
        toast.error(error);
      }
    }
  };

  const handleHide = async (id: number, title: string) => {
    if (window.confirm(`Bạn có chắc muốn ẩn bài viết "${title}" không?`)) {
      try {
        await dispatch(hideAdminBlog(id)).unwrap();
        toast.success('Đã ẩn bài viết');
        dispatch(fetchAdminBlogs({ page, limit }));
      } catch (error: any) {
        toast.error(error);
      }
    }
  };

  // Tính toán số lượng trang
  const totalItems = adminBlogs?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // Helper render badge trạng thái
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Hiển thị</span>;
      case 'HIDDEN':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Đang ẩn</span>;
      default:
        return <span className="bg-stone-200 text-stone-600 px-3 py-1 rounded-full text-xs font-bold">Bản nháp</span>;
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-stone-800 flex items-center gap-3">
              <FileText className="text-orange-600" /> Quản lý Bài viết (Blog)
            </h1>
            <p className="text-stone-500 mt-1">Tổng cộng {totalItems} bài viết trên hệ thống</p>
          </div>
          <Link 
            to={PATHS.ADMIN_BLOG_ADD} // Route dẫn tới trang thêm mới lúc nãy
            className="bg-stone-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} strokeWidth={3} /> Viết bài mới
          </Link>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm">
                  <th className="p-4 font-bold">Bài viết</th>
                  <th className="p-4 font-bold">Tác giả</th>
                  <th className="p-4 font-bold">Trạng thái</th>
                  <th className="p-4 font-bold text-center">Lượt xem</th>
                  <th className="p-4 font-bold">Ngày tạo</th>
                  <th className="p-4 font-bold text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      <CircularProgress size={32} sx={{ color: '#ea580c' }} />
                    </td>
                  </tr>
                ) : adminBlogs?.data?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-stone-500 font-medium">
                      Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!
                    </td>
                  </tr>
                ) : (
                  adminBlogs?.data.map((blog) => (
                    <tr key={blog.blog_id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={blog.image} 
                            alt={blog.title} 
                            className="w-16 h-12 rounded-lg object-cover bg-stone-100 border border-stone-200"
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; 
                              target.src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                          <div>
                            <p className="font-bold text-stone-800 line-clamp-1 max-w-[300px]" title={blog.title}>
                              {blog.title}
                            </p>
                            <p className="text-xs text-stone-400 truncate max-w-[300px]">/{blog.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-stone-700">
                        {blog.author?.full_name || 'Admin'}
                      </td>
                      <td className="p-4">
                        {renderStatusBadge(blog.status)}
                      </td>
                      <td className="p-4 text-center text-sm font-bold text-stone-600">
                        <div className="flex items-center justify-center gap-1">
                          <Eye size={14} className="text-stone-400" /> {blog.view_count}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-stone-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-stone-400" />
                          {new Date(blog.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          {blog.status !== 'PUBLISHED' && (
                            <button 
                              disabled={isActionLoading}
                              onClick={() => handlePublish(Number(blog.blog_id), blog.title)}
                              className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Xuất bản bài viết"
                            >
                              <Globe size={18} />
                            </button>
                          )}
                          {blog.status === 'PUBLISHED' && (
                            <button 
                              disabled={isActionLoading}
                              onClick={() => handleHide(Number(blog.blog_id), blog.title)}
                              className="p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Ẩn bài viết"
                            >
                              <EyeOff size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => navigate(`/admin/blogs/edit/${blog.blog_id}`)}
                            className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Sửa bài viết"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            disabled={isActionLoading}
                            onClick={() => handleDelete(Number(blog.blog_id), blog.title)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Xóa bài viết"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 🌟 PHÂN TRANG (PAGINATION) NẰM Ở ĐÂY */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-between items-center">
              <span className="text-sm text-stone-500 font-medium">
                Hiển thị trang <span className="font-bold text-stone-800">{page}</span> / {totalPages}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-sm font-bold rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>
                
                {/* Render các số trang */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-lg transition-colors ${
                      page === num 
                        ? 'bg-orange-600 text-white shadow-sm' 
                        : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-sm font-bold rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};