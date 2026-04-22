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
    // Nếu API gọi thành công, trả về data luôn
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Nếu lỗi là 401 (Unauthorized) và request này chưa từng được retry
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đang retry để tránh lặp vô hạn

      try {
        // Dùng axios mặc định (không dùng apiClient) để gọi API refresh
        // nhằm tránh việc bị chính response interceptor này can thiệp lại
        const refreshResponse = await axios.get(`${API_URL}/auth/refresh-token`, {
          withCredentials: true, // Vẫn phải mang theo HttpOnly Cookie chứa refresh_token
        });

        console.log("Refresh Token Response:", refreshResponse.data);
        // Lấy token mới từ cục data trả về (cục Body có gói bên trong biến 'data')
        const newAccessToken = refreshResponse.data.data.access_token;

        if (!newAccessToken) {
          throw new Error("Không tìm thấy access_token trong response của API refresh");
        }

        // Cập nhật token mới vào localStorage
        localStorage.setItem('access_token', newAccessToken);

        // Gắn token mới vào Header của request ban đầu bị lỗi
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Gửi lại request ban đầu với token mới
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error("Lỗi Refresh Token:", refreshError);
        // Rơi vào đây tức là Refresh Token cũng đã hết hạn hoặc không hợp lệ.
        // FIX: Xóa TOÀN BỘ auth data (cả user lẫn token) để GuestRoute
        // không đọc lại user cũ từ localStorage và tạo vòng lặp redirect vô hạn.
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        
        window.location.replace('/login'); // replace thay vì href để không tạo history entry
        
        return Promise.reject(refreshError);
      }
    }

    // Các lỗi khác (400, 403, 404, 500...) thì ném ra cho Component tự xử lý
    return Promise.reject(error);
  }
);

export default api;