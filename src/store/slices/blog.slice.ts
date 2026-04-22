import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogService } from '@/services/blog.service';
import type { 
  BlogUser, 
  BlogAdmin, 
  PaginatedBlogResponse,
  CreateBlogPayload,
  UpdateBlogPayload
} from '@/types/blog.type';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface BlogQueryParams {
  page?: number;
  limit?: number;
  // Bạn có thể thêm search, status... vào đây sau này
}

interface BlogState {
  // Dành cho Public
  publishedBlogs: PaginatedBlogResponse<BlogUser> | null;
  currentBlog: BlogUser | null;
  
  // Dành cho Admin
  adminBlogs: PaginatedBlogResponse<BlogAdmin> | null;
  
  // Trạng thái chung
  isLoading: boolean;
  isActionLoading: boolean; // Dành cho create/update/delete
  error: string | null;
}

const initialState: BlogState = {
  publishedBlogs: null,
  currentBlog: null,
  adminBlogs: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
};

// ==========================================
// ASYNC THUNKS (PUBLIC)
// ==========================================

export const fetchPublishedBlogs = createAsyncThunk<PaginatedBlogResponse<BlogUser>, BlogQueryParams | undefined>(
  'blogs/fetchPublished',
  async (params, { rejectWithValue }) => {
    try {
      const response = await blogService.getPublishedBlogs(params?.page, params?.limit);
      return response as any; // Lấy ruột PaginatedBlogResponse bên trong ApiResponse
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách bài viết');
    }
  }
);

export const fetchBlogDetail = createAsyncThunk<BlogUser, string>(
  'blogs/fetchDetail',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await blogService.getBlogBySlug(slug);
      return response as any;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy chi tiết bài viết');
    }
  }
);

// ==========================================
// ASYNC THUNKS (ADMIN)
// ==========================================

export const fetchAdminBlogs = createAsyncThunk<PaginatedBlogResponse<BlogAdmin>, BlogQueryParams | undefined>(
  'blogs/fetchAdminAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await blogService.getAllAdminBlogs(params?.page, params?.limit);
      return response as any;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách quản trị bài viết');
    }
  }
);

export const deleteAdminBlog = createAsyncThunk<number | string, number | string>(
  'blogs/deleteAdmin',
  async (id, { rejectWithValue }) => {
    try {
      await blogService.deleteBlog(id);
      return id; // Trả về ID để xóa khỏi state
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa bài viết');
    }
  }
);

export const createAdminBlog = createAsyncThunk<BlogAdmin, CreateBlogPayload>(
  'blogs/createAdmin',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await blogService.createBlog(payload);
      return response as any;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo bài viết');
    }
  }
);

export const updateAdminBlog = createAsyncThunk<BlogAdmin, { id: number | string; payload: UpdateBlogPayload }>(
  'blogs/updateAdmin',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await blogService.updateBlog(id, payload);
      return response as any;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật bài viết');
    }
  }
);

export const publishAdminBlog = createAsyncThunk<number | string, number | string>(
  'blogs/publishAdmin',
  async (id, { rejectWithValue }) => {
    try {
      await blogService.publishBlog(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xuất bản bài viết');
    }
  }
);

export const hideAdminBlog = createAsyncThunk<number | string, number | string>(
  'blogs/hideAdmin',
  async (id, { rejectWithValue }) => {
    try {
      await blogService.hideBlog(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi ẩn bài viết');
    }
  }
);

// ==========================================
// SLICE
// ==========================================

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    clearBlogError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // --- Fetch Published Blogs ---
    builder.addCase(fetchPublishedBlogs.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPublishedBlogs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.publishedBlogs = action.payload;
    });
    builder.addCase(fetchPublishedBlogs.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // --- Fetch Blog Detail ---
    builder.addCase(fetchBlogDetail.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchBlogDetail.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentBlog = action.payload;
    });
    builder.addCase(fetchBlogDetail.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // --- Fetch Admin Blogs ---
    builder.addCase(fetchAdminBlogs.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminBlogs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.adminBlogs = action.payload;
    });
    builder.addCase(fetchAdminBlogs.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // --- Delete Admin Blog ---
    builder.addCase(deleteAdminBlog.pending, (state) => {
      state.isActionLoading = true;
      state.error = null;
    });
    builder.addCase(deleteAdminBlog.fulfilled, (state, action) => {
      state.isActionLoading = false;
      // Tự động filter bỏ bài viết đã xóa khỏi danh sách admin hiện tại để UI tự cập nhật mà ko cần reload trang
      if (state.adminBlogs) {
        state.adminBlogs.data = state.adminBlogs.data.filter(blog => blog.blog_id !== action.payload);
        state.adminBlogs.total -= 1;
      }
    });
    builder.addCase(deleteAdminBlog.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.payload as string;
    });

    // --- Create Admin Blog ---
    builder.addCase(createAdminBlog.pending, (state) => { state.isActionLoading = true; });
    builder.addCase(createAdminBlog.fulfilled, (state, action) => {
      state.isActionLoading = false;
      if (state.adminBlogs) {
        state.adminBlogs.data.unshift(action.payload);
        state.adminBlogs.total += 1;
      }
    });
    builder.addCase(createAdminBlog.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.payload as string;
    });

    // --- Update Admin Blog ---
    builder.addCase(updateAdminBlog.pending, (state) => { state.isActionLoading = true; });
    builder.addCase(updateAdminBlog.fulfilled, (state, action) => {
      state.isActionLoading = false;
      if (state.adminBlogs) {
        const idx = state.adminBlogs.data.findIndex(b => b.blog_id === action.payload.blog_id);
        if (idx !== -1) state.adminBlogs.data[idx] = action.payload;
      }
    });
    builder.addCase(updateAdminBlog.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.payload as string;
    });

    // --- Publish Admin Blog ---
    builder.addCase(publishAdminBlog.pending, (state) => { state.isActionLoading = true; });
    builder.addCase(publishAdminBlog.fulfilled, (state, action) => {
      state.isActionLoading = false;
      if (state.adminBlogs) {
        const blog = state.adminBlogs.data.find(b => b.blog_id === action.payload);
        if (blog) { blog.status = 'PUBLISHED'; blog.published_at = new Date().toISOString(); }
      }
    });
    builder.addCase(publishAdminBlog.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.payload as string;
    });

    // --- Hide Admin Blog ---
    builder.addCase(hideAdminBlog.pending, (state) => { state.isActionLoading = true; });
    builder.addCase(hideAdminBlog.fulfilled, (state, action) => {
      state.isActionLoading = false;
      if (state.adminBlogs) {
        const blog = state.adminBlogs.data.find(b => b.blog_id === action.payload);
        if (blog) blog.status = 'HIDDEN';
      }
    });
    builder.addCase(hideAdminBlog.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearCurrentBlog, clearBlogError } = blogSlice.actions;
export default blogSlice.reducer;