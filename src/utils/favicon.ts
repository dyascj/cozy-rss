/**
 * Get favicon URL for a given site URL using Google's favicon service
 */
export function getFaviconUrl(siteUrl: string, size: number = 32): string {
  try {
    const url = new URL(siteUrl);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=${size}`;
  } catch {
    return "";
  }
}

/**
 * Get alternative favicon URL using DuckDuckGo's service
 */
export function getDuckDuckGoFaviconUrl(siteUrl: string): string {
  try {
    const url = new URL(siteUrl);
    return `https://icons.duckduckgo.com/ip3/${url.hostname}.ico`;
  } catch {
    return "";
  }
}

/**
 * Get direct favicon URL from the website's root
 */
export function getDirectFaviconUrl(siteUrl: string): string {
  try {
    const url = new URL(siteUrl);
    return `${url.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

/**
 * Get a color based on a string (for fallback letter icons)
 */
export function getColorFromString(str: string): string {
  const colors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#22c55e", // green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
    "#6366f1", // indigo
    "#84cc16", // lime
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get the first letter(s) of a title for fallback display
 */
export function getInitials(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}
