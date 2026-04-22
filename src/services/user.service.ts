import api from '@/lib/axios';
import type { 
  UserInfo, 
  UpdateProfilePayload, 
  ChangePasswordPayload, 
  ApiResponse 
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
};