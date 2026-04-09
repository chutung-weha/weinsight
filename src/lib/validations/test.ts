import { z } from "zod/v4";

export const startTestSchema = z.object({
  testType: z.enum(["DISC", "LOGIC", "SITUATION"]),
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
