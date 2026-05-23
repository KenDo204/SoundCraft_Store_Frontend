import api from '@/lib/axios';
import type { 
  Review, 
  CreateReviewDto, 
  UpdateReviewDto, 
  ReviewQueryDto, 
  ReviewStatistics, 
  PagedReviewResponse 
} from '@/types/review.type';

export const reviewService = {
  // User endpoints

  createReview: async (data: CreateReviewDto): Promise<Review> => {
    const formData = new FormData();
    formData.append('product_id', data.product_id.toString());
    if (data.order_id) formData.append('order_id', data.order_id.toString());
    formData.append('rating', data.rating.toString());
    if (data.comment) formData.append('comment', data.comment);
    
    if (data.images && data.images.length > 0) {
      data.images.forEach(file => {
        formData.append('images', file);
      });
    }

    const response = await api.post('/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateReview: async (id: number, data: UpdateReviewDto): Promise<Review> => {
    const formData = new FormData();
    if (data.rating !== undefined) formData.append('rating', data.rating.toString());
    if (data.comment !== undefined) formData.append('comment', data.comment);
    
    if (data.images && data.images.length > 0) {
      data.images.forEach(file => {
        formData.append('images', file);
      });
    }

    const response = await api.patch(`/reviews/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteReview: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },

  getPublicReviews: async (params: ReviewQueryDto): Promise<PagedReviewResponse> => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },

  // Admin endpoints
  getAdminReviews: async (params: ReviewQueryDto): Promise<PagedReviewResponse> => {
    const response = await api.get('/reviews/admin/list', { params });
    return response.data;
  },

  approveReview: async (id: number): Promise<Review> => {
    const response = await api.patch(`/reviews/${id}/approve`);
    return response.data;
  },

  hideReview: async (id: number): Promise<Review> => {
    const response = await api.patch(`/reviews/${id}/hide`);
    return response.data;
  },

  adminDeleteReview: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}/admin`);
  },

  getStatistics: async (productId: number): Promise<ReviewStatistics> => {
    const response = await api.get(`/reviews/statistics/${productId}`);
    return response.data;
  }
};
