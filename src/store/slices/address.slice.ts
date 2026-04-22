import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addressService } from '@/services/address.service';
import type { AddressResponse, AddressPayload } from '@/types/address.type';

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchAddresses = createAsyncThunk<AddressResponse[], void>(
  'addresses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await addressService.getMyAddresses();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách địa chỉ');
    }
  }
);

export const fetchDefaultAddress = createAsyncThunk<AddressResponse | null, void>(
  'addresses/fetchDefault',
  async (_, { rejectWithValue }) => {
    try {
      const response = await addressService.getDefaultAddress();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy địa chỉ mặc định');
    }
  }
);

export const fetchAddressById = createAsyncThunk<AddressResponse, number | string>(
  'addresses/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await addressService.getAddressById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy thông tin địa chỉ');
    }
  }
);

export const createAddress = createAsyncThunk<AddressResponse, AddressPayload>(
  'addresses/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await addressService.createAddress(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tạo địa chỉ');
    }
  }
);

export const updateAddress = createAsyncThunk<AddressResponse, { id: number | string; addressPayload: AddressPayload }>(
  'addresses/update',
  async ({ id, addressPayload }, { rejectWithValue }) => {
    try {
      const response = await addressService.updateAddress(id, addressPayload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật địa chỉ');
    }
  }
);

export const setDefaultAddress = createAsyncThunk<AddressResponse, number | string>(
  'addresses/setDefault',
  async (id, { rejectWithValue }) => {
    try {
      const response = await addressService.setDefaultAddress(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi đặt địa chỉ mặc định');
    }
  }
);

export const deleteAddress = createAsyncThunk<number, number | string>(
  'addresses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await addressService.deleteAddress(id);
      return Number(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa địa chỉ');
    }
  }
);

// ==========================================
// SLICE STATE & LOGIC
// ==========================================

interface AddressState {
  list: AddressResponse[];
  defaultAddress: AddressResponse | null;
  currentAddress: AddressResponse | null; // Dùng cho form Edit
  isLoading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  list: [],
  defaultAddress: null,
  currentAddress: null,
  isLoading: false,
  error: null,
};

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    clearAddressError: (state) => { state.error = null; },
    clearCurrentAddress: (state) => { state.currentAddress = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAddresses.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
        // Tự động set defaultAddress nếu có trong list
        state.defaultAddress = action.payload.find(a => a.isDefault) || null;
      })
      .addCase(fetchAddresses.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Default
      .addCase(fetchDefaultAddress.fulfilled, (state, action) => {
        state.defaultAddress = action.payload;
      })

      // Fetch By Id
      .addCase(fetchAddressById.fulfilled, (state, action) => {
        state.currentAddress = action.payload;
      })

      // Create
      .addCase(createAddress.fulfilled, (state, action) => {
        const newAddress = action.payload;
        if (newAddress.isDefault) {
          // Nếu địa chỉ mới là mặc định, gỡ mặc định các địa chỉ cũ
          state.list.forEach(a => a.isDefault = false);
          state.defaultAddress = newAddress;
        }
        state.list.unshift(newAddress); // Đưa lên đầu danh sách
      })

      // Update
      .addCase(updateAddress.fulfilled, (state, action) => {
        const updatedAddress = action.payload;
        if (updatedAddress.isDefault) {
          state.list.forEach(a => a.isDefault = false);
          state.defaultAddress = updatedAddress;
        }
        const index = state.list.findIndex(a => a.addressId === updatedAddress.addressId);
        if (index !== -1) {
          state.list[index] = updatedAddress;
        }
      })

      // Set Default (Logic siêu mượt cho UI)
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        const newDefault = action.payload;
        // Gỡ cờ isDefault của tất cả các phần tử khác
        state.list.forEach(a => {
          a.isDefault = a.addressId === newDefault.addressId;
        });
        state.defaultAddress = newDefault;
      })

      // Delete
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.list = state.list.filter(a => a.addressId !== action.payload);
        if (state.defaultAddress?.addressId === action.payload) {
          state.defaultAddress = null; // Nếu lỡ xóa địa chỉ mặc định thì reset state
        }
      });
  },
});

export const { clearAddressError, clearCurrentAddress } = addressSlice.actions;
export default addressSlice.reducer;