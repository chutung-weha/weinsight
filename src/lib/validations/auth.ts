import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Tên cần ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  department: z.string().min(1, "Vui lòng chọn phòng ban"),
  password: z
    .string()
    .min(8, "Mật khẩu cần ít nhất 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu cần ít nhất 1 chữ in hoa")
    .regex(/[0-9]/, "Mật khẩu cần ít nhất 1 chữ số"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
