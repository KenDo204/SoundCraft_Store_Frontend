import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ghnService } from '@/services/ghn.service';
import type { Province, District, Ward, ShippingFeePayload, ShippingFeeResponse } from '@/types/ghn.type';

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchProvinces = createAsyncThunk<Province[], void>(
  'ghn/fetchProvinces',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ghnService.getProvinces();
      return (response.data || []).map((p: any) => ({
        provinceId: p.ProvinceID || p.provinceId,
        provinceName: p.ProvinceName || p.provinceName
      }));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách Tỉnh/Thành phố');
    }
  }
);

export const fetchDistricts = createAsyncThunk<District[], number | string>(
  'ghn/fetchDistricts',
  async (provinceId, { rejectWithValue }) => {
    try {
      const response = await ghnService.getDistricts(provinceId);
      return (response.data || []).map((d: any) => ({
        districtId: d.DistrictID || d.districtId,
        provinceId: d.ProvinceID || d.provinceId,
        districtName: d.DistrictName || d.districtName
      }));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách Quận/Huyện');
    }
  }
);

export const fetchWards = createAsyncThunk<Ward[], number | string>(
  'ghn/fetchWards',
  async (districtId, { rejectWithValue }) => {
    try {
      const response = await ghnService.getWards(districtId);
      return (response.data || []).map((w: any) => ({
        wardCode: w.WardCode || w.wardCode,
        districtId: w.DistrictID || w.districtId,
        wardName: w.WardName || w.wardName
      }));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy danh sách Phường/Xã');
    }
  }
);

export const calculateFee = createAsyncThunk<ShippingFeeResponse, ShippingFeePayload>(
  'ghn/calculateFee',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await ghnService.calculateShippingFee(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tính phí vận chuyển');
    }
  }
);

// ==========================================
// SLICE STATE & LOGIC
// ==========================================

interface GhnState {
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  shippingFeeResult: ShippingFeeResponse | null;
  
  // Tách biệt trạng thái loading để tránh giật UI khi gọi nhiều API liên tiếp
  isLocationLoading: boolean; 
  isFeeLoading: boolean;
  error: string | null;
}

const initialState: GhnState = {
  provinces: [],
  districts: [],
  wards: [],
  shippingFeeResult: null,
  isLocationLoading: false,
  isFeeLoading: false,
  error: null,
};

const ghnSlice = createSlice({
  name: 'ghn',
  initialState,
  reducers: {
    // Reset data Quận khi đổi Tỉnh khác
    clearDistricts: (state) => {
      state.districts = [];
      state.wards = [];
      state.shippingFeeResult = null;
    },
    // Reset data Phường khi đổi Quận khác
    clearWards: (state) => {
      state.wards = [];
      state.shippingFeeResult = null;
    },
    // Chạy khi muốn reset lại tất cả (ví dụ: đặt hàng xong)
    clearGhnData: (state) => {
      state.districts = [];
      state.wards = [];
      state.shippingFeeResult = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Provinces
      .addCase(fetchProvinces.pending, (state) => { state.isLocationLoading = true; })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.isLocationLoading = false;
        state.provinces = (action.payload as any[]).map(p => ({
          provinceId: p.ProvinceID || p.provinceId,
          provinceName: p.ProvinceName || p.provinceName
        }));
      })
      .addCase(fetchProvinces.rejected, (state, action: any) => {
        state.isLocationLoading = false;
        state.error = action.payload;
      })

      // Fetch Districts
      .addCase(fetchDistricts.pending, (state) => { state.isLocationLoading = true; })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.isLocationLoading = false;
        state.districts = (action.payload as any[]).map(d => ({
          districtId: d.DistrictID || d.districtId,
          provinceId: d.ProvinceID || d.provinceId,
          districtName: d.DistrictName || d.districtName
        }));
      })
      .addCase(fetchDistricts.rejected, (state, action: any) => {
        state.isLocationLoading = false;
        state.error = action.payload;
      })

      // Fetch Wards
      .addCase(fetchWards.pending, (state) => { state.isLocationLoading = true; })
      .addCase(fetchWards.fulfilled, (state, action) => {
        state.isLocationLoading = false;
        state.wards = (action.payload as any[]).map(w => ({
          wardCode: w.WardCode || w.wardCode,
          districtId: w.DistrictID || w.districtId,
          wardName: w.WardName || w.wardName
        }));
      })
      .addCase(fetchWards.rejected, (state, action: any) => {
        state.isLocationLoading = false;
        state.error = action.payload;
      })

      // Calculate Fee
      .addCase(calculateFee.pending, (state) => { state.isFeeLoading = true; })
      .addCase(calculateFee.fulfilled, (state, action) => {
        state.isFeeLoading = false;
        state.shippingFeeResult = action.payload;
      })
      .addCase(calculateFee.rejected, (state, action: any) => {
        state.isFeeLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDistricts, clearWards, clearGhnData } = ghnSlice.actions;
export default ghnSlice.reducer;