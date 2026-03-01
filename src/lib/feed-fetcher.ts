import Parser from "rss-parser";
import { validateUrlForSSRF } from "@/lib/security/ssrf";
import * as articleRepo from "@/lib/db/repositories/articleRepository";

const rssParser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
    ],
  },
});

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageUrl(item: any): string | undefined {
  if (item.mediaContent && Array.isArray(item.mediaContent)) {
    for (const m of item.mediaContent) {
      if (m?.url && IMAGE_EXTENSIONS.test(String(m.url))) return String(m.url);
      if (m?.$?.url && IMAGE_EXTENSIONS.test(String(m.$.url))) return String(m.$.url);
    }
  }
  if (item.mediaThumbnail?.[0]) {
    const t = item.mediaThumbnail[0].$ || item.mediaThumbnail[0];
    if (t.url) return String(t.url);
  }
  const content = String(item.contentEncoded || item.content || item.summary || "");
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

/**
 * Server-side: fetch a feed URL, parse it, and store articles in the database.
 * Returns the number of articles created.
 */
export async function fetchAndStoreArticles(feedId: string, feedUrl: string): Promise<number> {
  const ssrfError = validateUrlForSSRF(feedUrl);
  if (ssrfError) {
    console.error(`SSRF blocked for ${feedUrl}: ${ssrfError}`);
    return 0;
  }

  const response = await fetch(feedUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; CozyRSS/1.0)",
      Accept: "application/rss+xml, application/atom+xml, application/json, application/feed+json, text/xml, application/xml, */*",
    },
  });

  if (!response.ok) {
    console.error(`Feed ${feedUrl} returned ${response.status}`);
    return 0;
  }

  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";

  let articleData: { guid: string; title: string; link: string; author?: string; summary?: string; content?: string; imageUrl?: string; publishedAt: string }[] = [];

  // JSON Feed
  const isJsonFeed = contentType.includes("application/json") || contentType.includes("application/feed+json") || (text.trim().startsWith("{") && text.includes('"version"'));

  if (isJsonFeed) {
    try {
      const json = JSON.parse(text);
      articleData = (json.items || []).map((item: Record<string, unknown>) => ({
        guid: String(item.id || item.url || crypto.randomUUID()),
        title: String(item.title || "Untitled"),
        link: String(item.url || ""),
        author: (item.author as Record<string, string>)?.name || (item.authors as Record<string, string>[])?.[0]?.name,
        summary: String(item.summary || item.content_text || ""),
        content: String(item.content_html || item.content_text || item.summary || ""),
        imageUrl: item.image ? String(item.image) : undefined,
        publishedAt: item.date_published ? new Date(String(item.date_published)).toISOString() : new Date().toISOString(),
      }));
    } catch {
      console.error(`Failed to parse JSON feed: ${feedUrl}`);
      return 0;
    }
  } else {
    // RSS/Atom XML
    try {
      const feed = await rssParser.parseString(text);
      articleData = (feed.items || []).map((item) => ({
        guid: item.guid || item.link || item.title || crypto.randomUUID(),
        title: item.title || "Untitled",
        link: item.link || "",
        author: typeof item.creator === "string" ? item.creator : typeof item.author === "string" ? item.author : undefined,
        summary: item.contentSnippet || (typeof item.summary === "string" ? item.summary : undefined),
        content: String((item as Record<string, unknown>).contentEncoded || item.content || item.summary || ""),
        imageUrl: extractImageUrl(item),
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : item.isoDate ? new Date(item.isoDate).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error(`Failed to parse RSS feed ${feedUrl}:`, err);
      return 0;
    }
  }

  if (articleData.length === 0) return 0;

  const created = await articleRepo.createArticlesBulk(
    articleData.map((a) => ({ ...a, feedId }))
  );

  return created.length;
}
