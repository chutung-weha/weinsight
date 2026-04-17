import { z } from "zod/v4";

// Base schema: cho phép cả LOGIC/SITUATION (không cần insight → không cần 3 field)
// và DISC (bắt buộc đủ 3 field để tính insight tổng hợp).
// Dùng refinement để enforce rule theo testType — tránh đi đường vòng qua
// discriminated union phức tạp.
export const startTestSchema = z
  .object({
    testType: z.enum(["DISC", "LOGIC", "SITUATION"]),
    candidateName: z.string().min(2, "Vui lòng nhập họ tên (ít nhất 2 ký tự)").max(100).optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh phải đúng định dạng YYYY-MM-DD").optional(),
    occupation: z.string().min(1, "Vui lòng nhập nghề nghiệp").max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.testType !== "DISC") return true;
      return (
        !!data.candidateName &&
        data.candidateName.trim().length >= 2 &&
        !!data.dateOfBirth &&
        !!data.occupation &&
        data.occupation.trim().length >= 1
      );
    },
    {
      message: "Bài DISC yêu cầu đầy đủ họ tên, ngày sinh và nghề nghiệp.",
      path: ["testType"],
    }
  );

export const submitAnswerSchema = z.object({
  sessionId: z.string().min(1),
  questionId: z.string().min(1),
  answerId: z.string().min(1),
});

export const completeTestSchema = z.object({
  sessionId: z.string().min(1),
});

export type StartTestInput = z.infer<typeof startTestSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type CompleteTestInput = z.infer<typeof completeTestSchema>;
