import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInsight } from "@/lib/ai/generate-insight";
import { checkRateLimit } from "@/lib/rate-limit";

// GET — Fetch existing insight cho session
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const authSession = await getServerSession(authOptions);
  if (!authSession?.user) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { sessionId } = await params;

  const insight = await prisma.aIInsight.findFirst({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    include: {
      session: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!insight) {
    return NextResponse.json({ success: false, error: "Chưa có AI Insight" }, { status: 404 });
  }

  const isOwner = insight.session.userId === authSession.user.id;
  const isAdmin = authSession.user.role === "ADMIN" || authSession.user.role === "HR";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: insight.id,
      sessionId: insight.sessionId,
      summary: insight.summary,
      strengths: insight.strengths,
      improvements: insight.improvements,
      suitableRoles: insight.suitableRoles,
      recommendation: insight.recommendation,
      tone: insight.tone,
      objective: insight.objective,
      createdAt: insight.createdAt,
    },
  });
}

// POST — Generate new insight cho session
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const authSession = await getServerSession(authOptions);
  if (!authSession?.user) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { sessionId } = await params;

  // Rate limit: 5 requests per user per minute
  const rl = checkRateLimit(`insight:${authSession.user.id}`, { windowMs: 60_000, maxRequests: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil(rl.retryAfterMs / 1000)} giây.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  // Verify session exists và user có quyền
  const testSession = await prisma.testSession.findUnique({
    where: { id: sessionId },
  });

  if (!testSession) {
    return NextResponse.json({ success: false, error: "Không tìm thấy phiên test" }, { status: 404 });
  }

  const isOwner = testSession.userId === authSession.user.id;
  const isAdmin = authSession.user.role === "ADMIN" || authSession.user.role === "HR";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 403 });
  }

  if (testSession.status !== "COMPLETED") {
    return NextResponse.json({ success: false, error: "Phiên test chưa hoàn thành" }, { status: 400 });
  }

  try {
    const { insight: result, config } = await generateInsight({ sessionId });

    // Lưu vào DB
    const insight = await prisma.aIInsight.create({
      data: {
        sessionId,
        summary: result.summary,
        strengths: result.strengths,
        improvements: result.improvements,
        suitableRoles: result.suitableRoles,
        recommendation: result.recommendation,
        fullResponse: JSON.stringify(result),
        tone: config?.tone || "COACH",
        objective: config?.objective || "EVALUATION",
      },
    });

    return NextResponse.json({ success: true, data: insight });
  } catch (error) {
    console.error("Insight generation error:", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo AI Insight. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
