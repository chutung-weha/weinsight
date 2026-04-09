import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Tên cần ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  department: z.string().min(1, "Vui lòng chọn phòng ban"),
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
