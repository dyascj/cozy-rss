import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import { validateUrlForSSRF } from "@/lib/security/ssrf";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feedUrl = request.nextUrl.searchParams.get("url");

  if (!feedUrl) {
    return NextResponse.json(
      { error: "URL parameter required" },
      { status: 400 }
    );
  }

  // Validate URL for SSRF
  const ssrfError = validateUrlForSSRF(feedUrl);
  if (ssrfError) {
    return NextResponse.json({ error: ssrfError }, { status: 400 });
  }

  try {
    const url = new URL(feedUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      return NextResponse.json(
        { error: "Invalid URL protocol" },
        { status: 400 }
      );
    }

    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RSSReader/1.0; +https://github.com/)",
        Accept:
          "application/rss+xml, application/atom+xml, application/json, application/feed+json, text/xml, application/xml, */*",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Feed returned ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    // Detect if it's JSON Feed
    const isJsonFeed =
      contentType.includes("application/json") ||
      contentType.includes("application/feed+json") ||
      (text.trim().startsWith("{") && text.includes('"version"'));

    if (isJsonFeed) {
      try {
        const jsonFeed = JSON.parse(text);
        return NextResponse.json({ type: "jsonfeed", data: jsonFeed });
      } catch {
        // Not valid JSON, try as XML
      }
    }

    // Return raw XML for client-side parsing
    return NextResponse.json({ type: "xml", data: text });
  } catch (error) {
    console.error("Feed fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
