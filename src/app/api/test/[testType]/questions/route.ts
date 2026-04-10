import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const validTestTypes = ["DISC", "LOGIC", "SITUATION"];

export async function GET(
  _req: Request,
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

  const questions = await prisma.question.findMany({
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

  if (questions.length === 0) {
    return NextResponse.json(
      { success: false, error: "Bài test này chưa sẵn sàng" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: questions });
}
