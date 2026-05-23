export interface ReviewUser {
  user_id: string | number;
  full_name: string;
  avatar: string;
  email?: string;
}

export interface ReviewImage {
  review_image_id: string | number;
  image_url: string;
}

export interface ReviewProduct {
  product_id: string | number;
  product_name: string;
  images?: { image_url: string; is_thumbnail: boolean }[];
}

export interface Review {
  review_id: number;
  rating: number;
  comment?: string;
  review_status: 'PENDING' | 'PUBLISHED' | 'HIDDEN';
  user: ReviewUser;
  product?: ReviewProduct;
  images?: ReviewImage[];
  created_at: string;
  updated_at: string;
}

export interface CreateReviewDto {
  product_id: number;
  order_id?: number;
  rating: number;
  comment?: string;
  images?: File[];
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
  images?: File[];
}

export interface ReviewQueryDto {
  rating?: number;
  status?: 'PENDING' | 'PUBLISHED' | 'HIDDEN';
  product_id?: number;
  sort?: 'highest_rating' | 'lowest_rating' | 'newest' | 'oldest';
  page?: number | string;
  limit?: number | string;
}

export interface ReviewStatistics {
  product_id: number;
  averageRating: number;
  totalReviews: number;
  stars: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface PagedReviewResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
