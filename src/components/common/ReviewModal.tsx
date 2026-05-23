import { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Rating, 
  IconButton,
  CircularProgress,
  Typography
} from '@mui/material';
import { X, Camera, UploadCloud } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { createReview, updateReview } from '@/store/slices/review.slice';
import { toast } from 'react-toastify';
import type { Review } from '@/types/review.type';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    image: string;
  };
  orderId?: number;
  initialData?: Review | null;
  onSuccess?: () => void;
}

export const ReviewModal = ({ open, onClose, product, orderId, initialData, onSuccess }: ReviewModalProps) => {
  const dispatch = useAppDispatch();
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating);
      setComment(initialData.comment || '');
      // Extract image_url from ReviewImage objects
      const urls = initialData.images?.map(img => img.image_url) || [];
      setExistingImageUrls(urls);
      setImageUrls([]);
      setImages([]);
    } else {
      setRating(5);
      setComment('');
      setExistingImageUrls([]);
      setImageUrls([]);
      setImages([]);
    }
  }, [initialData, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast.warning('Vui lòng chọn số sao đánh giá');
      return;
    }

    setIsUploading(true);
    try {
      if (initialData) {
        await dispatch(updateReview({
          id: Number(initialData.review_id),
          data: {
            rating: rating,
            comment: comment,
            images: images // Files to upload
          }
        })).unwrap();
        toast.success('Đã cập nhật đánh giá!');
      } else {
        await dispatch(createReview({
          product_id: product.id,
          order_id: orderId,
          rating: rating,
          comment: comment,
          images: images // Files to upload
        })).unwrap();
        toast.success('Cảm ơn bạn đã gửi đánh giá!');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ 
        sx: { borderRadius: '24px', p: 1 } 
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" fontWeight="900" className="text-stone-900">
          {initialData ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
        </Typography>
        <IconButton onClick={onClose} size="small" className="hover:bg-stone-100 rounded-full">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl mb-6 border border-stone-100">
          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-xl border border-stone-200" />
          <div>
            <p className="font-bold text-stone-800 line-clamp-1">{product.name}</p>
            <p className="text-xs text-stone-500">Phân loại: Mặc định</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 mb-6">
          <Typography variant="subtitle2" fontWeight="bold" className="text-stone-600">Vui lòng đánh giá chất lượng sản phẩm</Typography>
          <Rating 
            value={rating} 
            onChange={(_, newValue) => setRating(newValue)} 
            size="large"
            sx={{ '& .MuiRating-iconFilled': { color: '#ea580c' } }}
          />
          <Typography variant="caption" className="text-stone-400">
            {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Không hài lòng' : 'Rất tệ'}
          </Typography>
        </div>

        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              bgcolor: '#fcfbf9',
              '& fieldset': { borderColor: '#e7e5e4' },
              '&:hover fieldset': { borderColor: '#ea580c' },
              '&.Mui-focused fieldset': { borderColor: '#ea580c' }
            }
          }}
        />

        <div className="mt-6">
          <Typography variant="subtitle2" fontWeight="bold" className="text-stone-600 mb-3 flex items-center gap-2">
            <Camera size={16} /> Hình ảnh sản phẩm (Tùy chọn)
          </Typography>
          
          <div className="flex flex-wrap gap-3">
            {/* Existing Images */}
            {existingImageUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative w-20 h-20 group">
                <img src={url} alt="existing" className="w-full h-full object-cover rounded-xl border border-stone-200 shadow-sm" />
                <button 
                  onClick={() => removeExistingImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* New Images */}
            {imageUrls.map((url, index) => (
              <div key={`new-${index}`} className="relative w-20 h-20 group">
                <img src={url} alt="upload" className="w-full h-full object-cover rounded-xl border border-stone-200 shadow-sm ring-2 ring-orange-400" />
                <button 
                  onClick={() => removeNewImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            
            {(imageUrls.length + existingImageUrls.length) < 5 && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-orange-500 hover:text-orange-500 transition-all bg-stone-50"
              >
                <UploadCloud size={24} />
                <span className="text-[10px] font-bold">Thêm ảnh</span>
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
          <Typography variant="caption" className="text-stone-400 mt-2 block">Tối đa 5 hình ảnh.</Typography>
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose} 
          sx={{ color: 'stone.500', fontWeight: 'bold', textTransform: 'none' }}
        >
          Hủy bỏ
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isUploading}
          sx={{ 
            bgcolor: '#ea580c', 
            borderRadius: '12px', 
            px: 4,
            fontWeight: 'bold',
            textTransform: 'none',
            '&:hover': { bgcolor: '#c2410c' } 
          }}
        >
          {isUploading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (initialData ? 'Cập nhật' : 'Gửi đánh giá')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
