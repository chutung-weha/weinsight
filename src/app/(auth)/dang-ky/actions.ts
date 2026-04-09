"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

export async function registerUser(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: "Dữ liệu không hợp lệ" };
  }

  const { name, email, department, password } = parsed.data;

  const passwordHash = await hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        department,
        passwordHash,
      },
    });
  } catch (error: unknown) {
    // Prisma unique constraint violation (P2002) = email đã tồn tại
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { success: false as const, error: "Email này đã được đăng ký" };
    }
    throw error;
  }

  return { success: true as const };
}
