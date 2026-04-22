import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { recommendationService } from '@/services/recommendation.service';
import type { ProductResponse } from '@/types/product.type';

export const fetchForYouRecommendations = createAsyncThunk<ProductResponse[], number>(
  'recommendations/fetchForYou',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await recommendationService.getForYou(userId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const fetchSimilarRecommendations = createAsyncThunk<ProductResponse[], number>(
  'recommendations/fetchSimilar',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await recommendationService.getSimilar(productId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

interface RecommendationState {
  forYouProducts: ProductResponse[];
  similarProducts: ProductResponse[];
  isLoadingForYou: boolean;
  isLoadingSimilar: boolean;
  error: string | null;
}

const initialState: RecommendationState = {
  forYouProducts: [],
  similarProducts: [],
  isLoadingForYou: false,
  isLoadingSimilar: false,
  error: null,
};

const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchForYouRecommendations.pending, (state) => {
        state.isLoadingForYou = true;
        state.error = null;
      })
      .addCase(fetchForYouRecommendations.fulfilled, (state, action) => {
        state.isLoadingForYou = false;
        state.forYouProducts = action.payload;
      })
      .addCase(fetchForYouRecommendations.rejected, (state, action: any) => {
        state.isLoadingForYou = false;
        state.error = action.payload;
      })
      .addCase(fetchSimilarRecommendations.pending, (state) => {
        state.isLoadingSimilar = true;
        state.error = null;
      })
      .addCase(fetchSimilarRecommendations.fulfilled, (state, action) => {
        state.isLoadingSimilar = false;
        state.similarProducts = action.payload;
      })
      .addCase(fetchSimilarRecommendations.rejected, (state, action: any) => {
        state.isLoadingSimilar = false;
        state.error = action.payload;
      });
  },
});

export default recommendationSlice.reducer;
