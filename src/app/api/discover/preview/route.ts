import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import { PreviewArticle, FeedPreviewResponse } from "@/types/discover";
import { getCurrentUser } from "@/lib/auth/getUser";
import { validateUrlForSSRF } from "@/lib/security/ssrf";

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i;

function isImageUrl(url: string, type?: string): boolean {
  if (type && String(type).startsWith("image")) return true;
  return IMAGE_EXTENSIONS.test(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageUrl(item: any): string | undefined {
  // Try media:thumbnail first (most reliable for thumbnails)
  if (item.mediaThumbnail) {
    const thumbs = Array.isArray(item.mediaThumbnail) ? item.mediaThumbnail : [item.mediaThumbnail];
    for (const thumb of thumbs) {
      if (thumb && typeof thumb === "object") {
        const attrs = thumb.$ || thumb;
        if (attrs.url) {
          return String(attrs.url);
        }
      }
      if (typeof thumb === "string") {
        return thumb;
      }
    }
  }

  // Try media:content
  if (item.mediaContent) {
    const mediaItems = Array.isArray(item.mediaContent) ? item.mediaContent : [item.mediaContent];
    for (const m of mediaItems) {
      if (m && typeof m === "object") {
        const attrs = m.$ || m;
        const url = attrs.url;
        const medium = attrs.medium || attrs.type || "";
        // Accept if it's marked as image, or if URL looks like an image
        if (url && (medium === "image" || isImageUrl(String(url), medium))) {
          return String(url);
        }
      }
    }
  }

  // Try media:group (contains media:content or media:thumbnail)
  if (item.mediaGroup) {
    const group = item.mediaGroup;
    // Check for nested media:thumbnail
    if (group["media:thumbnail"]) {
      const thumbs = Array.isArray(group["media:thumbnail"]) ? group["media:thumbnail"] : [group["media:thumbnail"]];
      for (const thumb of thumbs) {
        const attrs = thumb?.$ || thumb;
        if (attrs?.url) return String(attrs.url);
      }
    }
    // Check for nested media:content
    if (group["media:content"]) {
      const contents = Array.isArray(group["media:content"]) ? group["media:content"] : [group["media:content"]];
      for (const content of contents) {
        const attrs = content?.$ || content;
        if (attrs?.url && isImageUrl(String(attrs.url), attrs.medium || attrs.type)) {
          return String(attrs.url);
        }
      }
    }
  }

  // Try itunes:image (podcasts)
  if (item.itunesImage) {
    const img = item.itunesImage;
    if (typeof img === "string") return img;
    if (img?.$ && img.$.href) return String(img.$.href);
    if (img?.href) return String(img.href);
  }

  // Try direct image element
  if (item.image) {
    if (typeof item.image === "string") return item.image;
    if (item.image.url) return String(item.image.url);
    if (item.image.$ && item.image.$.url) return String(item.image.$.url);
  }

  // Try enclosure
  if (item.enclosure) {
    const enc = item.enclosure;
    const url = enc.url || (enc.$ && enc.$.url);
    const type = enc.type || (enc.$ && enc.$.type) || "";
    if (url && isImageUrl(String(url), type)) {
      return String(url);
    }
  }

  // Extract from content:encoded or content
  const contentEncoded = item.contentEncoded || "";
  const contentField = typeof item.content === "string" ? item.content : "";
  const summary = item.summary || "";
  const description = item.description || "";
  const content = contentEncoded || contentField || summary || description;

  if (content) {
    // Try to find img tag with src
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      // Skip tiny tracking pixels and icons
      const srcsetMatch = content.match(/<img[^>]+srcset=["']([^"']+)["']/i);
      if (srcsetMatch) {
        // Get the largest image from srcset
        const srcset = srcsetMatch[1];
        const sources = srcset.split(",").map((s: string) => s.trim().split(/\s+/));
        const largest = sources.reduce((best: string[], current: string[]) => {
          const width = parseInt(current[1] || "0");
          const bestWidth = parseInt(best[1] || "0");
          return width > bestWidth ? current : best;
        }, sources[0]);
        if (largest && largest[0]) return largest[0];
      }
      return imgMatch[1];
    }
  }

  return undefined;
}

function extractYouTubeVideoId(link: string): string | undefined {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = link.match(pattern);
    if (match) return match[1];
  }

  return undefined;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const rssParser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["media:group", "mediaGroup"],
      ["enclosure", "enclosure"],
      ["itunes:image", "itunesImage"],
      ["image", "image"],
    ],
  },
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feedUrl = request.nextUrl.searchParams.get("url");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "5");

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
    // Validate URL
    const url = new URL(feedUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      return NextResponse.json(
        { error: "Invalid URL protocol" },
        { status: 400 }
      );
    }

    // Fetch the feed
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "RSS Reader/1.0",
        Accept:
          "application/rss+xml, application/atom+xml, application/json, application/feed+json, text/xml, application/xml, */*",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Feed returned ${response.status}` },
        { status: response.status }
      );
    }

    const text = await response.text();
    const contentType = response.headers.get("content-type") || "";

    let articles: PreviewArticle[] = [];
    let feedTitle: string | undefined;
    let feedDescription: string | undefined;
    let feedIconUrl: string | undefined;

    // Check if it's JSON Feed
    const isJsonFeed =
      contentType.includes("application/json") ||
      contentType.includes("application/feed+json") ||
      (text.trim().startsWith("{") && text.includes('"version"'));

    if (isJsonFeed) {
      try {
        const jsonFeed = JSON.parse(text);
        feedTitle = jsonFeed.title;
        feedDescription = jsonFeed.description;
        feedIconUrl = jsonFeed.favicon || jsonFeed.icon;

        articles = (jsonFeed.items || []).slice(0, limit).map((item: {
          id?: string;
          url?: string;
          title?: string;
          summary?: string;
          content_text?: string;
          content_html?: string;
          image?: string;
          date_published?: string;
          date_modified?: string;
        }) => {
          const videoId = item.url ? extractYouTubeVideoId(item.url) : undefined;
          return {
            title: item.title || "Untitled",
            link: item.url || "",
            summary: item.summary || item.content_text
              ? stripHtml(item.summary || item.content_text || "").slice(0, 150)
              : undefined,
            imageUrl: videoId
              ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
              : item.image,
            publishedAt: item.date_published
              ? new Date(item.date_published).getTime()
              : item.date_modified
              ? new Date(item.date_modified).getTime()
              : Date.now(),
            videoId,
          };
        });
      } catch {
        return NextResponse.json(
          { error: "Failed to parse JSON feed" },
          { status: 500 }
        );
      }
    } else {
      // Parse as RSS/Atom
      try {
        const feed = await rssParser.parseString(text);
        feedTitle = feed.title;
        feedDescription = feed.description;
        feedIconUrl = feed.image?.url;

        articles = (feed.items || []).slice(0, limit).map((item) => {
          const videoId = item.link ? extractYouTubeVideoId(item.link) : undefined;
          let imageUrl = extractImageUrl(item);

          // Use YouTube thumbnail if it's a YouTube video
          if (videoId && !imageUrl) {
            imageUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
          }

          return {
            title: item.title || "Untitled",
            link: item.link || "",
            summary: item.contentSnippet
              ? stripHtml(item.contentSnippet).slice(0, 150)
              : undefined,
            imageUrl,
            publishedAt: item.pubDate
              ? new Date(item.pubDate).getTime()
              : item.isoDate
              ? new Date(item.isoDate).getTime()
              : Date.now(),
            videoId,
          };
        });
      } catch (error) {
        console.error("Failed to parse RSS feed:", error);
        return NextResponse.json(
          { error: "Failed to parse feed" },
          { status: 500 }
        );
      }
    }

    const result: FeedPreviewResponse = {
      articles,
      feedTitle,
      feedDescription,
      feedIconUrl,
      fetchedAt: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Preview fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch preview" },
      { status: 500 }
    );
  }
}
