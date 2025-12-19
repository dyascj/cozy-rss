import { DiscoverCategory } from "@/types/discover";

export interface PopularWebsite {
  id: string;
  name: string;
  description: string;
  siteUrl: string;
  feedUrl?: string;
  logoUrl?: string;
  category: DiscoverCategory;
}

/**
 * Popular websites that users might want to follow.
 * Includes sites with known RSS feeds and sites where users can discover feeds.
 */
export const POPULAR_WEBSITES: PopularWebsite[] = [
  // Tech
  {
    id: "site-1",
    name: "Medium",
    description: "Discover thoughtful articles on technology, design, and more",
    siteUrl: "https://medium.com",
    feedUrl: "https://medium.com/feed/@username",
    category: "tech-programming",
  },
  {
    id: "site-2",
    name: "Substack",
    description: "Independent newsletters on every topic",
    siteUrl: "https://substack.com",
    category: "podcasts-newsletters",
  },
  {
    id: "site-3",
    name: "GitHub",
    description: "Follow repositories, releases, and discussions",
    siteUrl: "https://github.com",
    feedUrl: "https://github.com/USERNAME/REPO/releases.atom",
    category: "tech-programming",
  },
  {
    id: "site-4",
    name: "Stack Overflow Blog",
    description: "Insights from the developer community",
    siteUrl: "https://stackoverflow.blog",
    feedUrl: "https://stackoverflow.blog/feed/",
    category: "tech-programming",
  },

  // YouTube Channels (find via channel page)
  {
    id: "site-5",
    name: "YouTube",
    description: "Follow your favorite channels via RSS",
    siteUrl: "https://www.youtube.com",
    category: "youtube",
  },

  // News & Media
  {
    id: "site-6",
    name: "The Atlantic",
    description: "Ideas and analysis on politics, culture, and more",
    siteUrl: "https://www.theatlantic.com",
    feedUrl: "https://www.theatlantic.com/feed/all/",
    category: "news-current-events",
  },
  {
    id: "site-7",
    name: "Vox",
    description: "Understand the news with explainers",
    siteUrl: "https://www.vox.com",
    feedUrl: "https://www.vox.com/rss/index.xml",
    category: "news-current-events",
  },

  // Design
  {
    id: "site-8",
    name: "Behance",
    description: "Creative work from designers worldwide",
    siteUrl: "https://www.behance.net",
    category: "design-creative",
  },
  {
    id: "site-9",
    name: "Figma Blog",
    description: "Design tool updates and inspiration",
    siteUrl: "https://www.figma.com/blog",
    feedUrl: "https://www.figma.com/blog/feed/",
    category: "design-creative",
  },

  // Science
  {
    id: "site-10",
    name: "NASA",
    description: "Space exploration news and discoveries",
    siteUrl: "https://www.nasa.gov",
    feedUrl: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    category: "lifestyle-other",
  },

  // Gaming
  {
    id: "site-11",
    name: "Steam News",
    description: "Game updates and announcements",
    siteUrl: "https://store.steampowered.com/news",
    category: "gaming",
  },

  // Podcasts
  {
    id: "site-12",
    name: "Spotify Podcasts",
    description: "Discover podcasts on Spotify",
    siteUrl: "https://open.spotify.com/genre/podcasts-web",
    category: "podcasts-newsletters",
  },
  {
    id: "site-13",
    name: "Apple Podcasts",
    description: "Browse top podcasts",
    siteUrl: "https://podcasts.apple.com",
    category: "podcasts-newsletters",
  },

  // Personal blogs platform
  {
    id: "site-14",
    name: "Ghost",
    description: "Independent publishing platform",
    siteUrl: "https://ghost.org",
    category: "indie-blogs",
  },
  {
    id: "site-15",
    name: "WordPress.com",
    description: "Millions of blogs with RSS feeds",
    siteUrl: "https://wordpress.com",
    category: "indie-blogs",
  },
];

/**
 * Get popular websites, optionally filtered by category
 */
export function getPopularWebsites(category?: DiscoverCategory): PopularWebsite[] {
  if (category) {
    return POPULAR_WEBSITES.filter((site) => site.category === category);
  }
  return POPULAR_WEBSITES;
}

/**
 * Get websites with known RSS feeds
 */
export function getWebsitesWithFeeds(): PopularWebsite[] {
  return POPULAR_WEBSITES.filter((site) => site.feedUrl);
}
