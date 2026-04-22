import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '@/services/cart.service';
import type { 
  CartState, 
  UpsertCartItemPayload, 
  UpdateCartItemQuantityPayload, 
  UpdateCartItemNotePayload,
  BulkDeleteCartItemsPayload,
  // UpdateCartItemVariantPayload
} from '@/types/cart.type';

const initialState: CartState = {
  cart: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
};

// --- THUNKS ---

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data; // Giả sử BE trả về data bọc trong ApiResponse, và Axios tự gỡ vỏ ở ngoài, trả về { status, message, data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin giỏ hàng');
    }
  }
);

export const upsertCartItem = createAsyncThunk(
  'cart/upsertItem',
  async (payload: UpsertCartItemPayload, { rejectWithValue }) => {
    try {
      const response = await cartService.upsertCartItem(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ itemId, payload }: { itemId: number; payload: UpdateCartItemQuantityPayload }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateQuantity(itemId, payload);
      return response.data; // Chứa giỏ hàng mới nhất
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật số lượng');
    }
  }
);

// export const updateCartItemVariant = createAsyncThunk(
//   'cart/updateVariant',
//   async ({ itemId, payload }: { itemId: number; payload: UpdateCartItemVariantPayload }, { rejectWithValue }) => {
//     try {
//       const response = await cartService.updateVariant(itemId, payload);
//       return response.data;
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật biến thể');
//     }
//   }
// );

export const updateCartItemNote = createAsyncThunk(
  'cart/updateNote',
  async ({ itemId, payload }: { itemId: number; payload: UpdateCartItemNotePayload }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateNote(itemId, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật ghi chú');
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  'cart/deleteItem',
  async (itemId: number, { rejectWithValue }) => {
    try {
      await cartService.deleteItem(itemId);
      return itemId; // Trả về ID để tự lọc ở Frontend
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa sản phẩm khỏi giỏ');
    }
  }
);

export const bulkDeleteCartItems = createAsyncThunk(
  'cart/bulkDelete',
  async (payload: BulkDeleteCartItemsPayload, { rejectWithValue }) => {
    try {
      await cartService.bulkDelete(payload);
      return payload.cartItemIds; // Trả về list ID đã xóa
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa nhiều sản phẩm');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      await cartService.clearCart();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi dọn sạch giỏ hàng');
    }
  }
);

// --- SLICE ---

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // FETCH CART
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload; // Gán giỏ hàng từ BE trả về
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // UPSERT ITEM
    builder
      .addCase(upsertCartItem.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(upsertCartItem.fulfilled, (state, action) => {
        state.isActionLoading = false;
        // Upsert backend trả về một object DTO response của API
        // ta có thể lưu toàn bộ lại vì thường BE trả data chứa cart mới
        state.cart = action.payload;
      })
      .addCase(upsertCartItem.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });

    // UPDATE QUANTITY
    builder
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.cart = action.payload; // BE trả về giỏ hàng mới
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });

    // UPDATE NOTE
    builder
      .addCase(updateCartItemNote.fulfilled, (state, action) => {
        state.cart = action.payload; // BE trả về giỏ hàng mới
      });

    // DELETE ITEM (Lọc local để mượt mà)
    builder
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        if (state.cart && state.cart.items) {
          state.cart.items = state.cart.items.filter(item => item.cart_item_id !== action.payload);
          // (Tùy chọn) Tính lại tổng tiền nếu ở Frontend, hoặc Dispatch fetchCart lại
        }
      });

    // BULK DELETE
    builder
      .addCase(bulkDeleteCartItems.fulfilled, (state, action) => {
        if (state.cart && state.cart.items) {
          state.cart.items = state.cart.items.filter(item => !action.payload.includes(item.cart_item_id));
        }
      });

    // CLEAR CART
    builder
      .addCase(clearCart.fulfilled, (state) => {
        if (state.cart) {
          state.cart.items = [];
          state.cart.totalCartMoney = 0;
        }
      });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
