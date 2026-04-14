import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 ngày
  },

  pages: {
    signIn: "/dang-nhap",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return false;

      try {
        // Tìm user theo googleId trước (handle email change), fallback theo email
        const existingByGoogleId = account.providerAccountId
          ? await prisma.user.findUnique({ where: { googleId: account.providerAccountId } })
          : null;

        const existingByEmail = existingByGoogleId
          ? null
          : await prisma.user.findUnique({ where: { email: user.email } });

        const existing = existingByGoogleId || existingByEmail;

        if (existing) {
          // User bị disable → chặn đăng nhập ngay
          if (!existing.active) return false;

          // Update thông tin mới nhất từ Google
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              name: user.name || existing.name,
              email: user.email, // cập nhật email mới nếu thay đổi trên Google
              avatarUrl: user.image || null,
              googleId: account.providerAccountId,
            },
          });
        } else {
          // Tạo user mới
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "User",
              avatarUrl: user.image || null,
              googleId: account.providerAccountId,
              role: "CANDIDATE",
            },
          });
        }
      } catch (err) {
        // Handle unique constraint race condition
        const prismaError = err as { code?: string };
        if (prismaError.code === "P2002") {
          // Concurrent signup — user đã được tạo bởi request khác, cho phép đăng nhập
          return true;
        }
        console.error("SignIn error:", err);
        return false;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // Lần đầu đăng nhập: lấy user từ DB
      if (account && user?.email) {
        // Tìm theo googleId trước, fallback email
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: account.providerAccountId },
              { email: user.email },
            ],
          },
          select: { id: true, role: true, active: true, name: true },
        });
        if (dbUser && dbUser.active) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.disabled = false;
          token.lastChecked = Date.now();
        }
      }

      // Sync role/active từ DB mỗi 1 phút
      const now = Date.now();
      const lastChecked = (token.lastChecked as number) || 0;
      if (token.id && now - lastChecked > 1 * 60 * 1000) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, active: true, name: true },
        });
        if (!dbUser || !dbUser.active) {
          // Xóa sạch token data → middleware sẽ coi như chưa đăng nhập
          token.id = undefined;
          token.role = undefined;
          token.name = undefined;
          token.disabled = true;
          return token;
        }
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.disabled = false;
        token.lastChecked = now;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.id && !token.disabled) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "ADMIN" | "HR" | "CANDIDATE") ?? "CANDIDATE";
      }
      return session;
    },
  },
};
