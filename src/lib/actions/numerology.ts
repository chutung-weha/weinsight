"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { numerologyInputSchema, type NumerologyFormInput } from "@/lib/validations/numerology";
import { calculateAll } from "@/lib/numerology";

export async function saveNumerologyResult(data: NumerologyFormInput) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Chưa đăng nhập" };

  const parsed = numerologyInputSchema.safeParse(data);
  if (!parsed.success) return { success: false as const, error: "Dữ liệu không hợp lệ" };

  const { fullName, day, month, year } = parsed.data;

  // Tính toán server-side (defense in depth)
  const result = calculateAll(fullName, day, month, year);
  const dob = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Check duplicate: cùng user + tên + ngày sinh trong 1 phút → trả session cũ
  const recent = await prisma.testSession.findFirst({
    where: {
      userId: user.id,
      testType: "NUMEROLOGY",
      candidateName: fullName,
      dateOfBirth: dob,
      completedAt: { gte: new Date(Date.now() - 60_000) },
    },
    orderBy: { completedAt: "desc" },
  });

  if (recent) {
    return { success: true as const, sessionId: recent.id };
  }

  const session = await prisma.testSession.create({
    data: {
      userId: user.id,
      testType: "NUMEROLOGY",
      status: "COMPLETED",
      completedAt: new Date(),
      candidateName: fullName,
      dateOfBirth: dob,
      totalScores: { ...result },
    },
  });

  return {
    success: true as const,
    sessionId: session.id,
  };
}
