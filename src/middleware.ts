import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/wallet",
  "/buy-rc",
  "/explore",
  "/friends",
  "/leaderboard",
  "/profile",
  "/settings",
  "/notifications",
  "/rich-store",
  "/admin",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!isProtected) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !token.isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/wallet/:path*",
    "/buy-rc/:path*",
    "/explore/:path*",
    "/friends/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/rich-store/:path*",
    "/admin/:path*",
  ],
};
