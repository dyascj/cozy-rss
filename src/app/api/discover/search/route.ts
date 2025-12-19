import { NextRequest, NextResponse } from "next/server";
import { DiscoverFeed, DiscoverSearchResponse } from "@/types/discover";
import { searchCuratedFeeds, getAllCuratedFeeds } from "@/lib/discover/curatedFeeds";
import { RSSHUB_ROUTES, rsshubRoutesToFeeds } from "@/lib/discover/rsshub";
import { DiscoverCategory } from "@/types/discover";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const category = request.nextUrl.searchParams.get("category") as DiscoverCategory | null;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  try {
    const lowerQuery = query.toLowerCase();
    let results: DiscoverFeed[] = [];

    // Search curated feeds
    const curatedResults = searchCuratedFeeds(query);
    results.push(...curatedResults);

    // Search RSSHub routes
    const categories: DiscoverCategory[] = category
      ? [category]
      : ["tech-programming", "youtube", "social-media", "entertainment-media", "news-current-events", "lifestyle-other"];

    for (const cat of categories) {
      const routes = RSSHUB_ROUTES[cat] || [];
      const matchingRoutes = routes.filter(
        (route) =>
          route.name.toLowerCase().includes(lowerQuery) ||
          route.description?.toLowerCase().includes(lowerQuery)
      );

      if (matchingRoutes.length > 0) {
        const rsshubFeeds = rsshubRoutesToFeeds(matchingRoutes, cat);
        results.push(...rsshubFeeds);
      }
    }

    // Filter by category if specified
    if (category) {
      results = results.filter((feed) => feed.category === category);
    }

    // Remove duplicates by feedUrl
    const seen = new Set<string>();
    results = results.filter((feed) => {
      if (seen.has(feed.feedUrl)) return false;
      seen.add(feed.feedUrl);
      return true;
    });

    // Sort by popularity and limit
    results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    results = results.slice(0, limit);

    const response: DiscoverSearchResponse = {
      results,
      query,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
