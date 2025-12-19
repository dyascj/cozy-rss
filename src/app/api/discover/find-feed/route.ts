import { NextRequest, NextResponse } from "next/server";

const USER_AGENT = "Mozilla/5.0 (compatible; RSSReader/1.0; +https://github.com/)";

// Common RSS feed paths to check
const COMMON_FEED_PATHS = [
  "/feed",
  "/feed/",
  "/rss",
  "/rss.xml",
  "/feed.xml",
  "/atom.xml",
  "/index.xml",
  "/feed/rss",
  "/feed/atom",
  "/rss/index.xml",
  "/blog/feed",
  "/blog/rss",
  "/.rss",
];

interface DiscoveredFeed {
  url: string;
  type: "rss" | "atom" | "json";
  title?: string;
}

/**
 * Check if a URL returns a valid feed
 */
async function checkFeedUrl(url: string): Promise<DiscoveredFeed | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    // Check if it's RSS/Atom
    if (
      contentType.includes("xml") ||
      contentType.includes("rss") ||
      contentType.includes("atom") ||
      text.includes("<rss") ||
      text.includes("<feed") ||
      text.includes("<channel>")
    ) {
      const type = text.includes("<feed") ? "atom" : "rss";

      // Try to extract title
      let title: string | undefined;
      const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/);
      if (titleMatch) {
        title = titleMatch[1].replace(/^<!\[CDATA\[|\]\]>$/g, "").trim();
      }

      return { url, type, title };
    }

    // Check if it's JSON Feed
    if (contentType.includes("json") || text.trim().startsWith("{")) {
      try {
        const json = JSON.parse(text);
        if (json.version && json.version.startsWith("https://jsonfeed.org")) {
          return { url, type: "json", title: json.title };
        }
      } catch {
        // Not valid JSON
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Parse HTML to find feed links
 */
function extractFeedLinksFromHtml(html: string, baseUrl: string): string[] {
  const feedUrls: string[] = [];

  // Look for link tags with RSS/Atom types
  const linkRegex = /<link[^>]*rel=["']alternate["'][^>]*>/gi;
  const matches = html.match(linkRegex) || [];

  for (const match of matches) {
    const typeMatch = match.match(/type=["']([^"']+)["']/i);
    const hrefMatch = match.match(/href=["']([^"']+)["']/i);

    if (typeMatch && hrefMatch) {
      const type = typeMatch[1].toLowerCase();
      if (
        type.includes("rss") ||
        type.includes("atom") ||
        type.includes("feed") ||
        type === "application/xml" ||
        type === "text/xml"
      ) {
        let feedUrl = hrefMatch[1];

        // Handle relative URLs
        if (feedUrl.startsWith("/")) {
          const base = new URL(baseUrl);
          feedUrl = `${base.protocol}//${base.host}${feedUrl}`;
        } else if (!feedUrl.startsWith("http")) {
          feedUrl = new URL(feedUrl, baseUrl).href;
        }

        feedUrls.push(feedUrl);
      }
    }
  }

  return feedUrls;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter required" },
      { status: 400 }
    );
  }

  try {
    // Validate URL
    let siteUrl: URL;
    try {
      siteUrl = new URL(url);
      if (!["http:", "https:"].includes(siteUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const baseUrl = `${siteUrl.protocol}//${siteUrl.host}`;
    const discoveredFeeds: DiscoveredFeed[] = [];

    // First, check if the URL itself is a feed
    const directFeed = await checkFeedUrl(url);
    if (directFeed) {
      return NextResponse.json({
        success: true,
        feeds: [directFeed],
        method: "direct",
      });
    }

    // Fetch the HTML page and look for feed links
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const html = await response.text();
        const feedLinks = extractFeedLinksFromHtml(html, baseUrl);

        // Check each discovered feed link
        for (const feedUrl of feedLinks.slice(0, 5)) {
          const feed = await checkFeedUrl(feedUrl);
          if (feed) {
            discoveredFeeds.push(feed);
          }
        }
      }
    } catch {
      // Continue to try common paths
    }

    // If no feeds found via HTML, try common paths
    if (discoveredFeeds.length === 0) {
      for (const path of COMMON_FEED_PATHS) {
        const feedUrl = `${baseUrl}${path}`;
        const feed = await checkFeedUrl(feedUrl);
        if (feed) {
          discoveredFeeds.push(feed);
          break; // Found one, stop looking
        }
      }
    }

    if (discoveredFeeds.length > 0) {
      return NextResponse.json({
        success: true,
        feeds: discoveredFeeds,
        method: discoveredFeeds.length > 0 ? "discovered" : "common_paths",
      });
    }

    return NextResponse.json({
      success: false,
      error: "No RSS feed found",
      suggestion: "This site may not have a public RSS feed. Try looking for an RSS icon on the site, or check if they offer email subscriptions.",
    });
  } catch (error) {
    console.error("Feed discovery error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to discover feed",
      },
      { status: 500 }
    );
  }
}
