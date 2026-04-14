"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function sanitizeCallbackUrl(url: string | null): string {
  if (!url) return "/test";
  // Chỉ chấp nhận relative path, chặn open redirect
  if (!url.startsWith("/") || url.startsWith("//")) return "/test";
  return url;
}

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked: "Email này đã được sử dụng với phương thức đăng nhập khác.",
    AccessDenied: "Tài khoản của bạn đã bị vô hiệu hóa hoặc không có email hợp lệ.",
    OAuthCallback: "Không thể kết nối với Google. Vui lòng thử lại.",
    Configuration: "Lỗi cấu hình hệ thống. Vui lòng liên hệ quản trị viên.",
  };

  function handleSignIn() {
    if (isLoading) return;
    setIsLoading(true);
    signIn("google", { callbackUrl });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-logo text-2xl font-black tracking-wider gradient-text">
              WE INSIGHT
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Đăng nhập</h1>
          <p className="text-sm text-slate-400">
            Đăng nhập để bắt đầu đánh giá năng lực
          </p>
        </div>

        <div className="glass p-8">
          {error && (
            <div className="mb-5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {errorMessages[error] || "Đã có lỗi xảy ra. Vui lòng thử lại."}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              isLoading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-white text-[#1E293B] hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-lg"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                Đang chuyển hướng...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Đăng nhập với Google
              </>
            )}
          </button>

          <p className="mt-5 text-center text-xs text-slate-500">
            Tài khoản sẽ được tạo tự động khi đăng nhập lần đầu
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Đang tải...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
