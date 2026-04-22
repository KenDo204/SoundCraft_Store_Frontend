import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { categoryService } from '@/services/category.service';
import type { CategoryResponse, CategoryAdmin, GetAdminCategoriesParams, CategoryPayload } from '@/types/category.type';

// ==========================================
// ASYNC THUNKS (Xử lý tác vụ bất đồng bộ)
// ==========================================

export const fetchCategoryTree = createAsyncThunk(
  'categories/fetchTree',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getTree();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy cây danh mục');
    }
  }
);

export const fetchAdminCategories = createAsyncThunk(
  'categories/fetchAdmin',
  async (params: GetAdminCategoriesParams | undefined, { rejectWithValue }) => {
    try {
      const response = await categoryService.getAllForAdmin(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách danh mục');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (payload: CategoryPayload, { rejectWithValue }) => {
    try {
      const response = await categoryService.create(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo danh mục');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, payload }: { id: number | string; payload: CategoryPayload }, { rejectWithValue }) => {
    try {
      const response = await categoryService.update(id, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật danh mục');
    }
  }
);

export const toggleCategoryStatus = createAsyncThunk(
  'categories/toggleStatus',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await categoryService.toggleStatus(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi đổi trạng thái');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await categoryService.delete(id);
      return id; // Trả về ID để xóa khỏi state nội bộ
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa danh mục');
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (id: string | number, { rejectWithValue }) => {
    try {
      const response = await categoryService.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin danh mục');
    }
  }
);

// ==========================================
// SLICE
// ==========================================

interface CategoryState {
  tree: CategoryResponse[];               // Phục vụ Client Menu
  adminList: CategoryAdmin[];     // Phục vụ Admin Table
  selectedCategory: CategoryAdmin | null; // Phục vụ Edit/Detail
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  tree: [],
  adminList: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      // Thành công: Fetch Tree
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tree = action.payload;
      })

      // Thành công: Fetch Single Category
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCategory = action.payload;
      })
      
      // Thành công: Fetch Admin List
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminList = action.payload;
      })

      // Thành công: Create (Thêm thẳng vào state)
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminList.unshift(action.payload); // Đẩy lên đầu danh sách
      })

      // Thành công: Update & Toggle Status (Cập nhật object trong mảng)
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.adminList.findIndex((c) => c.category_id === action.payload.category_id);
        if (index !== -1) state.adminList[index] = action.payload;
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.adminList.findIndex((c) => c.category_id === action.payload.category_id);
        if (index !== -1) state.adminList[index] = action.payload;
      })

      // Thành công: Delete (Xóa khỏi mảng)
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminList = state.adminList.filter((c) => c.category_id !== action.payload);
      })

      // Trạng thái chung (Loading)
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      )
  },
});

export const { clearError, clearSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;