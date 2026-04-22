import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '@/services/product.service';
import type { ProductResponse, ProductPayload, ProductQueryParams, PaginatedData } from '@/types/product.type';

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchProducts = createAsyncThunk<PaginatedData<ProductResponse>, ProductQueryParams | undefined>(
  'products/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await productService.getProducts(params);
      return response.data; // Trả về cục chứa items, totalItems, totalPages...
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách sản phẩm');
    }
  }
);

export const fetchProductById = createAsyncThunk<ProductResponse, number | string>(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getProductById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy chi tiết sản phẩm');
    }
  }
);

export const createProduct = createAsyncThunk<ProductResponse, ProductPayload>(
  'products/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo sản phẩm mới');
    }
  }
);

export const updateProduct = createAsyncThunk<ProductResponse, { id: number | string; payload: ProductPayload }>(
  'products/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(id, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật sản phẩm');
    }
  }
);

export const deleteProduct = createAsyncThunk<number, number | string>(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return Number(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
  }
);

export const fetchNewArrivals = createAsyncThunk<PaginatedData<ProductResponse>, any>(
  'products/fetchNewArrivals',
  async (params, { rejectWithValue }) => {
    try {
      const response = await productService.getNewArrivals(params);
      return response.data; // Trả về { items, meta }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy sản phẩm mới nhất');
    }
  }
);

// ==========================================
// SLICE STATE & LOGIC
// ==========================================

interface ProductState {
  list: ProductResponse[];
  pagination: Omit<PaginatedData<ProductResponse>, 'items'>; // Bỏ items, giữ lại info phân trang
  currentProduct: ProductResponse | null;
  isLoading: boolean;
  isActionLoading: boolean; // Dùng riêng cho lúc bấm nút Thêm/Sửa/Xóa
  error: string | null;
  newArrivals: ProductResponse[];
  arrivalPagination: Omit<PaginatedData<ProductResponse>, 'items'>;
  isArrivalsLoading: boolean;
}

const initialState: ProductState = {
  list: [],
  pagination: {
    totalElements: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  },
  currentProduct: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
  newArrivals: [],
  arrivalPagination: {
    totalElements: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12,
  },
  isArrivalsLoading: false,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => { state.error = null; },
    clearCurrentProduct: (state) => { state.currentProduct = null; },
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.items;
        state.pagination = {
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          limit: action.payload.limit,
        };
      })
      .addCase(fetchProducts.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchProductById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createProduct.pending, (state) => { state.isActionLoading = true; })
      .addCase(createProduct.fulfilled, (state) => {
        state.isActionLoading = false;
        // Không unshift vào list vì thường tạo xong BE sẽ có logic sắp xếp/phân trang mới
        // Nên gọi lại fetchProducts() ở Component sau khi Create thành công
      })
      .addCase(createProduct.rejected, (state, action: any) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateProduct.pending, (state) => { state.isActionLoading = true; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isActionLoading = false;
        const updated = action.payload;
        const index = state.list.findIndex(p => p.productId === updated.productId);
        if (index !== -1) {
          state.list[index] = updated; // Cập nhật ngay trên UI
        }
      })
      .addCase(updateProduct.rejected, (state, action: any) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteProduct.pending, (state) => { state.isActionLoading = true; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.list = state.list.filter(p => p.productId !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action: any) => {
        state.isActionLoading = false;
        state.error = action.payload;
      })

      // NEW ARRIVALS
      .addCase(fetchNewArrivals.pending, (state) => { 
        state.isArrivalsLoading = true; 
        state.isLoading = true; // Bật loading chung để trang Products hiện spinner
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.isArrivalsLoading = false;
        state.isLoading = false;
        state.newArrivals = action.payload.items;
        state.list = action.payload.items; // Cập nhật cả list chung để trang Products hiển thị được
        state.arrivalPagination = {
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
          limit: action.payload.limit,
        };
        state.pagination = state.arrivalPagination; // Đồng bộ pagination chung
      })
      .addCase(fetchNewArrivals.rejected, (state, action: any) => {
        state.isArrivalsLoading = false;
        state.isLoading = false;
        state.error = action.payload; 
      });
  },
});

export const { clearProductError, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;