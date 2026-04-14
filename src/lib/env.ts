/**
 * Runtime validation cho environment variables bắt buộc.
 * Import file này ở đầu auth.ts hoặc layout.tsx để fail-fast khi thiếu config.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Check your .env file or hosting platform's environment settings.`
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
    "Set NEXTAUTH_URL to your production domain (e.g., https://weinsight.vercel.app).";
  if (isBuildPhase) {
    console.warn(`⚠️  ${msg}`);
  } else {
    throw new Error(msg);
  }
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  NEXTAUTH_SECRET: requireEnv("NEXTAUTH_SECRET"),
  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
  // Optional
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  NEXTAUTH_URL: nextAuthUrl,
} as const;
