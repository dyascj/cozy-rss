// Categories for the Discover feature
export type DiscoverCategory =
  | "tech-programming"
  | "ai-ml"
  | "youtube"
  | "social-media"
  | "design-creative"
  | "gaming"
  | "entertainment-media"
  | "news-current-events"
  | "podcasts-newsletters"
  | "indie-blogs"
  | "lifestyle-other";

export interface DiscoverCategoryMeta {
  id: DiscoverCategory;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  color: string; // Tailwind color class for background
  textColor: string; // Tailwind color class for text
}

// A discoverable feed from RSSHub or curated sources
export interface DiscoverFeed {
  id: string;
  name: string;
  description?: string;
  feedUrl: string;
  siteUrl?: string;
  iconUrl?: string;
  category: DiscoverCategory;
  subcategory?: string;
  source: "rsshub" | "curated" | "feedly";
  popularity?: number;
  tags?: string[];
  // YouTube-specific
  isYouTube?: boolean;
  youtubeChannelId?: string;
  // Podcast/Newsletter specific
  isPodcast?: boolean;
  isNewsletter?: boolean;
}

// Feed preview with recent articles
export interface FeedPreview {
  feed: DiscoverFeed;
  articles: PreviewArticle[];
  fetchedAt: number;
}

export interface PreviewArticle {
  title: string;
  link: string;
  summary?: string;
  imageUrl?: string;
  publishedAt: number;
  // For YouTube videos
  videoId?: string;
  duration?: string;
}

// RSSHub route definition
export interface RSSHubRoute {
  path: string;
  name: string;
  description?: string;
  example?: string;
  parameters?: Record<string, string>;
}

// API response types
export interface DiscoverFeedsResponse {
  feeds: DiscoverFeed[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface FeedPreviewResponse {
  articles: PreviewArticle[];
  feedTitle?: string;
  feedDescription?: string;
  feedIconUrl?: string;
  fetchedAt: number;
}

export interface DiscoverSearchResponse {
  results: DiscoverFeed[];
  query: string;
}
