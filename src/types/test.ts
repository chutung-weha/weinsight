export type {
  Question,
  Answer,
  TestSession,
  TestAnswer,
} from "@prisma/client";
export { TestType, SessionStatus } from "@prisma/client";

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

export type { NumerologyResult as NumerologyScores } from "@/types/numerology";
