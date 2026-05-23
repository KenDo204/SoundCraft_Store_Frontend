import api from '@/lib/axios';
import type { 
  UserInfo, 
  UpdateProfilePayload, 
  ChangePasswordPayload, 
  ApiResponse,
  AdminUserListQuery,
  AdminUserListResponse,
  AdminUserDetail,
  CreateUserPayload,
  UpdateUserPayload
} from '@/types/user.type';

// Hàm đóng gói FormData cho chức năng Update Profile
const buildProfileFormData = (payload: UpdateProfilePayload): FormData => {
  const formData = new FormData();
  
  if (payload.full_name) formData.append('full_name', payload.full_name);
  if (payload.mobile) formData.append('mobile', payload.mobile);
  if (payload.dob) formData.append('dob', payload.dob);
  if (payload.gender) formData.append('gender', payload.gender);
  
  // ✅ Đã đổi từ 'avatar' thành 'file' để khớp với BE mới
  if (payload.file) {
    formData.append('file', payload.file);
  }
  
  return formData;
};

// Hàm đóng gói FormData cho chức năng Update Admin User
const buildUserFormData = (payload: UpdateUserPayload): FormData => {
  const formData = new FormData();
  
  if (payload.full_name) formData.append('full_name', payload.full_name);
  if (payload.email) formData.append('email', payload.email);
  if (payload.password) formData.append('password', payload.password);
  if (payload.mobile) formData.append('mobile', payload.mobile);
  if (payload.role) formData.append('role', payload.role);
  if (payload.dob) formData.append('dob', payload.dob);
  if (payload.gender) formData.append('gender', payload.gender);
  if (payload.is_active !== undefined) {
    formData.append('is_active', String(payload.is_active));
  }
  
  if (payload.file) {
    formData.append('file', payload.file);
  }
  
  return formData;
};

export const userService = {
  getMyProfile: async (): Promise<ApiResponse<UserInfo>> => {
    return api.get('/users/account');
  },

  updateMyProfile: async (data: UpdateProfilePayload): Promise<ApiResponse<UserInfo>> => {
    const formData = buildProfileFormData(data);
    return api.put('/users/account', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  changeMyPassword: async (data: ChangePasswordPayload): Promise<ApiResponse<null>> => {
    return api.put('/users/account/password', data);
  },

  // ==========================================
  // ADMINISTRATIVE APIS
  // ==========================================
  
  getAdminUsers: async (params?: AdminUserListQuery): Promise<AdminUserListResponse> => {
    return api.get('/admin/users', { params });
  },

  getAdminUserById: async (id: number): Promise<ApiResponse<AdminUserDetail>> => {
    return api.get(`/admin/users/${id}`);
  },

  updateAdminUserStatus: async (id: number, isActive: boolean): Promise<ApiResponse<any>> => {
    return api.put(`/admin/users/${id}/status`, { isActive });
  },

  createAdminUser: async (data: CreateUserPayload): Promise<ApiResponse<AdminUserDetail>> => {
    return api.post('/users', data);
  },

  updateAdminUser: async (id: number, data: UpdateUserPayload): Promise<ApiResponse<AdminUserDetail>> => {
    if (data.file) {
      const formData = buildUserFormData(data);
      return api.put(`/users/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put(`/users/${id}`, data);
  },

  deleteAdminUser: async (id: number): Promise<ApiResponse<any>> => {
    return api.delete(`/users/${id}`);
  },
};