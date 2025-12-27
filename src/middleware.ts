import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Public routes that don't require authentication
const publicRoutes = [
  "/landing",
  "/signin",
  "/signup",
  "/onboarding",
  "/privacy",
  "/terms",
  "/auth/callback",
];

// Routes that should redirect to app if authenticated
const authRoutes = ["/landing", "/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // Update Supabase session and get user
  const { user, supabaseResponse } = await updateSession(request);

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If authenticated and trying to access auth routes, redirect to app
  if (user && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If public route, allow access
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // For protected routes, check for authenticated user
  if (!user) {
    // No session, redirect to landing
    return NextResponse.redirect(new URL("/landing", request.url));
  }

  // Authenticated, allow access
  return supabaseResponse;
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
