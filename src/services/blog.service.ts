import api from '@/lib/axios'; // Đổi đường dẫn theo dự án của bạn

import type { 
  BlogUser, 
  BlogAdmin, 
  CreateBlogPayload, 
  UpdateBlogPayload, 
  PaginatedBlogResponse 
} from '@/types/blog.type';

export const blogService = {
  // ================= PUBLIC API (Dành cho User) =================
  
  getPublishedBlogs: async (page: number = 1, limit: number = 10): Promise<PaginatedBlogResponse<BlogUser>> => {
    return api.get('/blogs', { params: { page, limit } });
  },

  getBlogBySlug: async (slug: string): Promise<BlogUser> => {
    return api.get(`/blogs/${slug}`);
  },

  // ================= ADMIN API (Dành cho Quản trị viên) =================
  
  // (Tùy chọn) Hàm lấy toàn bộ blog cho trang quản trị Admin
  getAllAdminBlogs: async (page: number = 1, limit: number = 10): Promise<PaginatedBlogResponse<BlogAdmin>> => {
    return api.get('/blogs/admin', { params: { page, limit } });
  },

  // (Tùy chọn) Hàm lấy chi tiết 1 blog theo ID để admin edit
  getAdminBlogById: async (id: number | string): Promise<BlogAdmin> => {
    return api.get(`/blogs/admin/${id}`);
  },

  createBlog: async (payload: CreateBlogPayload): Promise<BlogAdmin> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('content', payload.content);
    if (payload.short_description) formData.append('short_description', payload.short_description);
    
    // Gắn file nếu có
    if (payload.file) {
      console.log('🔗 [createBlog] Đang đính kèm file ảnh:', payload.file.name, payload.file.size, 'bytes');
      formData.append('file', payload.file);
    }

    return api.post('/blogs/admin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateBlog: async (id: number | string, payload: UpdateBlogPayload): Promise<BlogAdmin> => {
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.content) formData.append('content', payload.content);
    if (payload.short_description) formData.append('short_description', payload.short_description);
    
    // Truyền chuỗi rỗng để xóa ảnh, hoặc truyền url để giữ nguyên
    if (payload.image !== undefined) formData.append('image', payload.image); 
    
    // Gắn file mới nếu có (sẽ ghi đè logic xử lý ảnh ở BE)
    if (payload.file) {
      console.log('🔗 [updateBlog] Đang đính kèm file ảnh mới:', payload.file.name, payload.file.size, 'bytes');
      formData.append('file', payload.file);
    }

    return api.put(`/blogs/admin/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  publishBlog: async (id: number | string): Promise<void> => {
    return api.put(`/blogs/admin/${id}/publish`);
  },

  hideBlog: async (id: number | string): Promise<void> => {
    return api.put(`/blogs/admin/${id}/hide`);
  },

  deleteBlog: async (id: number | string): Promise<void> => {
    return api.delete(`/blogs/admin/${id}`);
  }
};