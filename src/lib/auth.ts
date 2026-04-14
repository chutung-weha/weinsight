import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

      // Upsert user: tạo mới nếu chưa có, update name/avatar nếu đã có
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name || "User",
          avatarUrl: user.image || null,
          googleId: account.providerAccountId,
        },
        create: {
          email: user.email,
          name: user.name || "User",
          avatarUrl: user.image || null,
          googleId: account.providerAccountId,
          role: "CANDIDATE",
        },
      });

      return true;
    },

    async jwt({ token, user, account }) {
      // Lần đầu đăng nhập: lấy user từ DB
      if (account && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true, active: true, name: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.name = dbUser.name;
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
          token.id = undefined;
          return token;
        }
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.lastChecked = now;
      }

      return token;
    },

    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
