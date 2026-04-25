// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes
  if (pathname.startsWith("/auth")) return NextResponse.next();

  // Not logged in
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const role = session.user.role;

  // Role-based routing guards
  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (pathname.startsWith("/dashboard/mahasiswa") && role !== "MAHASISWA") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (pathname.startsWith("/dashboard/pelapor") && role !== "PELAPOR") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
