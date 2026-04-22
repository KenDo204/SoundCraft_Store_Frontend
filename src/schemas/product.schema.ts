import { z } from "zod";

export const variantSchema = z.object({
  sizeName: z.string().optional(),
  colorName: z.string().optional(),
  price: z.coerce.number().min(0, "Giá không hợp lệ"),
  stockQuantity: z.coerce.number().min(0, "Tồn kho không hợp lệ"),
  imageUrl: z.string().optional(),
});

export const productSchema = z.object({
  productName: z.string().min(2, "Tên sản phẩm phải từ 2 ký tự"),
  slug: z.string().optional(),
  productDescription: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  originalPrice: z.coerce.number().min(0, "Giá gốc không được âm"),
  price: z.coerce.number().min(0, "Giá bán không được âm"),
  stockQuantity: z.coerce.number().min(0, "Tồn kho không được âm"),
  brandId: z.coerce.number().min(1, "Vui lòng chọn Thương hiệu"),
  categoryId: z.coerce.number().min(1, "Vui lòng chọn Danh mục"),
  inPopular: z.boolean().default(false),
  variants: z.array(variantSchema).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;