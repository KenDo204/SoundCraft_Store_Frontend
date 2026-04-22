import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Định nghĩa interface để mở rộng config của Axios, thêm cờ _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_URL = import.meta.env.VITE_API_URL;

// Khởi tạo instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * LƯU Ý VỀ STATE MANAGEMENT (REDUX/ZUSTAND):
 * Để tránh lỗi "Circular Dependency" (Vòng lặp import: axios -> store -> slice -> api -> axios),
 * cách an toàn nhất là lưu access_token vào localStorage (hoặc sessionStorage). 
 * Dữ liệu User Info thì bạn vẫn lưu ở Redux/Zustand bình thường.
 */

// 1. REQUEST INTERCEPTOR: Tự động đính kèm Access Token vào mọi API gửi đi
api.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR: Bắt lỗi 401 và xử lý Silent Refresh
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // 1. Nếu lỗi 401 xảy ra khi đang gọi chính API refresh-token hoặc login
    // thì TUYỆT ĐỐI không được retry hay redirect nữa.
    if (
      error.response?.status === 401 && 
      (originalRequest.url?.includes('/auth/refresh-token') || originalRequest.url?.includes('/auth/login'))
    ) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Trả về lỗi để UI xử lý, KHÔNG dùng window.location ở đây
      return Promise.reject(error);
    }

    // 2. Xử lý Silent Refresh cho các API khác bị 401
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.get(`${API_URL}/auth/refresh-token`, {
          withCredentials: true,
        });

        const newAccessToken = refreshResponse.data.data.access_token;
        if (!newAccessToken) throw new Error("No token found");

        localStorage.setItem('access_token', newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
        
      } catch (refreshError) {
        // Nếu refresh thất bại, chỉ xóa dữ liệu, để ProtectedRoute/GuestRoute tự đá đi
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        
        // CỰC KỲ QUAN TRỌNG: 
        // Thay vì window.location.replace('/login'), hãy trả về lỗi.
        // Nếu bạn đang ở trang Login, web sẽ đứng yên không reload nữa.
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;