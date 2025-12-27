import { NextRequest, NextResponse } from "next/server";
import { DiscoverCategory, DiscoverFeed } from "@/types/discover";
import { getCuratedFeedsForCategory } from "@/lib/discover/curatedFeeds";
import { getRSSHubFeedsForCategory } from "@/lib/discover/rsshub";
import { getCurrentUser } from "@/lib/auth/getUser";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = request.nextUrl.searchParams.get("category") as DiscoverCategory | null;
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");

  if (!category) {
    return NextResponse.json(
      { error: "Category parameter required" },
      { status: 400 }
    );
  }

  const validCategories: DiscoverCategory[] = [
    "tech-programming",
    "ai-ml",
    "youtube",
    "social-media",
    "design-creative",
    "gaming",
    "entertainment-media",
    "news-current-events",
    "podcasts-newsletters",
    "indie-blogs",
    "lifestyle-other",
  ];

  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 }
    );
  }

  try {
    // Combine curated feeds and RSSHub routes
    const curatedFeeds = getCuratedFeedsForCategory(category);
    const rsshubFeeds = getRSSHubFeedsForCategory(category);

    // Merge and sort by popularity
    const allFeeds: DiscoverFeed[] = [...curatedFeeds, ...rsshubFeeds].sort(
      (a, b) => (b.popularity || 0) - (a.popularity || 0)
    );

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFeeds = allFeeds.slice(startIndex, endIndex);

    return NextResponse.json({
      feeds: paginatedFeeds,
      total: allFeeds.length,
      page,
      hasMore: endIndex < allFeeds.length,
    });
  } catch (error) {
    console.error("Error fetching discover feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}
