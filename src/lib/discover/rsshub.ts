import { DiscoverCategory, DiscoverFeed, RSSHubRoute } from "@/types/discover";

// RSSHub instance URL - can be self-hosted or use public instance
// Note: The public rsshub.app instance is heavily rate-limited (429 errors)
// For reliable access, users should self-host RSSHub
export const RSSHUB_INSTANCE = "https://rsshub.app";

// RSSHub routes are disabled due to unreliable public instance
// To enable, self-host RSSHub and add routes here
export const RSSHUB_ROUTES: Record<DiscoverCategory, RSSHubRoute[]> = {
  "youtube": [],
  "ai-ml": [],
  "social-media": [],
  "design-creative": [],
  "gaming": [],
  "tech-programming": [],
  "entertainment-media": [],
  "news-current-events": [],
  "podcasts-newsletters": [],
  "indie-blogs": [],
  "lifestyle-other": [],
};

/**
 * Build a full RSSHub feed URL from a route
 */
export function buildRSSHubUrl(route: RSSHubRoute, params?: Record<string, string>): string {
  let path = route.path;

  // Replace any parameters in the path
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }
  }

  return `${RSSHUB_INSTANCE}${path}`;
}

/**
 * Convert RSSHub routes to DiscoverFeed format
 */
export function rsshubRoutesToFeeds(
  routes: RSSHubRoute[],
  category: DiscoverCategory
): DiscoverFeed[] {
  return routes.map((route, index) => {
    const isYouTube = route.path.includes("/youtube/");
    return {
      id: `rsshub-${category}-${index}`,
      name: route.name,
      description: route.description,
      feedUrl: buildRSSHubUrl(route),
      siteUrl: RSSHUB_INSTANCE,
      category,
      source: "rsshub" as const,
      popularity: routes.length - index, // Higher index = lower popularity
      tags: extractTagsFromRoute(route),
      isYouTube,
    };
  });
}

/**
 * Extract tags from route path for filtering
 */
function extractTagsFromRoute(route: RSSHubRoute): string[] {
  const tags: string[] = [];
  const path = route.path.toLowerCase();

  if (path.includes("reddit")) tags.push("Reddit");
  if (path.includes("github")) tags.push("GitHub");
  if (path.includes("youtube")) tags.push("YouTube");
  if (path.includes("hackernews")) tags.push("Hacker News");
  if (path.includes("producthunt")) tags.push("Product Hunt");

  return tags;
}

/**
 * Get all RSSHub feeds for a category
 */
export function getRSSHubFeedsForCategory(category: DiscoverCategory): DiscoverFeed[] {
  const routes = RSSHUB_ROUTES[category] || [];
  return rsshubRoutesToFeeds(routes, category);
}
