"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import {
  startTestSchema,
  submitAnswerSchema,
  completeTestSchema,
  type StartTestInput,
  type SubmitAnswerInput,
  type CompleteTestInput,
} from "@/lib/validations/test";
import type { TestType } from "@prisma/client";
import { generateAndSaveInsight, getInsightEligibility } from "@/lib/ai/generate-insight";

// Số câu hỏi cần chọn cho mỗi session DISC
const DISC_QUESTIONS_PER_SESSION = 20;

function parseSelectedQuestionIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const ids = value.filter((item): item is string => typeof item === "string" && item.length > 0);
  return ids.length > 0 ? ids : null;
}

/**
 * Chọn ngẫu nhiên N phần tử từ mảng (Fisher-Yates shuffle)
 */
function sampleRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export async function startTest(data: StartTestInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Chưa đăng nhập" };

  const parsed = startTestSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "Dữ liệu không hợp lệ" };

  const { testType } = parsed.data;

  const activeQuestions = await prisma.question.findMany({
    where: { testType: testType as TestType, active: true },
    select: { id: true },
  });

  if (activeQuestions.length === 0) {
    return { success: false as const, error: "Bài test này chưa sẵn sàng" };
  }

  const existing = await prisma.testSession.findFirst({
    where: {
      userId: user.id,
      testType: testType as TestType,
      status: "IN_PROGRESS",
    },
    select: {
      id: true,
      candidateName: true,
      dateOfBirth: true,
      occupation: true,
      selectedQuestionIds: true,
      answers: { select: { questionId: true } },
    },
  });

  if (existing) {
    const activeQuestionIdSet = new Set(activeQuestions.map((q) => q.id));
    const selectedIds = parseSelectedQuestionIds(existing.selectedQuestionIds);
    const isLegacyDiscSession =
      testType === "DISC" &&
      activeQuestions.length > DISC_QUESTIONS_PER_SESSION &&
      (!selectedIds || selectedIds.length !== DISC_QUESTIONS_PER_SESSION);

    const hasStaleAnswers = existing.answers.some(
      (answer) => !activeQuestionIdSet.has(answer.questionId)
    );
    const hasStaleSelectedIds =
      !!selectedIds &&
      selectedIds.some((questionId) => !activeQuestionIdSet.has(questionId));
    const shouldAbandonForStaleSelection =
      !!selectedIds &&
      existing.answers.length === 0 &&
      hasStaleSelectedIds;

    if (hasStaleAnswers || shouldAbandonForStaleSelection || isLegacyDiscSession) {
      await prisma.testSession.update({
        where: { id: existing.id },
        data: { status: "ABANDONED" },
      });
      // fall through to create new session
    } else {
      if (parsed.data.candidateName || parsed.data.dateOfBirth || parsed.data.occupation) {
        await prisma.testSession.update({
          where: { id: existing.id },
          data: {
            candidateName: parsed.data.candidateName ?? existing.candidateName,
            dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : existing.dateOfBirth,
            occupation: parsed.data.occupation ?? existing.occupation,
          },
        });
      }
      return {
        success: true as const,
        sessionId: existing.id,
        answeredQuestionIds: existing.answers.map((answer) => answer.questionId),
        selectedQuestionIds: selectedIds,
        hasPreTestInfo: !!(existing.candidateName || parsed.data.candidateName),
      };
    }
  }

  // Chọn ngẫu nhiên câu hỏi cho session mới (chỉ áp dụng với DISC có >= DISC_QUESTIONS_PER_SESSION câu)
  let selectedQuestionIds: string[] | null = null;
  if (
    testType === "DISC" &&
    activeQuestions.length > DISC_QUESTIONS_PER_SESSION
  ) {
    const allIds = activeQuestions.map((q) => q.id);
    selectedQuestionIds = sampleRandom(allIds, DISC_QUESTIONS_PER_SESSION);
  }

  const session = await prisma.testSession.create({
    data: {
      userId: user.id,
      testType: testType as TestType,
      candidateName: parsed.data.candidateName,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : undefined,
      occupation: parsed.data.occupation,
      selectedQuestionIds: selectedQuestionIds ?? undefined,
    },
  });

  return {
    success: true as const,
    sessionId: session.id,
    answeredQuestionIds: [] as string[],
    selectedQuestionIds,
    hasPreTestInfo: !!parsed.data.candidateName,
  };
}

export async function submitAnswer(data: SubmitAnswerInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Chưa đăng nhập" };

  const parsed = submitAnswerSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "Dữ liệu không hợp lệ" };

  const { sessionId, questionId, answerId } = parsed.data;

  const [session, question, answer] = await Promise.all([
    prisma.testSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        status: true,
        testType: true,
        selectedQuestionIds: true,
      },
    }),
    prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        testType: true,
        active: true,
      },
    }),
    prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        id: true,
        questionId: true,
      },
    }),
  ]);

  if (!session || session.userId !== user.id) {
    return { success: false as const, error: "Phiên test không hợp lệ" };
  }

  if (session.status !== "IN_PROGRESS") {
    return { success: false as const, error: "Phiên test đã kết thúc" };
  }

  if (!question || !question.active || question.testType !== session.testType) {
    return { success: false as const, error: "Câu hỏi không hợp lệ" };
  }

  // Nếu session có selectedQuestionIds → validate câu hỏi nằm trong danh sách đã chọn
  const selectedIds = parseSelectedQuestionIds(session.selectedQuestionIds);
  if (selectedIds && selectedIds.length > 0 && !selectedIds.includes(questionId)) {
    return { success: false as const, error: "Câu hỏi không thuộc phiên test này" };
  }

  if (!answer || answer.questionId !== questionId) {
    return { success: false as const, error: "Đáp án không hợp lệ" };
  }

  await prisma.testAnswer.upsert({
    where: {
      sessionId_questionId: { sessionId, questionId },
    },
    update: { answerId, answeredAt: new Date() },
    create: { sessionId, questionId, answerId },
  });

  return { success: true as const };
}

export async function completeTest(data: CompleteTestInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Chưa đăng nhập" };

  const parsed = completeTestSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "Dữ liệu không hợp lệ" };

  const { sessionId } = parsed.data;

  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      userId: true,
      status: true,
      testType: true,
      candidateName: true,
      dateOfBirth: true,
      occupation: true,
      selectedQuestionIds: true,
      answers: {
        select: {
          questionId: true,
          answer: { select: { scores: true } },
        },
      },
    },
  });

  if (!session || session.userId !== user.id) {
    return { success: false as const, error: "Phiên test không hợp lệ" };
  }

  if (session.status !== "IN_PROGRESS") {
    return { success: false as const, error: "Phiên test đã kết thúc" };
  }

  // Lấy tất cả câu hỏi active để validate
  const activeQuestions = await prisma.question.findMany({
    where: { testType: session.testType, active: true },
    select: { id: true },
  });
  const activeQuestionIdSet = new Set(activeQuestions.map((q) => q.id));

  // Xác định danh sách câu hỏi cần trả lời:
  // - Nếu session có selectedQuestionIds (DISC random) → giao với active (phòng admin deactivate giữa chừng)
  // - Nếu không → dùng tất cả câu hỏi active của loại test
  let requiredQuestionIds: Set<string>;
  const storedSelected = parseSelectedQuestionIds(session.selectedQuestionIds);
  if (storedSelected && storedSelected.length > 0) {
    // Chỉ giữ lại những câu hỏi còn active (tránh block nếu admin deactivate)
    requiredQuestionIds = new Set(
      storedSelected.filter((id) => activeQuestionIdSet.has(id))
    );
  } else {
    requiredQuestionIds = activeQuestionIdSet;
  }

  const answeredQuestionIds = new Set(session.answers.map((answer) => answer.questionId));

  for (const answeredQuestionId of answeredQuestionIds) {
    if (!activeQuestionIdSet.has(answeredQuestionId)) {
      return {
        success: false as const,
        error: "Phiên test có dữ liệu trả lời không hợp lệ",
      };
    }
  }

  const totalQuestions = requiredQuestionIds.size;
  if (totalQuestions === 0) {
    await prisma.testSession.update({
      where: { id: sessionId },
      data: { status: "ABANDONED" },
    });
    return {
      success: false as const,
      error: "Phiên test không còn câu hỏi hợp lệ. Vui lòng bắt đầu lại.",
    };
  }

  // Đếm số câu đã trả lời trong danh sách yêu cầu
  const answeredRequired = session.answers.filter((a) =>
    requiredQuestionIds.has(a.questionId)
  ).length;

  if (answeredRequired < totalQuestions) {
    return {
      success: false as const,
      error: `Cần trả lời đủ ${totalQuestions} câu hỏi (đã trả lời ${answeredRequired}/${totalQuestions})`,
    };
  }

  // Chỉ tính điểm từ câu hỏi trong danh sách yêu cầu
  const totalScores: Record<string, number> = {};
  for (const testAnswer of session.answers) {
    if (!requiredQuestionIds.has(testAnswer.questionId)) continue;
    const scores = (testAnswer.answer.scores as Record<string, number>) || {};
    for (const [key, value] of Object.entries(scores)) {
      totalScores[key] = (totalScores[key] || 0) + value;
    }
  }

  // Atomic update: chỉ update nếu status vẫn là IN_PROGRESS
  // Ngăn race condition khi double-submit
  const updated = await prisma.testSession.updateMany({
    where: { id: sessionId, status: "IN_PROGRESS" },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      totalScores,
    },
  });

  if (updated.count === 0) {
    return { success: false as const, error: "Phiên test đã kết thúc" };
  }

  // AI insight generation nằm ngoài guard vì là external call chậm
  // Nếu fail, test vẫn COMPLETED — insight có thể re-generate sau
  let aiInsight = null;
  try {
    const eligibility = getInsightEligibility({
      testType: session.testType,
      status: "COMPLETED",
      candidateName: session.candidateName,
      dateOfBirth: session.dateOfBirth,
      occupation: session.occupation,
    });

    if (eligibility.eligible) {
      aiInsight = await generateAndSaveInsight(sessionId);
    }
  } catch (error) {
    console.error("AI Insight generation failed:", error);
  }

  return {
    success: true as const,
    sessionId,
    totalScores,
    aiInsight,
  };
}
