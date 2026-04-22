import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublishedBlogs } from '@/store/slices/blog.slice';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { Calendar, Eye, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export const BlogList = () => {
  const dispatch = useAppDispatch();
  const { publishedBlogs, isLoading } = useAppSelector(state => state.blog);
  const [page, setPage] = useState(1);
  const limit = 9;

  useEffect(() => {
    dispatch(fetchPublishedBlogs({ page, limit }));
  }, [dispatch, page]);

  const blogs = publishedBlogs?.data ?? [];
  const total = publishedBlogs?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-orange-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-orange-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-400 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
            <BookOpen size={16} />
            <span>Blog & Kiến thức</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Khám Phá Thế Giới <span className="text-orange-400">Âm Nhạc</span>
          </h1>
          <p className="text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Cập nhật những bài viết mới nhất về nhạc cụ, hướng dẫn chọn mua, 
            và chia sẻ kinh nghiệm từ các chuyên gia.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <CircularProgress size={40} sx={{ color: '#ea580c' }} />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={64} className="mx-auto text-stone-300 mb-4" />
            <h3 className="text-xl font-bold text-stone-600 mb-2">Chưa có bài viết nào</h3>
            <p className="text-stone-400">Hãy quay lại sau, chúng tôi đang chuẩn bị nội dung thú vị cho bạn!</p>
          </div>
        ) : (
          <>
            {/* Featured Post (first item) */}
            {blogs.length > 0 && (
              <Link to={`/blog/${blogs[0].slug}`} className="group block mb-12">
                <div className="relative bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-[16/10] md:aspect-auto overflow-hidden">
                      <img
                        src={blogs[0].image || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800'}
                        alt={blogs[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-8 md:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          Nổi bật
                        </span>
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(blogs[0].published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-stone-800 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {blogs[0].title}
                      </h2>
                      <p className="text-stone-500 leading-relaxed mb-6 line-clamp-3">
                        {blogs[0].short_description || 'Nhấn để đọc bài viết...'}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                            {blogs[0].author?.full_name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-stone-700">{blogs[0].author?.full_name || 'Admin'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-stone-400 text-sm">
                          <Eye size={14} />
                          <span>{blogs[0].view_count?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            {blogs.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.slice(1).map((blog) => (
                  <Link to={`/blog/${blog.slug}`} key={blog.blog_id} className="group">
                    <article className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 h-full flex flex-col">
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={blog.image || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600'}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(blog.published_at).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <Eye size={12} />
                            {blog.view_count?.toLocaleString() || 0}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                          {blog.title}
                        </h3>
                        <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">
                          {blog.short_description || ''}
                        </p>
                        <div className="flex items-center gap-2 pt-4 border-t border-stone-100 mt-auto">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center text-white text-xs font-bold">
                            {blog.author?.full_name?.charAt(0) || 'A'}
                          </div>
                          <span className="text-xs font-medium text-stone-600">{blog.author?.full_name || 'Admin'}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-14">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      p === page
                        ? 'bg-stone-900 text-white shadow-lg'
                        : 'border border-stone-200 text-stone-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
