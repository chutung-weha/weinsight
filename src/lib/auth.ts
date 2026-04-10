import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Dummy hash để constant-time compare khi user không tồn tại (chống timing attack)
const DUMMY_HASH = "$2a$12$000000000000000000000uGJBEjz0dQ7S2VCh3FY.1C0YM0HxHHi";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Luôn chạy bcrypt compare để giữ constant time — chống timing attack
        const isValid = await compare(
          credentials.password,
          user?.passwordHash || DUMMY_HASH
        );

        if (!user || !isValid) {
          throw new Error("Email hoặc mật khẩu không đúng");
        }

        if (!user.active) {
          throw new Error("Tài khoản đã bị vô hiệu hóa");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
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
    async jwt({ token, user }) {
      // Lần đầu đăng nhập: attach user info vào token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Sync role/active từ DB mỗi 5 phút
      const now = Date.now();
      const lastChecked = (token.lastChecked as number) || 0;
      if (now - lastChecked > 1 * 60 * 1000) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, active: true, name: true },
        });
        if (!dbUser || !dbUser.active) {
          // User bị vô hiệu hóa → invalidate token
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
