import { z } from "zod";

export const addressSchema = z.object({
  recipientName: z.string().min(2, "Tên người nhận từ 2-100 ký tự").max(100),
  phone: z.string().regex(/^(\+84|0)[35789][0-9]{8}$/, "Số điện thoại không hợp lệ"),
  provinceId: z.coerce.number().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  districtId: z.coerce.number().min(1, "Vui lòng chọn Quận/Huyện"),
  wardCode: z.string().min(1, "Vui lòng chọn Phường/Xã"),
  addressDetail: z.string().min(5, "Địa chỉ chi tiết từ 5-255 ký tự").max(255),
  isDefault: z.boolean().optional().default(false),
  addressNote: z.string().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;