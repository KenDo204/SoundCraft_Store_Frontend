import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicReviews, fetchReviewStatistics } from '@/store/slices/review.slice';
import { Rating, CircularProgress, Avatar } from '@mui/material';
import { Star, MessageCircle, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ProductReviewsProps {
  productId: number;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const dispatch = useAppDispatch();
  const { reviews, statistics, isLoading } = useAppSelector(state => state.reviews);
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined);

  useEffect(() => {
    dispatch(fetchPublicReviews({ product_id: productId, rating: filterRating, limit: 10 }));
    dispatch(fetchReviewStatistics(productId));
  }, [dispatch, productId, filterRating]);

  const renderRatingBar = (star: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setFilterRating(star === filterRating ? undefined : star)}>
        <span className="text-sm font-bold text-stone-600 w-12 flex items-center gap-1">
          {star} <Star size={14} fill={star <= (filterRating || 0) ? "#ea580c" : "none"} className={star <= (filterRating || 0) ? "text-orange-600" : "text-stone-300"} />
        </span>
        <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 rounded-full transition-all duration-500" 
            style={{ width: `${percentage}%` }} 
          />
        </div>
        <span className="text-sm font-medium text-stone-400 w-10 text-right">{count}</span>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Overview & Stats */}
      <div className="bg-stone-50 rounded-[32px] p-8 flex flex-col md:flex-row gap-10 border border-stone-100">
        <div className="flex flex-col items-center justify-center text-center space-y-2 md:border-r border-stone-200 md:pr-10">
          <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest">Đánh giá trung bình</h3>
          <div className="text-6xl font-black text-stone-900">{statistics?.averageRating?.toFixed(1) || '0.0'}</div>
          <Rating value={statistics?.averageRating || 0} precision={0.1} readOnly sx={{ color: '#ea580c' }} />
          <p className="text-sm text-stone-500 font-medium">({statistics?.totalReviews || 0} nhận xét)</p>
        </div>

        <div className="flex-1 space-y-3">
          {[5, 4, 3, 2, 1].map((star) => (
            renderRatingBar(
              star, 
              (statistics?.stars as any)?.[star] || 0, 
              statistics?.totalReviews || 0
            )
          ))}
        </div>

        <div className="md:w-1/4 flex flex-col justify-center gap-3">
          <h4 className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <Filter size={16} /> Lọc theo số sao
          </h4>
          <div className="flex flex-wrap gap-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                onClick={() => setFilterRating(star === filterRating ? undefined : star)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  filterRating === star 
                    ? "bg-orange-600 border-orange-600 text-white shadow-md" 
                    : "bg-white border-stone-200 text-stone-600 hover:border-orange-500"
                }`}
              >
                {star} Sao
              </button>
            ))}
          </div>
          {filterRating && (
            <button 
              onClick={() => setFilterRating(undefined)}
              className="text-[10px] font-bold text-orange-600 underline text-left"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="text-orange-600" />
          <h3 className="text-xl font-black text-stone-900">Nhận xét từ khách hàng</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10"><CircularProgress sx={{ color: '#ea580c' }} /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-stone-400 font-medium bg-white rounded-3xl border border-stone-100">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => (
              <div key={review.review_id} className="bg-white p-6 rounded-2xl border border-stone-100 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={review.user?.avatar} sx={{ width: 48, height: 48, border: '2px solid #f5f5f4' }}>
                      {review.user?.full_name?.charAt(0)}
                    </Avatar>
                    <div>
                      <p className="font-bold text-stone-900">{review.user?.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Rating value={review.rating} size="small" readOnly sx={{ color: '#ea580c' }} />
                        <span className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {review.created_at ? format(new Date(review.created_at), 'dd/MM/yyyy') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-stone-700 leading-relaxed mb-4">
                  {review.comment || <span className="text-stone-400 italic">Khách hàng không để lại bình luận.</span>}
                </p>

                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {review.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img.image_url} 
                        className="w-20 h-20 object-cover rounded-xl border border-stone-100 hover:scale-105 transition-transform cursor-zoom-in" 
                        alt="review" 
                      />
                    ))}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-stone-50 flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                  <Star size={10} fill="currentColor" />
                  Đã mua hàng tại SoundCraft
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
