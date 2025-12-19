export interface VideoEmbed {
  type: "youtube" | "vimeo";
  id: string;
  url: string;
  thumbnailUrl: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
export function getVimeoId(url: string): string | null {
  const pattern = /vimeo\.com\/(\d+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * Build embed URL for a video
 */
export function buildEmbedUrl(video: VideoEmbed): string {
  if (video.type === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${video.id}`;
  } else {
    return `https://player.vimeo.com/video/${video.id}`;
  }
}

/**
 * Get thumbnail URL for a video
 */
export function getThumbnailUrl(type: "youtube" | "vimeo", id: string): string {
  if (type === "youtube") {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  } else {
    // Vimeo requires an API call to get thumbnail, use a placeholder
    return `https://vumbnail.com/${id}.jpg`;
  }
}

/**
 * Extract video URLs from HTML content
 */
export function extractVideoUrls(content: string): VideoEmbed[] {
  const videos: VideoEmbed[] = [];
  const seen = new Set<string>();

  // Match href and src attributes, as well as plain URLs
  const urlPattern = /(?:href|src)=["']([^"']+)["']|(?:https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|vimeo\.com\/)[^\s<"']+)/gi;

  let match;
  while ((match = urlPattern.exec(content)) !== null) {
    const url = match[1] || match[0];

    // YouTube
    const youtubeId = getYouTubeId(url);
    if (youtubeId && !seen.has(`youtube:${youtubeId}`)) {
      seen.add(`youtube:${youtubeId}`);
      videos.push({
        type: "youtube",
        id: youtubeId,
        url,
        thumbnailUrl: getThumbnailUrl("youtube", youtubeId),
      });
    }

    // Vimeo
    const vimeoId = getVimeoId(url);
    if (vimeoId && !seen.has(`vimeo:${vimeoId}`)) {
      seen.add(`vimeo:${vimeoId}`);
      videos.push({
        type: "vimeo",
        id: vimeoId,
        url,
        thumbnailUrl: getThumbnailUrl("vimeo", vimeoId),
      });
    }
  }

  return videos;
}

/**
 * Extract YouTube channel ID from various URL formats
 */
export function getYouTubeChannelId(url: string): string | null {
  const patterns = [
    // Direct channel ID format: youtube.com/channel/UC...
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    // Handle format: youtube.com/@handle
    /youtube\.com\/@([a-zA-Z0-9_-]+)/,
    // Custom URL format: youtube.com/c/ChannelName
    /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
    // User format: youtube.com/user/Username
    /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Build YouTube RSS feed URL from channel ID
 * Note: This only works with actual channel IDs (starting with UC)
 * For handles/@username, the channel ID needs to be resolved via API
 */
export function buildYouTubeFeedUrl(channelId: string): string {
  // If it looks like a channel ID (starts with UC), use direct feed
  if (channelId.startsWith("UC")) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  }
  // For handles/usernames, use RSSHub which can resolve them
  return `https://rsshub.app/youtube/user/@${channelId}`;
}

/**
 * Check if a URL is a YouTube channel URL
 */
export function isYouTubeChannelUrl(url: string): boolean {
  return getYouTubeChannelId(url) !== null;
}

/**
 * Check if a feed URL is a YouTube feed
 */
export function isYouTubeFeed(feedUrl: string): boolean {
  return (
    feedUrl.includes("youtube.com/feeds/videos.xml") ||
    feedUrl.includes("rsshub.app/youtube")
  );
}
