import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBlogDetail, clearCurrentBlog } from '@/store/slices/blog.slice';
import { CircularProgress } from '@mui/material';
import { Calendar, Eye, ArrowLeft, Clock, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';

export const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentBlog: blog, isLoading, error } = useAppSelector(state => state.blog);

  useEffect(() => {
    if (slug) {
      dispatch(fetchBlogDetail(slug));
    }
    return () => { dispatch(clearCurrentBlog()); };
  }, [dispatch, slug]);

  // Ước lượng thời gian đọc
  const readingTime = blog?.content
    ? Math.max(1, Math.ceil(blog.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200))
    : 1;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép link bài viết!');
    } catch {
      toast.error('Không thể sao chép link');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <CircularProgress size={40} sx={{ color: '#ea580c' }} />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-center px-4">
        <div className="text-6xl mb-6">📝</div>
        <h2 className="text-2xl font-black text-stone-800 mb-3">Bài viết không tồn tại</h2>
        <p className="text-stone-500 mb-8 max-w-md">
          Bài viết bạn tìm kiếm đã bị xóa hoặc không tồn tại. Hãy thử quay lại danh sách blog.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          <ArrowLeft size={18} />
          Quay lại Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Hero Image */}
      <div className="relative w-full h-[320px] md:h-[420px] overflow-hidden bg-stone-900">
        {blog.image ? (
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-stone-800 via-stone-700 to-orange-900" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-all border border-white/10"
          >
            <ArrowLeft size={16} />
            Tất cả bài viết
          </button>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 drop-shadow-lg">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                  {blog.author?.full_name?.charAt(0) || 'A'}
                </div>
                <span className="font-medium text-white/90">{blog.author?.full_name || 'Admin'}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(blog.published_at).toLocaleDateString('vi-VN', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {readingTime} phút đọc
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {blog.view_count?.toLocaleString() || 0} lượt xem
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        {/* Short description */}
        {blog.short_description && (
          <p className="text-lg md:text-xl text-stone-600 font-medium leading-relaxed mb-8 border-l-4 border-orange-500 pl-5 italic bg-orange-50/50 py-4 pr-4 rounded-r-xl">
            {blog.short_description}
          </p>
        )}

        {/* Main content - rendered as HTML */}
        <article
          className="prose prose-stone prose-lg max-w-none
            prose-headings:font-black prose-headings:text-stone-800
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-stone-600 prose-p:leading-relaxed
            prose-a:text-orange-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-2xl prose-img:shadow-lg prose-img:border prose-img:border-stone-100
            prose-blockquote:border-l-orange-500 prose-blockquote:bg-orange-50/30 prose-blockquote:rounded-r-xl prose-blockquote:py-1
            prose-strong:text-stone-800
            prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-orange-700 prose-code:text-sm
            prose-ul:marker:text-orange-500 prose-ol:marker:text-orange-600
          "
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Footer Actions */}
        <div className="mt-14 pt-8 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Author info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
                {blog.author?.full_name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-bold text-stone-800">{blog.author?.full_name || 'Admin'}</p>
                <p className="text-sm text-stone-400">Tác giả</p>
              </div>
            </div>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-stone-100 hover:bg-orange-100 text-stone-600 hover:text-orange-700 px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
            >
              <Share2 size={16} />
              Chia sẻ bài viết
            </button>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-8 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-orange-600 font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Xem thêm bài viết khác
          </Link>
        </div>
      </div>
    </div>
  );
};
