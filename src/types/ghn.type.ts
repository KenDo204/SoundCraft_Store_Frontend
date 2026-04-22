export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// --- KẾT QUẢ TRẢ VỀ TỪ API DANH MỤC ĐỊA CHỈ ---
export interface Province {
  provinceId: number;
  provinceName: string;
}

export interface District {
  districtId: number;
  provinceId: number;
  districtName: string;
}

export interface Ward {
  wardCode: string; // Lưu ý wardCode thường là dạng chuỗi bên GHN
  districtId: number;
  wardName: string;
}

// --- PAYLOAD GỬI ĐI TÍNH PHÍ VẬN CHUYỂN ---
export interface ShippingFeePayload {
  fromDistrictId: number;
  toDistrictId: number;
  toWardCode: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  insuranceValue?: number;
}

// --- KẾT QUẢ TRẢ VỀ TỪ API TÍNH PHÍ ---
export interface AvailableService {
  serviceId: number;
  serviceName: string;
  serviceTypeId: number;
}

export interface ShippingFeeResponse {
  totalFee: number;
  serviceFee: number;
  insuranceFee: number;
  serviceId: number;
  serviceName: string;
  expectedDeliveryTime?: string;
  availableServices: AvailableService[];
}