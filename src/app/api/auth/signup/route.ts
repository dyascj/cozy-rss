import { NextRequest, NextResponse } from "next/server";
import { hashPassword, validatePassword, validateUsername } from "@/lib/auth/password";
import { createUser, createSession, usernameExists } from "@/lib/auth/session";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameError = validateUsername(username);
    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Check if username already exists
    if (usernameExists(username)) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = createUser(username, passwordHash);

    // Create session
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");
    const session = createSession(user.id, ipAddress || undefined, userAgent || undefined);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("session", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(session.expiresAt),
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
