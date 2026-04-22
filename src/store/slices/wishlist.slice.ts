import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService } from '@/services/wishlist.service';
import type { WishlistState } from '@/types/wishlist.type';

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await wishlistService.toggleWishlist(productId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật danh sách yêu thích');
    }
  }
);

export const fetchMyWishlist = createAsyncThunk(
  'wishlist/fetchMy',
  async (params: any | undefined, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getMyWishlist(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách yêu thích');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId: number, { rejectWithValue }) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa khỏi danh sách yêu thích');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Wishlist
    builder.addCase(fetchMyWishlist.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchMyWishlist.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload.items;
    });
    builder.addCase(fetchMyWishlist.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Toggle Wishlist
    // Note: Usually we refetch or update state manually. 
    // If it's a toggle, we might not know if it was an add or remove without checking payload.
    builder.addCase(toggleWishlist.fulfilled, (state, action) => {
      // Logic toggle tùy vào việc bạn muốn refetch hay update local
      // Ở đây ta có thể xóa khỏi mảng nếu isInWishlist là false
      if (!action.payload.isInWishlist) {
        state.items = state.items.filter(item => item.productId !== action.payload.productId);
      }
    });

    // Remove
    builder.addCase(removeFromWishlist.fulfilled, (state, action) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
    });
  },
});

export const { clearWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
