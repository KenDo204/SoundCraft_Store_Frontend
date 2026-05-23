import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { reviewService } from '@/services/review.service';
import type {
  Review,
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryDto,
  ReviewStatistics
} from '@/types/review.type';

interface ReviewState {
  reviews: Review[];
  adminReviews: Review[];
  statistics: ReviewStatistics | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  adminReviews: [],
  statistics: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,
};

export const fetchPublicReviews = createAsyncThunk(
  'reviews/fetchPublic',
  async (params: ReviewQueryDto, { rejectWithValue }) => {
    try {
      return await reviewService.getPublicReviews(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const fetchAdminReviews = createAsyncThunk(
  'reviews/fetchAdmin',
  async (params: ReviewQueryDto, { rejectWithValue }) => {
    try {
      return await reviewService.getAdminReviews(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin reviews');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async (data: CreateReviewDto, { rejectWithValue }) => {
    try {
      return await reviewService.createReview(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ id, data }: { id: number; data: UpdateReviewDto }, { rejectWithValue }) => {
    try {
      return await reviewService.updateReview(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const approveReview = createAsyncThunk(
  'reviews/approve',
  async (id: number, { rejectWithValue }) => {
    try {
      return await reviewService.approveReview(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve review');
    }
  }
);

export const hideReview = createAsyncThunk(
  'reviews/hide',
  async (id: number, { rejectWithValue }) => {
    try {
      return await reviewService.hideReview(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to hide review');
    }
  }
);

export const adminDeleteReview = createAsyncThunk(
  'reviews/adminDelete',
  async (id: number, { rejectWithValue }) => {
    try {
      await reviewService.adminDeleteReview(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const fetchReviewStatistics = createAsyncThunk(
  'reviews/fetchStatistics',
  async (productId: number, { rejectWithValue }) => {
    try {
      return await reviewService.getStatistics(productId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Public Reviews
      .addCase(fetchPublicReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPublicReviews.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        const payload = action.payload;
        const reviews = payload?.data && Array.isArray(payload.data) 
          ? payload.data 
          : (payload?.data?.data && Array.isArray(payload.data.data) ? payload.data.data : (Array.isArray(payload) ? payload : []));
        
        state.reviews = reviews;
        state.total = payload?.total || payload?.data?.total || reviews.length || 0;
        state.page = Number(payload?.page || payload?.data?.page || 1);
        state.limit = Number(payload?.limit || payload?.data?.limit || 10);
        state.totalPages = payload?.totalPages || payload?.data?.totalPages || Math.ceil(state.total / state.limit) || 0;
      })
      .addCase(fetchPublicReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Admin Reviews
      .addCase(fetchAdminReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAdminReviews.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Robust check for data location
        const payload = action.payload;
        const reviews = payload?.data && Array.isArray(payload.data) 
          ? payload.data 
          : (payload?.data?.data && Array.isArray(payload.data.data) ? payload.data.data : (Array.isArray(payload) ? payload : []));
        
        state.adminReviews = reviews;
        state.total = payload?.total || payload?.data?.total || reviews.length || 0;
        state.page = Number(payload?.page || payload?.data?.page || 1);
        state.limit = Number(payload?.limit || payload?.data?.limit || 10);
        state.totalPages = payload?.totalPages || payload?.data?.totalPages || Math.ceil(state.total / state.limit) || 0;
      })
      .addCase(fetchAdminReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Review
      .addCase(createReview.fulfilled, (state, action: PayloadAction<Review>) => {
        state.reviews.unshift(action.payload);
      })

      // Update Review
      .addCase(updateReview.fulfilled, (state, action: PayloadAction<Review>) => {
        const index = state.reviews.findIndex(r => r.review_id === action.payload.review_id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      })

      // Delete Review
      .addCase(deleteReview.fulfilled, (state, action: PayloadAction<number>) => {
        state.reviews = state.reviews.filter(r => r.review_id !== action.payload);
      })

      // Approve Review
      .addCase(approveReview.fulfilled, (state, action: PayloadAction<Review>) => {
        const index = state.adminReviews.findIndex(r => r.review_id === action.payload.review_id);
        if (index !== -1) {
          state.adminReviews[index] = action.payload;
        }
      })

      // Hide Review
      .addCase(hideReview.fulfilled, (state, action: PayloadAction<Review>) => {
        const index = state.adminReviews.findIndex(r => r.review_id === action.payload.review_id);
        if (index !== -1) {
          state.adminReviews[index] = action.payload;
        }
      })

      // Admin Delete Review
      .addCase(adminDeleteReview.fulfilled, (state, action: PayloadAction<number>) => {
        state.adminReviews = state.adminReviews.filter(r => r.review_id !== action.payload);
      })

      // Fetch Statistics
      .addCase(fetchReviewStatistics.fulfilled, (state, action: PayloadAction<ReviewStatistics>) => {
        state.statistics = action.payload;
      });
  },
});

export const { clearError } = reviewSlice.actions;
export default reviewSlice.reducer;
