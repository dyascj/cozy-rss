import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/landing",
  "/signin",
  "/signup",
  "/onboarding",
];

// Routes that should redirect to app if authenticated
const authRoutes = ["/landing", "/signin", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;

  // Skip middleware for static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Skip middleware for API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If has session and trying to access auth routes, redirect to app
  // Note: we trust the cookie exists; actual validation happens server-side
  if (sessionCookie && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check for session cookie
  if (!sessionCookie) {
    // No session, redirect to landing
    return NextResponse.redirect(new URL("/landing", request.url));
  }

  // Has session cookie, allow access
  // Actual session validation happens in API routes/pages
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
