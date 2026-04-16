import { prisma } from "@/lib/prisma";
import type { TestType } from "@prisma/client";

export interface ScoreMeta {
  maxScores: Record<string, number>;
  questionCount: number;
}

interface ComputeScoreMetaOptions {
  questionIds?: string[] | null;
}

/**
 * Tính max possible scores per dimension cho một loại test.
 * Với mỗi câu hỏi, lấy max score per dimension across all answers, rồi sum.
 * Kết quả phản ánh "nếu user chọn đáp án tốt nhất cho mỗi câu".
 */
export async function computeScoreMeta(
  testType: TestType | string,
  options: ComputeScoreMetaOptions = {}
): Promise<ScoreMeta> {
  const uniqueQuestionIds = options.questionIds
    ? [...new Set(options.questionIds.filter(Boolean))]
    : null;

  const questionsWithAnswers = await prisma.question.findMany({
    where: uniqueQuestionIds
      ? {
          id: { in: uniqueQuestionIds },
          testType: testType as TestType,
        }
      : { testType: testType as TestType, active: true },
    select: { answers: { select: { scores: true } } },
  });

  const maxScores: Record<string, number> = {};
  for (const q of questionsWithAnswers) {
    const dimensionMaxes: Record<string, number> = {};
    for (const a of q.answers) {
      const scores = (a.scores as Record<string, number>) || {};
      for (const [key, value] of Object.entries(scores)) {
        dimensionMaxes[key] = Math.max(dimensionMaxes[key] || 0, value);
      }
    }
    for (const [key, value] of Object.entries(dimensionMaxes)) {
      maxScores[key] = (maxScores[key] || 0) + value;
    }
  }

  return { maxScores, questionCount: questionsWithAnswers.length };
}
