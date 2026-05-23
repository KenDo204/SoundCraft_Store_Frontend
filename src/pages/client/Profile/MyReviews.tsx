import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicReviews, deleteReview } from '@/store/slices/review.slice';
import { Rating, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Trash2, Edit3, MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { ReviewModal } from '@/components/common/ReviewModal';
import type { Review } from '@/types/review.type';

export const MyReviews = () => {
  const dispatch = useAppDispatch();
  const { reviews, isLoading } = useAppSelector(state => state.reviews);
  const { user } = useAppSelector(state => state.auth);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchPublicReviews({ limit: 50 })); 
    }
  }, [dispatch, user]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await dispatch(deleteReview(id)).unwrap();
        toast.success('Đã xóa đánh giá thành công');
        dispatch(fetchPublicReviews({ limit: 50 }));
      } catch (error: any) {
        toast.error(error || 'Lỗi khi xóa đánh giá');
      }
    }
  };

  const handleEdit = (review: Review) => {
    setSelectedReview(review);
    setEditModalOpen(true);
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="flex justify-center p-20">
        <CircularProgress sx={{ color: '#ea580c' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
          <MessageSquare className="text-orange-600" />
          Đánh giá của tôi
        </h2>
        <p className="text-stone-500 text-sm">Xem lại các đánh giá bạn đã đóng góp cho cộng đồng.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-stone-50 rounded-2xl p-10 text-center border-2 border-dashed border-stone-200">
          <p className="text-stone-500 font-medium">Bạn chưa viết đánh giá nào.</p>
          <p className="text-stone-400 text-sm mt-1">Hãy mua sắm và chia sẻ cảm nhận của bạn nhé!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews?.map((review) => {
            const thumbnailImg = review.product?.images?.find(img => img.is_thumbnail === true);
            const productImage = thumbnailImg ? thumbnailImg.image_url : (review.product?.images?.[0]?.image_url || '/placeholder.png');
            
            return (
              <div key={review.review_id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    <img 
                      src={productImage} 
                      alt="product" 
                      className="w-16 h-16 object-cover rounded-xl border border-stone-100" 
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-stone-800 line-clamp-1">{review.product?.product_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Rating value={review.rating} readOnly size="small" sx={{ color: '#ea580c' }} />
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {review.created_at ? format(new Date(review.created_at), 'dd/MM/yyyy') : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 mt-3 italic leading-relaxed">"{review.comment}"</p>
                      
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {review.images.map((img, idx) => (
                            <img key={idx} src={img.image_url} className="w-12 h-12 object-cover rounded-lg border border-stone-100" alt="review" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end gap-2">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton 
                        onClick={() => handleEdit(review)}
                        className="hover:bg-orange-50 text-stone-400 hover:text-orange-600 transition-colors"
                      >
                        <Edit3 size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton 
                        onClick={() => handleDelete(Number(review.review_id))}
                        className="hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Trạng thái:</span>
                    {review.review_status === 'PUBLISHED' ? (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Công khai</span>
                    ) : review.review_status === 'PENDING' ? (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Đang chờ duyệt</span>
                    ) : (
                      <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">Đã ẩn</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {selectedReview && (
        <ReviewModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedReview(null);
          }}
          product={{
            id: Number(selectedReview.product?.product_id),
            name: selectedReview.product?.product_name || '',
            image: selectedReview.product?.images?.[0]?.image_url || '/placeholder.png'
          }}
          initialData={selectedReview}
          onSuccess={() => dispatch(fetchPublicReviews({ limit: 50 }))}
        />
      )}
    </div>
  );
};
