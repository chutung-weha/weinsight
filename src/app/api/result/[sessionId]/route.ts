import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeScoreMeta } from "@/lib/scoring";

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
      aiInsights: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
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

  // Numerology không có questions — skip score meta computation
  const isNumerology = testSession.testType === "NUMEROLOGY";
  const { maxScores, questionCount } = isNumerology
    ? { maxScores: {}, questionCount: 0 }
    : await computeScoreMeta(testSession.testType);

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
      completedAt: testSession.completedAt,
      answers: testSession.answers.map((a) => ({
        question: a.question.content,
        answer: a.answer.text,
        order: a.question.order,
      })),
      aiInsight: testSession.aiInsights[0]
        ? (() => {
            const ai = testSession.aiInsights[0];
            let extra: Record<string, unknown> = {};
            try { extra = JSON.parse(ai.fullResponse); } catch { /* ignore */ }
            return {
              summary: String(ai.summary || ""),
              personalityProfile: typeof extra.personalityProfile === "string" ? extra.personalityProfile : null,
              numerologyInsight: typeof extra.numerologyInsight === "string" ? extra.numerologyInsight : null,
              strengths: Array.isArray(ai.strengths) ? (ai.strengths as string[]) : [],
              improvements: Array.isArray(ai.improvements) ? (ai.improvements as string[]) : [],
              suitableRoles: Array.isArray(ai.suitableRoles) ? (ai.suitableRoles as string[]) : [],
              developmentPlan: Array.isArray(extra.developmentPlan) ? (extra.developmentPlan as string[]) : null,
              recommendation: String(ai.recommendation || ""),
            };
          })()
        : null,
    },
  });
}
