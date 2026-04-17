function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      "Check your .env/.env.local or hosting platform settings."
    );
  }
  return value;
}

const nextAuthUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Warn at build time, throw at runtime in production
if (process.env.NODE_ENV === "production" && nextAuthUrl.includes("localhost")) {
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  const msg =
    "NEXTAUTH_URL is set to localhost in production. " +
    "Set NEXTAUTH_URL to your production domain (e.g., https://insight.wehavn.vn).";
  if (isBuildPhase) {
    console.warn(`⚠️  ${msg}`);
  } else {
    throw new Error(msg);
  }
}

// DATABASE_URL + NEXTAUTH_SECRET là bắt buộc — không thể chạy app nếu thiếu.
// Google OAuth là optional tại module load — nếu thiếu, auth provider
// sẽ không được kích hoạt (user không đăng nhập được), nhưng các route
// khác vẫn chạy. Điều này giúp build + deploy không fail chỉ vì thiếu
// OAuth credentials (ví dụ preview env, staging chưa cấu hình xong).
export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  NEXTAUTH_SECRET: requireEnv("NEXTAUTH_SECRET"),
  // Optional — auth sẽ disable nếu thiếu
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  NEXTAUTH_URL: nextAuthUrl,
} as const;
