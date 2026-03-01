import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import * as feedRepo from "@/lib/db/repositories/feedRepository";
import { fetchAndStoreArticles } from "@/lib/feed-fetcher";

/**
 * POST /api/feeds/refresh
 * Server-side refresh of all feeds — fetches and stores new articles
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feeds = await feedRepo.getFeedsByUser(user.id);
    const results: Record<string, number> = {};

    for (const feed of feeds) {
      try {
        const count = await fetchAndStoreArticles(feed.id, feed.url);
        results[feed.id] = count;
        await feedRepo.updateFeed(feed.id, user.id, {
          lastFetched: new Date().toISOString(),
          lastError: null,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error(`Failed to refresh feed ${feed.title}:`, msg);
        await feedRepo.updateFeed(feed.id, user.id, { lastError: msg });
        results[feed.id] = 0;
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error refreshing feeds:", error);
    return NextResponse.json(
      { error: "Failed to refresh feeds" },
      { status: 500 }
    );
  }
}
