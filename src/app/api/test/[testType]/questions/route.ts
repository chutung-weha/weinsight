import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const validTestTypes = ["DISC", "LOGIC", "SITUATION"];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ testType: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Chưa đăng nhập" },
      { status: 401 }
    );
  }

  const { testType } = await params;
  const type = testType.toUpperCase();

  if (!validTestTypes.includes(type)) {
    return NextResponse.json(
      { success: false, error: "Loại test không hợp lệ" },
      { status: 400 }
    );
  }

  // Nếu có sessionId query param → trả về đúng câu hỏi được chọn cho session đó
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  let questionIds: string[] | null = null;
  if (sessionId) {
    const testSession = await prisma.testSession.findUnique({
      where: { id: sessionId },
      select: {
        userId: true,
        testType: true,
        selectedQuestionIds: true,
      },
    });
    // Xác minh session thuộc user đang đăng nhập và đúng testType
    if (
      testSession &&
      testSession.userId === session.user.id &&
      testSession.testType === type
    ) {
      const stored = testSession.selectedQuestionIds as string[] | null;
      if (stored && stored.length > 0) {
        questionIds = stored;
      }
    }
  }

  let questions;
  if (questionIds) {
    // Trả về đúng 20 câu đã chọn cho session, giữ nguyên thứ tự random
    const rows = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        active: true,
      },
      select: {
        id: true,
        content: true,
        order: true,
        answers: {
          orderBy: { order: "asc" },
          select: { id: true, text: true, order: true },
        },
      },
    });
    // Sắp xếp theo thứ tự questionIds (thứ tự random đã lưu)
    const idxMap = new Map(questionIds.map((id, i) => [id, i]));
    questions = rows.sort((a, b) => (idxMap.get(a.id) ?? 0) - (idxMap.get(b.id) ?? 0));
  } else {
    questions = await prisma.question.findMany({
      where: {
        testType: type as "DISC" | "LOGIC" | "SITUATION",
        active: true,
      },
      select: {
        id: true,
        content: true,
        order: true,
        answers: {
          orderBy: { order: "asc" },
          select: { id: true, text: true, order: true },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  if (questions.length === 0) {
    return NextResponse.json(
      { success: false, error: "Bài test này chưa sẵn sàng" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: questions });
}
