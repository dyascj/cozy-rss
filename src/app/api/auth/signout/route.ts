import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    // Delete session from database if it exists
    if (sessionId) {
      deleteSession(sessionId);
    }

    // Clear session cookie
    cookieStore.delete("session");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { error: "An error occurred during signout" },
      { status: 500 }
    );
  }
}
