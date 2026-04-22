import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createAdminBlog, updateAdminBlog } from '@/store/slices/blog.slice';
import { blogService } from '@/services/blog.service';
import { ArrowLeft, BookOpen, Image as ImageIcon, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { TextField, Button, CircularProgress } from '@mui/material';
import { PATHS } from '@/config/paths'; // Đảm bảo đường dẫn này khớp với project của bạn

interface BlogFormData {
  title: string;
  short_description: string;
  content: string;
  image: string;
  file: File | null;
}

export const AdminBlogAddEdit = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { isActionLoading } = useAppSelector((state) => state.blog);

  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    short_description: '',
    content: '',
    image: '',
    file: null,
  });
  
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(''); // Dùng để hiển thị ảnh preview (từ URL hoặc Local File)

  // Load existing blog data when editing
  useEffect(() => {
    if (isEdit && id) {
      setLoadingDetail(true);
      blogService.getAdminBlogById(id)
        .then(res => {
          const blog = res;
          setFormData({
            title: blog.title || '',
            short_description: blog.short_description || '',
            content: blog.content || '',
            image: blog.image || '',
            file: null,
          });
          if (blog.image) setPreviewUrl(blog.image);
        })
        .catch(() => {
          toast.error('Không tìm thấy bài viết');
          navigate(PATHS.ADMIN_BLOG);
        })
        .finally(() => setLoadingDetail(false));
    }
  }, [id, isEdit, navigate]);

  // Dọn dẹp URL tĩnh (memory leak) khi component unmount hoặc previewUrl thay đổi
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Nếu user sửa URL ảnh thủ công và không có file local nào đang chọn
    if (name === 'image' && !formData.file) {
      setPreviewUrl(value);
    }
  };

  // 🌟 HÀM XỬ LÝ KHI CHỌN FILE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate dung lượng ảnh (ví dụ: < 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, file, image: '' })); // Ưu tiên file, xóa URL thủ công
      setPreviewUrl(URL.createObjectURL(file)); // Tạo link preview local
    }
  };

  // 🌟 HÀM XÓA ẢNH ĐANG CHỌN
  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, file: null, image: '' }));
    setPreviewUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết');
      return;
    }

    try {
      if (isEdit && id) {
        await dispatch(updateAdminBlog({ id, payload: formData })).unwrap();
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await dispatch(createAdminBlog(formData)).unwrap();
        toast.success('Tạo bài viết thành công!');
      }
      navigate(PATHS.ADMIN_BLOG);
    } catch (error: any) {
      toast.error(error);
    }
  };

  if (loadingDetail) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress size={36} sx={{ color: '#ea580c' }} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(PATHS.ADMIN_BLOG)} className="flex items-center gap-2 text-stone-500 hover:text-orange-600 mb-6 font-medium transition-colors">
          <ArrowLeft size={18} /> Quay lại danh sách
        </button>

        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 bg-stone-50 flex items-center gap-3">
            <BookOpen className="text-orange-500" />
            <h1 className="text-xl font-bold text-stone-800">
              {isEdit ? 'Chỉnh sửa Bài viết' : 'Viết Bài Mới'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <TextField
              label="Tiêu đề bài viết"
              name="title"
              required
              fullWidth
              value={formData.title}
              onChange={handleChange}
              placeholder="VD: Cách chọn đàn Guitar cho người mới tập"
              inputProps={{ maxLength: 150 }}
              helperText={`${formData.title.length}/150 ký tự`}
              InputProps={{ sx: { borderRadius: '12px' } }}
              sx={{ mb: 2 }}
            />

            {/* Short Description */}
            <TextField
              label="Mô tả ngắn (SEO)"
              name="short_description"
              fullWidth
              multiline
              rows={2}
              value={formData.short_description}
              onChange={handleChange}
              placeholder="Mô tả ngắn gọn về nội dung bài viết, hiển thị trên card và SEO..."
              inputProps={{ maxLength: 300 }}
              helperText={`${formData.short_description.length}/300 ký tự`}
              InputProps={{ sx: { borderRadius: '12px' } }}
            />

            {/* 🌟 VÙNG CHỌN ẢNH BÌA (Tích hợp File Upload & URL) */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
              <label className="text-sm font-bold text-stone-700 block mb-3">Ảnh bìa bài viết</label>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Khối hiển thị Preview */}
                <div className="w-full sm:w-1/3 relative bg-stone-200 rounded-lg aspect-video flex items-center justify-center overflow-hidden border border-dashed border-stone-300">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white rounded-full text-stone-700 transition-colors shadow-sm"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </>
                  ) : (
                    <div className="text-stone-400 flex flex-col items-center gap-1">
                      <ImageIcon size={32} />
                      <span className="text-xs font-medium">Chưa có ảnh</span>
                    </div>
                  )}
                </div>

                {/* Khối chức năng Upload */}
                <div className="flex-1 w-full">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    id="upload-image"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="upload-image" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white font-bold rounded-xl cursor-pointer hover:bg-orange-600 transition-colors shadow-sm w-full sm:w-auto justify-center"
                  >
                    <Upload size={18} /> Chọn ảnh từ máy tính
                  </label>
                  <p className="text-sm text-stone-500 mt-3">
                    Định dạng hỗ trợ: JPG, PNG, WEBP.<br/>
                    Dung lượng tối đa: 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Content (HTML) */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-stone-500" />
                <label className="text-sm font-bold text-stone-700">Nội dung bài viết (HTML)</label>
              </div>
              <TextField
                name="content"
                required
                fullWidth
                multiline
                rows={16}
                value={formData.content}
                onChange={handleChange}
                placeholder={`<h2>Giới thiệu</h2>\n<p>Nội dung bài viết ở đây...</p>\n\n<h2>Hướng dẫn chi tiết</h2>\n<p>Bước 1: ...</p>`}
                InputProps={{
                  sx: {
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: 1.7,
                  }
                }}
              />
              <p className="text-xs text-stone-400 mt-1">
                Hỗ trợ HTML. Dùng các thẻ &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;img&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;blockquote&gt;...
              </p>
            </div>

            {/* Preview toggle */}
            {formData.content && (
              <details className="border border-stone-200 rounded-xl overflow-hidden">
                <summary className="cursor-pointer bg-stone-50 px-5 py-3 text-sm font-bold text-stone-700 hover:bg-stone-100 transition-colors">
                  👁️ Xem trước nội dung
                </summary>
                <div
                  className="p-6 prose prose-stone prose-sm max-w-none
                    prose-headings:font-black prose-headings:text-stone-800
                    prose-a:text-orange-600 prose-img:rounded-xl
                    prose-blockquote:border-l-orange-500"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                />
              </details>
            )}

            {/* Submit */}
            <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
              <Button
                onClick={() => navigate(PATHS.ADMIN_BLOG)}
                sx={{ textTransform: 'none', borderRadius: '8px', px: 3 }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isActionLoading}
                sx={{
                  bgcolor: '#ea580c', py: 1.5, px: 4, borderRadius: '8px',
                  fontWeight: 'bold', textTransform: 'none',
                  '&:hover': { bgcolor: '#c2410c' }
                }}
              >
                {isActionLoading
                  ? <CircularProgress size={24} color="inherit" />
                  : isEdit ? 'Lưu thay đổi' : 'Tạo bài viết'
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};