import type { DefaultSession } from "next-auth";

type UserRole = "ADMIN" | "HR" | "CANDIDATE";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    lastChecked?: number;
  }
}
