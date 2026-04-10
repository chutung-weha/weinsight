"use client";

import Link from "next/link";

export default function ResultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass p-10 text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Lỗi kết quả</h2>
        <p className="text-sm text-slate-400 mb-6">
          {error.message || "Không thể tải kết quả. Vui lòng thử lại."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="gradient-bg text-[#0B1120] px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5 transition-all"
          >
            Thử lại
          </button>
          <Link href="/test" className="btn-ghost px-6 py-2.5 text-sm">
            Làm bài test khác
          </Link>
        </div>
      </div>
    </div>
  );
}
