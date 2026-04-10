import { z } from "zod/v4";

export const numerologyInputSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Vui lòng nhập họ tên đầy đủ")
      .max(100, "Họ tên quá dài")
      .regex(/^[\p{L}\s]+$/u, "Họ tên chỉ chứa chữ cái và khoảng trắng"),
    day: z.number().int().min(1, "Ngày không hợp lệ").max(31, "Ngày không hợp lệ"),
    month: z.number().int().min(1, "Tháng không hợp lệ").max(12, "Tháng không hợp lệ"),
    year: z.number().int().min(1900, "Năm không hợp lệ").max(new Date().getFullYear(), "Năm không hợp lệ"),
  })
  .refine(
    (data) => {
      const date = new Date(data.year, data.month - 1, data.day);
      return (
        date.getFullYear() === data.year &&
        date.getMonth() === data.month - 1 &&
        date.getDate() === data.day
      );
    },
    { message: "Ngày tháng năm sinh không hợp lệ" }
  );

export type NumerologyFormInput = z.infer<typeof numerologyInputSchema>;
