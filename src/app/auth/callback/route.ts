import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this is a new user who needs onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user has any feeds (indicates they've completed onboarding)
        const { count } = await supabase
          .from("feeds")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // New user with no feeds - redirect to onboarding
        if (count === 0) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error - redirect to signin with error message
  return NextResponse.redirect(`${origin}/signin?error=auth_callback_error`);
}
