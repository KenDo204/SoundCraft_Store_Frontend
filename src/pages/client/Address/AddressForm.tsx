import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProvinces, fetchDistricts, fetchWards, clearDistricts, clearWards } from '@/store/slices/ghn.slice';
import { createAddress, updateAddress } from '@/store/slices/address.slice';
import { addressSchema, type AddressFormValues } from '@/schemas/address.schema';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface Props {
  initialData?: any; // Dữ liệu từ BE trả về khi Edit
  onSuccess: () => void;
}

export const AddressForm: React.FC<Props> = ({ initialData, onSuccess }) => {
  const dispatch = useAppDispatch();
  const isEditMode = !!initialData;

  // Lấy dữ liệu GHN từ Redux
  const { provinces, districts, wards } = useAppSelector(state => state.ghn);
  const { isLoading: isSubmitting } = useAppSelector(state => state.addresses);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema) as any,
    // Tự động đổ dữ liệu khi ở chế độ Sửa (Edit)
    values: initialData ? {
      recipientName: initialData.recipientName || '',
      phone: initialData.phone || '',
      provinceId: Number(initialData.provinceId), // Đảm bảo là số
      districtId: Number(initialData.districtId), // Đảm bảo là số
      wardCode: initialData.wardCode || '',       // wardCode của GHN là chuỗi
      addressDetail: initialData.addressDetail || '',
      isDefault: initialData.isDefault || false,
      addressNote: initialData.addressNote || '',
    } : undefined
  });

  // Lắng nghe sự thay đổi của Tỉnh và Quận để gọi API
  const selectedProvince = watch("provinceId");
  const selectedDistrict = watch("districtId");

  // 1. Load Tỉnh khi mount component
  useEffect(() => {
    dispatch(fetchProvinces());
  }, [dispatch]);

  // 2. Load Huyện khi Tỉnh thay đổi
  useEffect(() => {
    // Chỉ gọi API nếu có selectedProvince và nó là số hợp lệ (lớn hơn 0)
    if (selectedProvince && !isNaN(selectedProvince)) {
      dispatch(fetchDistricts(selectedProvince));
      
      // Nếu user tự đổi Tỉnh khác với Tỉnh ban đầu lúc Edit, ta xóa Huyện/Xã đi
      if (!initialData || selectedProvince !== Number(initialData.provinceId)) {
        dispatch(clearDistricts());
        // Ép kiểu undefined về any để lách luật TS khi reset field
        setValue("districtId", undefined as any); 
        setValue("wardCode", "");
      }
    }
  }, [selectedProvince, dispatch, setValue, initialData]);

  // 3. Load Xã khi Huyện thay đổi
  useEffect(() => {
    if (selectedDistrict && !isNaN(selectedDistrict)) {
      dispatch(fetchWards(selectedDistrict));
      
      if (!initialData || selectedDistrict !== Number(initialData.districtId)) {
        dispatch(clearWards());
        setValue("wardCode", "");
      }
    }
  }, [selectedDistrict, dispatch, setValue, initialData]);

  const onSubmit = async (data: any) => {
    const formData = data as AddressFormValues;
    try {
      if (isEditMode) {
        await dispatch(updateAddress({ id: initialData.addressId, addressPayload: formData })).unwrap();
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        await dispatch(createAddress(formData)).unwrap();
        toast.success("Thêm địa chỉ mới thành công");
      }
      onSuccess(); // Đóng form sau khi lưu thành công
    } catch (error: any) {
      toast.error(error || "Có lỗi xảy ra");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tên & SĐT */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-stone-700">Người nhận <span className="text-red-500">*</span></label>
          <input 
            {...register("recipientName")} 
            className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" 
            placeholder="VD: Vỹ Hoàng" 
          />
          {errors.recipientName && <p className="text-xs text-red-500">{errors.recipientName.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-stone-700">Số điện thoại <span className="text-red-500">*</span></label>
          <input 
            {...register("phone")} 
            className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" 
            placeholder="09xxxxxxx" 
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        {/* CASCADING SELECTS */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-stone-700">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
          <select 
            className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50"
            // ✅ QUAN TRỌNG NHẤT: valueAsNumber = true
            {...register("provinceId", { valueAsNumber: true })} 
          >
            <option value="">Chọn Tỉnh/Thành</option>
            {provinces.map(p => <option key={p.provinceId} value={p.provinceId}>{p.provinceName}</option>)}
          </select>
          {errors.provinceId && <p className="text-xs text-red-500">{errors.provinceId.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-stone-700">Quận/Huyện <span className="text-red-500">*</span></label>
          <select 
            className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50"
            disabled={!selectedProvince || isNaN(selectedProvince)}
            // ✅ QUAN TRỌNG NHẤT: valueAsNumber = true
            {...register("districtId", { valueAsNumber: true })}
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map(d => <option key={d.districtId} value={d.districtId}>{d.districtName}</option>)}
          </select>
          {errors.districtId && <p className="text-xs text-red-500">{errors.districtId.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-stone-700">Phường/Xã <span className="text-red-500">*</span></label>
          <select 
            className="flex h-11 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50"
            disabled={!selectedDistrict || isNaN(selectedDistrict)}
            // wardCode là string nên KHÔNG dùng valueAsNumber
            {...register("wardCode")}
          >
            <option value="">Chọn Phường/Xã</option>
            {wards.map(w => <option key={w.wardCode} value={w.wardCode}>{w.wardName}</option>)}
          </select>
          {errors.wardCode && <p className="text-xs text-red-500">{errors.wardCode.message}</p>}
        </div>
      </div>

      {/* ĐỊA CHỈ CHI TIẾT */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-stone-700">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
        <textarea 
          {...register("addressDetail")} 
          className="flex min-h-[80px] w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" 
          placeholder="Số nhà, hẻm, tên đường..."
        />
        {errors.addressDetail && <p className="text-xs text-red-500">{errors.addressDetail.message}</p>}
      </div>

      {/* MẶC ĐỊNH */}
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="isDefault" 
          {...register("isDefault")} 
          className="w-4 h-4 accent-orange-600 rounded border-stone-300 cursor-pointer" 
        />
        <label htmlFor="isDefault" className="text-sm font-medium text-stone-700 cursor-pointer select-none">
          Đặt làm địa chỉ mặc định
        </label>
      </div>

      {/* NÚT SUBMIT */}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-stone-900 text-white h-12 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
        {isEditMode ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
      </button>
    </form>
  );
};