export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Kiểu dữ liệu nhận về từ Backend (Khớp với AddressResponseDto)
export interface AddressResponse {
  addressId: number;
  recipientName: string;
  phone: string;
  provinceId: number;
  districtId: number;
  wardCode: string;
  addressDetail: string;
  fullAddress: string;
  isDefault: boolean;
  addressNote?: string;
}

// Kiểu dữ liệu gửi đi khi Thêm/Sửa (Khớp với AddressRequestDto)
export interface AddressPayload {
  recipientName: string;
  phone: string;
  provinceId: number;
  districtId: number;
  wardCode: string;
  addressDetail: string;
  isDefault?: boolean;
  addressNote?: string;
}