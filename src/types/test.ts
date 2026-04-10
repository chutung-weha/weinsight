export type {
  QuestionModel as Question,
  AnswerModel as Answer,
  TestSessionModel as TestSession,
  TestAnswerModel as TestAnswer,
} from "@/generated/prisma/models";
export { TestType, SessionStatus } from "@/generated/prisma/enums";

// Typed score structures (Prisma stores as Json, these give type safety at app level)

export interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface LogicScores {
  correct: number;
  reasoning: number;
}

export interface SituationScores {
  leadership: number;
  teamwork: number;
  communication: number;
  problemSolving: number;
}
