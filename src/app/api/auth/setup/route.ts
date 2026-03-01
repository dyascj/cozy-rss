import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth/session";
import { count } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const [{ total }] = db.select({ total: count() }).from(users).all();
    if (total > 0) {
      return NextResponse.json(
        { error: "Setup already completed" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = db
      .insert(users)
      .values({
        username: username.trim(),
        passwordHash,
        isAdmin: true,
      })
      .returning()
      .get();

    const token = await createSessionToken(user.id, user.username);

    const response = NextResponse.json({ success: true, user: { id: user.id, username: user.username } });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: request.headers.get("x-forwarded-proto") === "https",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const [{ total }] = db.select({ total: count() }).from(users).all();
  return NextResponse.json({ needsSetup: total === 0 });
}
