import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeScoreMeta } from "@/lib/scoring";
import { getInsightEligibility } from "@/lib/ai/generate-insight";

function getAnsweredQuestionIds(answers: Array<{ questionId: string }>): string[] {
  return [...new Set(answers.map((answer) => answer.questionId).filter(Boolean))];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Chưa đăng nhập" },
      { status: 401 }
    );
  }

  const { sessionId } = await params;

  const testSession = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: {
        include: {
          question: { select: { content: true, order: true } },
          answer: { select: { text: true } },
        },
        orderBy: { question: { order: "asc" } },
      },
      aiInsight: true,
    },
  });

  if (!testSession) {
    return NextResponse.json(
      { success: false, error: "Không tìm thấy phiên test" },
      { status: 404 }
    );
  }

  const isOwner = testSession.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "HR";
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: "Không có quyền xem kết quả này" },
      { status: 403 }
    );
  }

  const insightEligibility = getInsightEligibility({
    testType: testSession.testType,
    status: testSession.status,
    candidateName: testSession.candidateName,
    dateOfBirth: testSession.dateOfBirth,
    occupation: testSession.occupation,
  });

  // Numerology không có questions — skip score meta computation
  const isNumerology = testSession.testType === "NUMEROLOGY";
  const answeredQuestionIds = getAnsweredQuestionIds(testSession.answers);
  const { maxScores, questionCount } = isNumerology
    ? { maxScores: {}, questionCount: 0 }
    : await computeScoreMeta(testSession.testType, {
        questionIds: answeredQuestionIds.length > 0 ? answeredQuestionIds : undefined,
      });

  return NextResponse.json({
    success: true,
    data: {
      id: testSession.id,
      testType: testSession.testType,
      status: testSession.status,
      totalScores: testSession.totalScores,
      candidateName: testSession.candidateName,
      dateOfBirth: testSession.dateOfBirth,
      occupation: testSession.occupation,
      maxScores,
      questionCount,
      canGenerateAiInsight: insightEligibility.eligible,
      aiInsightReason: insightEligibility.reason,
      completedAt: testSession.completedAt,
      answers: testSession.answers.map((a) => ({
        question: a.question.content,
        answer: a.answer.text,
        order: a.question.order,
      })),
      aiInsight: testSession.aiInsight
        ? (() => {
            const ai = testSession.aiInsight;
            let extra: Record<string, unknown> = {};
            try { extra = JSON.parse(ai.fullResponse); } catch { /* ignore */ }
            const toStringArray = (val: unknown): string[] => {
              if (Array.isArray(val)) return val.map(String).filter(Boolean);
              if (val && typeof val === "object") return Object.values(val).map(String).filter(Boolean);
              return [];
            };
            return {
              summary: String(ai.summary || ""),
              personalityProfile: typeof extra.personalityProfile === "string" ? extra.personalityProfile : null,
              numerologyInsight: typeof extra.numerologyInsight === "string" ? extra.numerologyInsight : null,
              strengths: toStringArray(ai.strengths),
              improvements: toStringArray(ai.improvements),
              suitableRoles: toStringArray(ai.suitableRoles),
              developmentPlan: Array.isArray(extra.developmentPlan)
                ? (extra.developmentPlan as string[]).map(String).filter(Boolean)
                : extra.developmentPlan && typeof extra.developmentPlan === "object"
                  ? Object.values(extra.developmentPlan as Record<string, unknown>).map(String).filter(Boolean)
                  : null,
              recommendation: String(ai.recommendation || ""),
            };
          })()
        : null,
    },
  });
}
