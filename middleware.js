import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function middleware(request) {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.split(" ")[1];

  const { pathname } = request.nextUrl;

  // Redirect to dashboard if already logged in and trying to access login/register
  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard and api routes (except auth)
  if (
    pathname.startsWith("/dashboard") ||
    (pathname.startsWith("/api") &&
      !pathname.startsWith("/api/auth") &&
      !pathname.startsWith("/api/health"))
  ) {
    if (!token) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Optional: Verify token (Edge compatible if using a light library, otherwise just check existence)
    // For now, existence is the first line of defense.
    // Full verification happens in API routes using the shared lib/auth.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/api/:path*"],
};
