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
import type { TestType } from "@/generated/prisma/enums";
import { generateInsight } from "@/lib/ai/generate-insight";

export async function startTest(data: StartTestInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Chưa đăng nhập" };

  const parsed = startTestSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "Dữ liệu không hợp lệ" };

  const { testType } = parsed.data;

  const activeQuestionCount = await prisma.question.count({
    where: {
      testType: testType as TestType,
      active: true,
    },
  });

  if (activeQuestionCount === 0) {
    return { success: false as const, error: "Bài test này chưa sẵn sàng" };
  }

  const existing = await prisma.testSession.findFirst({
    where: {
      userId: user.id,
      testType: testType as TestType,
      status: "IN_PROGRESS",
    },
    include: {
      answers: { select: { questionId: true } },
    },
  });

  if (existing) {
    return {
      success: true as const,
      sessionId: existing.id,
      answeredQuestionIds: existing.answers.map((answer) => answer.questionId),
    };
  }

  const session = await prisma.testSession.create({
    data: {
      userId: user.id,
      testType: testType as TestType,
    },
  });

  return {
    success: true as const,
    sessionId: session.id,
    answeredQuestionIds: [] as string[],
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

  const activeQuestions = await prisma.question.findMany({
    where: { testType: session.testType, active: true },
    select: { id: true },
  });

  const activeQuestionIds = new Set(activeQuestions.map((question) => question.id));
  const answeredQuestionIds = new Set(session.answers.map((answer) => answer.questionId));

  for (const answeredQuestionId of answeredQuestionIds) {
    if (!activeQuestionIds.has(answeredQuestionId)) {
      return {
        success: false as const,
        error: "Phiên test có dữ liệu trả lời không hợp lệ",
      };
    }
  }

  const totalQuestions = activeQuestions.length;
  if (answeredQuestionIds.size < totalQuestions) {
    return {
      success: false as const,
      error: `Cần trả lời đủ ${totalQuestions} câu hỏi (đã trả lời ${answeredQuestionIds.size}/${totalQuestions})`,
    };
  }

  const totalScores: Record<string, number> = {};
  for (const testAnswer of session.answers) {
    const scores = (testAnswer.answer.scores as Record<string, number>) || {};
    for (const [key, value] of Object.entries(scores)) {
      totalScores[key] = (totalScores[key] || 0) + value;
    }
  }

  await prisma.testSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      totalScores,
    },
  });

  let aiInsight = null;
  try {
    const { insight, config } = await generateInsight({ sessionId });

    aiInsight = await prisma.aIInsight.create({
      data: {
        sessionId,
        summary: insight.summary,
        strengths: insight.strengths,
        improvements: insight.improvements,
        suitableRoles: insight.suitableRoles,
        recommendation: insight.recommendation,
        fullResponse: JSON.stringify(insight),
        tone: config?.tone || "COACH",
        objective: config?.objective || "EVALUATION",
      },
    });
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
