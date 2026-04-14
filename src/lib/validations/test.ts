import { z } from "zod/v4";

export const startTestSchema = z.object({
  testType: z.enum(["DISC", "LOGIC", "SITUATION", "NUMEROLOGY"]),
  candidateName: z.string().min(2, "Vui lòng nhập họ tên (ít nhất 2 ký tự)").max(100).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh phải đúng định dạng YYYY-MM-DD").optional(),
  occupation: z.string().min(1, "Vui lòng nhập nghề nghiệp").max(100).optional(),
});

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
