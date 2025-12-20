/**
 * Feed Cache System
 *
 * Provides in-memory caching for feed fetches with TTL,
 * reducing redundant network requests and improving performance.
 */

import { ParsedFeed } from "@/lib/feed-parser";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  etag?: string;
  lastModified?: string;
}

interface FeedCacheOptions {
  /** Default TTL in milliseconds */
  defaultTTL: number;
  /** Maximum cache entries */
  maxEntries: number;
  /** Minimum time between refreshes for same feed (prevents spam) */
  minRefreshInterval: number;
}

const DEFAULT_OPTIONS: FeedCacheOptions = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxEntries: 500,
  minRefreshInterval: 30 * 1000, // 30 seconds
};

export class FeedCache {
  private cache = new Map<string, CacheEntry<ParsedFeed>>();
  private lastFetchTime = new Map<string, number>();
  private options: FeedCacheOptions;

  constructor(options: Partial<FeedCacheOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Get a cached feed if valid
   */
  get(url: string): ParsedFeed | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(url);
      return null;
    }

    return entry.data;
  }

  /**
   * Store a feed in cache
   */
  set(
    url: string,
    feed: ParsedFeed,
    options: { ttl?: number; etag?: string; lastModified?: string } = {}
  ): void {
    const now = Date.now();
    const ttl = options.ttl ?? this.options.defaultTTL;

    // Enforce max entries with LRU eviction
    if (this.cache.size >= this.options.maxEntries) {
      this.evictOldest();
    }

    this.cache.set(url, {
      data: feed,
      timestamp: now,
      expiresAt: now + ttl,
      etag: options.etag,
      lastModified: options.lastModified,
    });

    this.lastFetchTime.set(url, now);
  }

  /**
   * Check if we can refresh a feed (respects minimum interval)
   */
  canRefresh(url: string): boolean {
    const lastFetch = this.lastFetchTime.get(url);
    if (!lastFetch) return true;

    return Date.now() - lastFetch >= this.options.minRefreshInterval;
  }

  /**
   * Get time until a feed can be refreshed
   */
  getRefreshCooldown(url: string): number {
    const lastFetch = this.lastFetchTime.get(url);
    if (!lastFetch) return 0;

    const elapsed = Date.now() - lastFetch;
    const remaining = this.options.minRefreshInterval - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Get cached entry metadata for conditional requests
   */
  getMetadata(url: string): { etag?: string; lastModified?: string } | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    return {
      etag: entry.etag,
      lastModified: entry.lastModified,
    };
  }

  /**
   * Mark a feed as recently fetched (even if fetch failed)
   * This prevents rapid retry loops
   */
  markFetched(url: string): void {
    this.lastFetchTime.set(url, Date.now());
  }

  /**
   * Invalidate a specific cache entry
   */
  invalidate(url: string): void {
    this.cache.delete(url);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.lastFetchTime.clear();
  }

  /**
   * Evict oldest entries
   */
  private evictOldest(): void {
    let oldest: { key: string; timestamp: number } | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.timestamp < oldest.timestamp) {
        oldest = { key, timestamp: entry.timestamp };
      }
    }

    if (oldest) {
      this.cache.delete(oldest.key);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (now <= entry.expiresAt) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      trackedFeeds: this.lastFetchTime.size,
    };
  }
}

// Singleton instance for feed caching
export const feedCache = new FeedCache();

/**
 * Refresh Status Tracker
 *
 * Tracks the status of feed refreshes for UI feedback
 */
export interface RefreshStatus {
  isRefreshing: boolean;
  lastRefreshTime: number | null;
  lastRefreshDuration: number | null;
  feedsRefreshed: number;
  feedsFailed: number;
  currentFeed: string | null;
  error: string | null;
}

class RefreshTracker {
  private status: RefreshStatus = {
    isRefreshing: false,
    lastRefreshTime: null,
    lastRefreshDuration: null,
    feedsRefreshed: 0,
    feedsFailed: 0,
    currentFeed: null,
    error: null,
  };

  private startTime: number | null = null;
  private listeners = new Set<(status: RefreshStatus) => void>();

  startRefresh(): void {
    this.startTime = Date.now();
    this.status = {
      ...this.status,
      isRefreshing: true,
      feedsRefreshed: 0,
      feedsFailed: 0,
      currentFeed: null,
      error: null,
    };
    this.notify();
  }

  setCurrentFeed(feedTitle: string): void {
    this.status.currentFeed = feedTitle;
    this.notify();
  }

  feedCompleted(success: boolean): void {
    if (success) {
      this.status.feedsRefreshed++;
    } else {
      this.status.feedsFailed++;
    }
    this.notify();
  }

  finishRefresh(error?: string): void {
    const now = Date.now();
    this.status = {
      ...this.status,
      isRefreshing: false,
      lastRefreshTime: now,
      lastRefreshDuration: this.startTime ? now - this.startTime : null,
      currentFeed: null,
      error: error || null,
    };
    this.startTime = null;
    this.notify();
  }

  getStatus(): RefreshStatus {
    return { ...this.status };
  }

  subscribe(listener: (status: RefreshStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Check if enough time has passed since last refresh
   * Prevents refresh spam
   */
  canRefreshAll(minInterval = 30000): boolean {
    if (this.status.isRefreshing) return false;
    if (!this.status.lastRefreshTime) return true;

    return Date.now() - this.status.lastRefreshTime >= minInterval;
  }

  /**
   * Get time until next refresh is allowed
   */
  getCooldown(minInterval = 30000): number {
    if (this.status.isRefreshing) return minInterval;
    if (!this.status.lastRefreshTime) return 0;

    const elapsed = Date.now() - this.status.lastRefreshTime;
    return Math.max(0, minInterval - elapsed);
  }
}

export const refreshTracker = new RefreshTracker();
