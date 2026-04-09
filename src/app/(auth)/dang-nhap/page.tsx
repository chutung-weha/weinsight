"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/layout/Logo";
import { loginSchema } from "@/lib/validations/auth";

function sanitizeCallbackUrl(callbackUrl: string | null) {
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/";
  }

  return callbackUrl;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Email hoặc mật khẩu không đúng");
        setLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setServerError("Đã có lỗi xảy ra. Vui lòng thử lại.");
      setLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-500/40 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.08)] transition-all";

  return (
    <div className="glass w-full max-w-md p-8 sm:p-10 relative">
      <div className="flex justify-center mb-8">
        <Logo />
      </div>
      <h1 className="text-xl font-bold text-center mb-1">Đăng nhập</h1>
      <p className="text-sm text-slate-500 text-center mb-8">Đăng nhập để làm bài test và xem kết quả AI Insight</p>

      {serverError && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {serverError}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
          <input
            type="email"
            placeholder="email@wehagroup.vn"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Mật khẩu</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-bg text-[#0B1120] font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <p className="text-xs text-slate-500 text-center mt-6">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="text-cyan-400 font-medium hover:text-cyan-300">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="bg-orb w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent)] -top-24 -left-24 absolute" />
      <div className="bg-orb w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(124,58,237,0.08),transparent)] -bottom-16 -right-16 absolute" />
      <Suspense fallback={<div className="text-slate-400">Đang tải...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
