import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authRoutes = ["/dang-nhap"];
const protectedRoutes = ["/test", "/result", "/ho-so", "/history", "/than-so-hoc"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // User bị disable hoặc chưa đăng nhập: token.id sẽ là undefined
  const isAuthenticated = !!token?.id && !token?.disabled;

  // Đã đăng nhập → redirect khỏi trang auth
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Giữ full URL (pathname + query string) cho callbackUrl
  const fullPath = pathname + req.nextUrl.search;

  // Chưa đăng nhập → redirect tới login
  if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL("/dang-nhap", req.url);
    loginUrl.searchParams.set("callbackUrl", fullPath);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes: cần authenticated + role phù hợp
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/dang-nhap", req.url);
      loginUrl.searchParams.set("callbackUrl", fullPath);
      return NextResponse.redirect(loginUrl);
    }

    if (token?.role !== "ADMIN" && token?.role !== "HR") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/test/:path*",
    "/result/:path*",
    "/ho-so/:path*",
    "/history/:path*",
    "/than-so-hoc",
    "/admin/:path*",
    "/dang-nhap",
    "/dang-ky",
  ],
};
