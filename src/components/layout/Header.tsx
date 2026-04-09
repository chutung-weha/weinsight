"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "./Logo";

const navItems = [
  { href: "#features", label: "Tính năng" },
  { href: "#how", label: "Cách hoạt động" },
  { href: "#ai-insight", label: "AI Insight" },
  { href: "#about", label: "Về chúng tôi" },
];

function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "HR";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/10 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-xs font-bold text-[#0B1120]">
          {session?.user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="text-sm text-slate-300 max-w-[120px] truncate hidden sm:block">
          {session?.user?.name}
        </span>
        <svg className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border border-white/10 py-1.5 shadow-xl z-50">
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <div className="text-sm font-semibold text-slate-200 truncate">{session?.user?.name}</div>
            <div className="text-xs text-slate-500 truncate">{session?.user?.email}</div>
          </div>

          <Link
            href="/test"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
          >
            Làm bài test
          </Link>

          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors border-t border-white/10 mt-1"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0B1120]/80 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-[1128px] mx-auto px-6">
        <div className="flex items-center justify-between h-[60px]">
          <Logo />

          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-400 font-medium hover:text-cyan-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {status === "loading" && (
              <div className="w-24 h-9 rounded-full bg-white/5 animate-pulse" />
            )}
            {status === "authenticated" && <UserMenu />}
            {status === "unauthenticated" && (
              <>
                <Link href="/dang-nhap" className="btn-ghost">
                  Đăng nhập
                </Link>
                <Link href="/test" className="btn-glow gradient-bg">
                  Bắt đầu ngay
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-slate-400"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm text-slate-400 py-2"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-3 border-t border-white/10">
              {status === "authenticated" ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-ghost text-sm"
                >
                  Đăng xuất
                </button>
              ) : (
                <>
                  <Link href="/dang-nhap" className="btn-ghost text-sm">Đăng nhập</Link>
                  <Link href="/test" className="btn-glow gradient-bg text-sm">Bắt đầu ngay</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
