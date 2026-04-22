import { z } from "zod";

// 1. Định nghĩa Schema
export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu phải ít nhất 1 ký tự"),
});

export type LoginFormValue = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  otp: z.string().length(6, "Mã OTP phải đúng 6 số"),
  newPassword: z.string().min(6, "Mật khẩu mới quá ngắn"),
});

export type ResetPasswordFormValue = z.infer<typeof resetPasswordSchema>;

export const registerSchema = z.object({
  full_name: z.string().min(2, "Họ và tên phải ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận lại mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"], // Lỗi sẽ hiện ở ô confirmPassword
});

export type RegisterFormValue = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Họ và tên phải có ít nhất 2 ký tự")
    .max(100, "Họ và tên không được vượt quá 100 ký tự")
    .trim(), // Loại bỏ khoảng trắng thừa (chống spam space)
  mobile: z
    .string()
    .regex(/^(\+84|0)[35789][0-9]{8}$/, "Số điện thoại Việt Nam không hợp lệ")
    .optional()
    .or(z.literal('')), // Cho phép để trống nếu BE cho phép
  dob: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

// 2. Schema Đổi mật khẩu (Khớp ChangePasswordDto)
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;