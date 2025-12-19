import Parser from "rss-parser";

export interface ParsedFeed {
  title: string;
  description?: string;
  siteUrl?: string;
  iconUrl?: string;
  items: ParsedItem[];
}

export interface ParsedItem {
  guid: string;
  title: string;
  link: string;
  author?: string;
  summary?: string;
  content?: string;
  publishedAt: number;
  imageUrl?: string;
}

interface JsonFeed {
  version: string;
  title: string;
  description?: string;
  home_page_url?: string;
  feed_url?: string;
  icon?: string;
  favicon?: string;
  items: JsonFeedItem[];
}

interface JsonFeedItem {
  id: string;
  url?: string;
  title?: string;
  content_html?: string;
  content_text?: string;
  summary?: string;
  image?: string;
  date_published?: string;
  date_modified?: string;
  author?: { name?: string };
  authors?: { name?: string }[];
}

const rssParser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["enclosure", "enclosure"],
      ["itunes:image", "itunesImage"],
    ],
  },
});

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i;

function isImageUrl(url: string, type?: string): boolean {
  if (type && String(type).startsWith("image")) return true;
  return IMAGE_EXTENSIONS.test(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageUrl(item: any): string | undefined {
  // Try media:content - look for explicit image type first, then any with image URL
  if (item.mediaContent && Array.isArray(item.mediaContent)) {
    // First pass: explicit image type
    for (const m of item.mediaContent) {
      if (m && typeof m === "object" && "url" in m) {
        const url = String(m.url);
        const type = m.type || m.medium;
        if (isImageUrl(url, type)) {
          return url;
        }
      }
    }
    // Second pass: any media:content with $ attributes (common RSS pattern)
    for (const m of item.mediaContent) {
      if (m && typeof m === "object") {
        const attrs = m.$ || m;
        if (attrs.url && isImageUrl(String(attrs.url), attrs.type || attrs.medium)) {
          return String(attrs.url);
        }
      }
    }
  }

  // Try media:thumbnail
  if (item.mediaThumbnail && Array.isArray(item.mediaThumbnail)) {
    const thumb = item.mediaThumbnail[0];
    if (thumb && typeof thumb === "object") {
      const attrs = thumb.$ || thumb;
      if (attrs.url) {
        return String(attrs.url);
      }
    }
  }

  // Try itunes:image (for podcasts)
  if (item.itunesImage) {
    const img = item.itunesImage;
    if (typeof img === "string") {
      return img;
    }
    if (typeof img === "object" && img.href) {
      return String(img.href);
    }
    if (typeof img === "object" && img.$ && img.$.href) {
      return String(img.$.href);
    }
  }

  // Try enclosure - check both type and URL extension
  if (item.enclosure && typeof item.enclosure === "object" && "url" in item.enclosure) {
    const enc = item.enclosure as Record<string, unknown>;
    const url = String(enc.url);
    if (isImageUrl(url, enc.type as string)) {
      return url;
    }
  }

  // Try to extract from content - get the first image
  const content = String(item.contentEncoded || item.content || item.summary || "");
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) {
    return imgMatch[1];
  }

  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRssFeed(feed: Parser.Output<any>): ParsedFeed {
  return {
    title: feed.title || "Untitled Feed",
    description: feed.description,
    siteUrl: feed.link,
    iconUrl: feed.image?.url,
    items: (feed.items || []).map((item) => ({
      guid: item.guid || item.link || item.title || crypto.randomUUID(),
      title: item.title || "Untitled",
      link: item.link || "",
      author: typeof item.creator === "string" ? item.creator : typeof item.author === "string" ? item.author : undefined,
      summary: item.contentSnippet || (typeof item.summary === "string" ? item.summary : undefined),
      content: String(item.contentEncoded || item.content || item.summary || ""),
      publishedAt: item.pubDate
        ? new Date(item.pubDate).getTime()
        : item.isoDate
        ? new Date(item.isoDate).getTime()
        : Date.now(),
      imageUrl: extractImageUrl(item),
    })),
  };
}

function normalizeJsonFeed(feed: JsonFeed): ParsedFeed {
  return {
    title: feed.title || "Untitled Feed",
    description: feed.description,
    siteUrl: feed.home_page_url,
    iconUrl: feed.favicon || feed.icon,
    items: (feed.items || []).map((item) => {
      const authorName =
        item.author?.name ||
        item.authors?.[0]?.name;

      return {
        guid: item.id || item.url || crypto.randomUUID(),
        title: item.title || "Untitled",
        link: item.url || "",
        author: authorName,
        summary: item.summary || item.content_text,
        content: item.content_html || item.content_text || item.summary || "",
        publishedAt: item.date_published
          ? new Date(item.date_published).getTime()
          : item.date_modified
          ? new Date(item.date_modified).getTime()
          : Date.now(),
        imageUrl: item.image,
      };
    }),
  };
}

export interface FetchOptions {
  maxItems?: number;
}

const DEFAULT_MAX_ITEMS = 200;

export async function fetchAndParseFeed(
  url: string,
  options: FetchOptions = {}
): Promise<ParsedFeed> {
  const { maxItems = DEFAULT_MAX_ITEMS } = options;

  const response = await fetch(`/api/fetch-feed?url=${encodeURIComponent(url)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch feed");
  }

  const result = await response.json();

  let parsedFeed: ParsedFeed;

  if (result.type === "jsonfeed") {
    parsedFeed = normalizeJsonFeed(result.data);
  } else {
    // Parse XML using rss-parser
    try {
      const feed = await rssParser.parseString(result.data);
      parsedFeed = normalizeRssFeed(feed);
    } catch (error) {
      throw new Error(
        `Failed to parse feed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Limit the number of items to prevent memory issues with large feeds
  if (parsedFeed.items.length > maxItems) {
    // Sort by date (newest first) before slicing to keep most recent
    parsedFeed.items.sort((a, b) => b.publishedAt - a.publishedAt);
    parsedFeed.items = parsedFeed.items.slice(0, maxItems);
  }

  return parsedFeed;
}

export async function discoverFeedUrl(url: string): Promise<string | null> {
  try {
    // First, try the URL directly as a feed
    const directResponse = await fetch(
      `/api/fetch-feed?url=${encodeURIComponent(url)}`
    );
    if (directResponse.ok) {
      const result = await directResponse.json();
      if (result.type === "jsonfeed" || result.type === "xml") {
        // Validate it's actually a feed
        if (result.type === "jsonfeed" && result.data.version) {
          return url;
        }
        if (
          result.type === "xml" &&
          (result.data.includes("<rss") ||
            result.data.includes("<feed") ||
            result.data.includes("<channel"))
        ) {
          return url;
        }
      }
    }
  } catch {
    // URL is not a valid feed, continue to discovery
  }

  return url; // Return original URL, let the add feed process validate it
}
