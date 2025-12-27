import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
