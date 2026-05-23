import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminReviews, approveReview, hideReview, adminDeleteReview } from '@/store/slices/review.slice';
import { 
  Button, 
  IconButton, 
  Pagination, 
  Tooltip, 
  CircularProgress, 
  Chip, 
  Rating,
  Avatar,
  Tab,
  Tabs
} from '@mui/material';
import { 
  CheckCircle, 
  EyeOff, 
  Delete, 
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export const ReviewManagement = () => {
  const dispatch = useAppDispatch();
  const { adminReviews, totalPages, isLoading, error } = useAppSelector(state => state.reviews);

  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState<'ALL' | 'PENDING' | 'PUBLISHED' | 'HIDDEN'>('ALL');

  useEffect(() => {
    dispatch(fetchAdminReviews({ 
      page, 
      limit: 10, 
      status: statusTab === 'ALL' ? undefined : statusTab 
    }));
  }, [dispatch, page, statusTab]);

  const handleApprove = async (id: number) => {
    try {
      await dispatch(approveReview(id)).unwrap();
      toast.success("Đã duyệt đánh giá");
      await dispatch(fetchAdminReviews({ page, limit: 10, status: statusTab === 'ALL' ? undefined : statusTab }));
    } catch (error: any) {
      toast.error(error || "Lỗi khi duyệt đánh giá");
    }
  };

  const handleHide = async (id: number) => {
    try {
      await dispatch(hideReview(id)).unwrap();
      toast.success("Đã ẩn đánh giá");
      await dispatch(fetchAdminReviews({ page, limit: 10, status: statusTab === 'ALL' ? undefined : statusTab }));
    } catch (error: any) {
      toast.error(error || "Lỗi khi ẩn đánh giá");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?')) {
      try {
        await dispatch(adminDeleteReview(id)).unwrap();
        toast.success("Đã xóa đánh giá");
        await dispatch(fetchAdminReviews({ page, limit: 10, status: statusTab === 'ALL' ? undefined : statusTab }));
      } catch (error: any) {
        toast.error(error || "Lỗi khi xóa đánh giá");
      }
    }
  };

  const getStatusChip = (status: string) => {
    switch(status) {
      case 'PENDING': return <Chip label="Chờ duyệt" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 'bold' }} />;
      case 'PUBLISHED': return <Chip label="Công khai" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 'bold' }} />;
      case 'HIDDEN': return <Chip label="Đã ẩn" size="small" sx={{ bgcolor: '#f3f4f6', color: '#374151', fontWeight: 'bold' }} />;
      default: return <Chip label={status} size="small" />;
    }
  };

  return (
    <div className="p-6 bg-[#fcfbf9] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <MessageCircle className="text-orange-600" />
              Quản lý Đánh giá
            </h1>
            <p className="text-stone-500">Duyệt, ẩn và quản lý các phản hồi từ khách hàng.</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <Tabs 
            value={statusTab} 
            onChange={(_, newValue) => {
              setStatusTab(newValue);
              setPage(1);
            }}
            sx={{ 
              px: 2, borderBottom: 1, borderColor: 'divider',
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold', minWidth: 100 },
              '& .Mui-selected': { color: '#ea580c !important' },
              '& .MuiTabs-indicator': { bgcolor: '#ea580c' }
            }}
          >
            <Tab label="Tất cả" value="ALL" />
            <Tab label="Chờ duyệt" value="PENDING" />
            <Tab label="Đã duyệt" value="PUBLISHED" />
            <Tab label="Đã ẩn" value="HIDDEN" />
          </Tabs>

          {error && (
            <div className="p-10 text-center">
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 inline-block">
                <p className="font-bold">Đã xảy ra lỗi khi tải dữ liệu</p>
                <p className="text-sm">{error}</p>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="error" 
                  sx={{ mt: 2, borderRadius: '8px', fontWeight: 'bold' }}
                  onClick={() => dispatch(fetchAdminReviews({ page, limit: 10, status: statusTab === 'ALL' ? undefined : statusTab }))}
                >
                  Thử lại
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-20"><CircularProgress sx={{ color: '#ea580c' }} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-sm">
                    <th className="p-4 w-[250px]">Khách hàng / Sản phẩm</th>
                    <th className="p-4 w-[150px]">Đánh giá</th>
                    <th className="p-4">Nội dung</th>
                    <th className="p-4 w-[120px]">Trạng thái</th>
                    <th className="p-4 w-[120px] text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {(!adminReviews || !Array.isArray(adminReviews) || adminReviews.length === 0) ? (
                    <tr><td colSpan={5} className="p-10 text-center text-stone-500 font-medium">Không có đánh giá nào.</td></tr>
                  ) : adminReviews.map((review) => {
                    const thumbnailImg = review.product?.images?.find(img => img.is_thumbnail === true);
                    const productImage = thumbnailImg ? thumbnailImg.image_url : (review.product?.images?.[0]?.image_url || '/placeholder.png');
                    
                    return (
                      <tr key={review.review_id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                        <td className="p-4">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                              <Avatar src={review.user?.avatar} sx={{ width: 32, height: 32 }}>{review.user?.full_name?.charAt(0)}</Avatar>
                              <div>
                                  <p className="font-bold text-stone-900 text-sm">{review.user?.full_name}</p>
                                  <p className="text-[10px] text-stone-400">
                                    {review.created_at ? format(new Date(review.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                                  </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                               <img src={productImage} className="w-10 h-10 object-cover rounded shadow-sm" alt="prod" />
                               <p className="text-xs font-bold text-stone-700 line-clamp-1">{review.product?.product_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Rating value={review.rating} readOnly size="small" />
                          <p className="text-xs font-bold text-stone-500 mt-1">{review.rating} / 5 sao</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-stone-700 italic mb-2">"{review.comment || 'Không có bình luận'}"</p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {review.images.map((img, idx) => (
                                <img key={idx} src={img.image_url} className="w-12 h-12 object-cover rounded-md border border-stone-200" alt="review" />
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {getStatusChip(review.review_status)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            {review.review_status === 'PENDING' && (
                              <Tooltip title="Duyệt">
                                <IconButton onClick={() => handleApprove(Number(review.review_id))} sx={{ color: '#16a34a' }}>
                                  <CheckCircle size={18} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {review.review_status !== 'HIDDEN' && (
                              <Tooltip title="Ẩn">
                                <IconButton onClick={() => handleHide(Number(review.review_id))} sx={{ color: '#6b7280' }}>
                                  <EyeOff size={18} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Xóa vĩnh viễn">
                              <IconButton onClick={() => handleDelete(Number(review.review_id))} sx={{ color: '#dc2626' }}>
                                <Delete size={18} />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(_, value) => setPage(value)} 
              sx={{ 
                '& .Mui-selected': { bgcolor: '#ea580c !important', color: 'white' },
                '& .MuiPaginationItem-root': { fontWeight: 'bold' }
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
