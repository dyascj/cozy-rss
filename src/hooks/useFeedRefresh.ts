"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { fetchAndParseFeed } from "@/lib/feed-parser";
import { refreshTracker, RefreshStatus } from "@/lib/feed-cache";

// Minimum time between full refreshes (prevents spam clicking)
const MIN_REFRESH_INTERVAL = 30000; // 30 seconds

// Stagger delay between starting feed refreshes on login
const STAGGER_DELAY = 200; // 200ms between each feed start

export function useFeedRefresh() {
  const { feeds, updateFeed, isInitialized: feedsInitialized } = useFeedStore();
  const { addArticles, pruneArticles } = useArticleStore();
  const { setIsRefreshing, selectedFeedId } = useUIStore();
  const { maxArticlesPerFeed } = useSettingsStore();
  const isRefreshing = useRef(false);
  const lastRefreshedFeedCount = useRef(0);
  const hasInitialRefresh = useRef(false);

  // Track refresh status for UI
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>(
    refreshTracker.getStatus()
  );

  // Subscribe to refresh status updates
  useEffect(() => {
    return refreshTracker.subscribe(setRefreshStatus);
  }, []);

  /**
   * Refresh a single feed
   */
  const refreshFeed = useCallback(
    async (feedId: string, priority = 0) => {
      const feed = feeds[feedId];
      if (!feed) return;

      try {
        const parsedFeed = await fetchAndParseFeed(feed.url, {
          feedTitle: feed.title,
          priority,
        });

        // Add new articles
        addArticles(
          feedId,
          parsedFeed.items.map((item) => ({
            feedId,
            guid: item.guid,
            title: item.title,
            link: item.link,
            author: item.author,
            summary: item.summary,
            content: item.content,
            publishedAt: item.publishedAt,
            fetchedAt: Date.now(),
            isRead: false,
            isStarred: false,
            isReadLater: false,
            imageUrl: item.imageUrl,
          }))
        );

        // Prune old articles
        pruneArticles(feedId, maxArticlesPerFeed);

        // Update feed metadata
        updateFeed(feedId, {
          lastFetched: Date.now(),
          lastError: undefined,
          title: parsedFeed.title || feed.title,
          description: parsedFeed.description,
          siteUrl: parsedFeed.siteUrl,
          iconUrl: parsedFeed.iconUrl || feed.iconUrl,
        });
      } catch (error) {
        updateFeed(feedId, {
          lastError:
            error instanceof Error ? error.message : "Failed to refresh",
        });
      }
    },
    [feeds, addArticles, pruneArticles, updateFeed, maxArticlesPerFeed]
  );

  /**
   * Refresh all feeds with smart prioritization
   *
   * Priority order:
   * 1. Currently selected feed (if any)
   * 2. Feeds with errors (to retry)
   * 3. Feeds not refreshed recently
   * 4. Other feeds
   */
  const refreshAllFeeds = useCallback(
    async (options: { forceRefresh?: boolean } = {}) => {
      if (isRefreshing.current) return;

      // Check cooldown unless force refresh
      if (!options.forceRefresh && !refreshTracker.canRefreshAll(MIN_REFRESH_INTERVAL)) {
        console.log(
          `Refresh on cooldown, ${Math.ceil(
            refreshTracker.getCooldown(MIN_REFRESH_INTERVAL) / 1000
          )}s remaining`
        );
        return;
      }

      const feedIds = Object.keys(feeds);
      if (feedIds.length === 0) return;

      isRefreshing.current = true;
      setIsRefreshing(true);
      refreshTracker.startRefresh();

      try {
        // Sort feeds by priority
        const sortedFeedIds = [...feedIds].sort((a, b) => {
          const feedA = feeds[a];
          const feedB = feeds[b];

          // Selected feed gets highest priority
          if (a === selectedFeedId) return -1;
          if (b === selectedFeedId) return 1;

          // Feeds with errors get second priority (retry them)
          if (feedA.lastError && !feedB.lastError) return -1;
          if (!feedA.lastError && feedB.lastError) return 1;

          // Then sort by last fetched time (oldest first)
          const lastFetchA = feedA.lastFetched || 0;
          const lastFetchB = feedB.lastFetched || 0;
          return lastFetchA - lastFetchB;
        });

        // Assign priorities (higher number = higher priority)
        const priorities: Record<string, number> = {};
        sortedFeedIds.forEach((id, index) => {
          priorities[id] = sortedFeedIds.length - index;
        });

        // Stagger feed refreshes to prevent thundering herd
        // The request queue handles actual concurrency, but we stagger
        // the *initiation* of requests for even smoother loading
        const refreshPromises: Promise<void>[] = [];

        for (let i = 0; i < sortedFeedIds.length; i++) {
          const feedId = sortedFeedIds[i];

          // Create staggered promise
          const staggeredRefresh = new Promise<void>((resolve) => {
            setTimeout(async () => {
              await refreshFeed(feedId, priorities[feedId]);
              resolve();
            }, i * STAGGER_DELAY);
          });

          refreshPromises.push(staggeredRefresh);
        }

        // Wait for all refreshes to complete
        await Promise.all(refreshPromises);

        refreshTracker.finishRefresh();
      } catch (error) {
        refreshTracker.finishRefresh(
          error instanceof Error ? error.message : "Refresh failed"
        );
      } finally {
        isRefreshing.current = false;
        setIsRefreshing(false);
      }
    },
    [feeds, selectedFeedId, refreshFeed, setIsRefreshing]
  );

  /**
   * Refresh a single feed (exposed for manual refresh of specific feed)
   */
  const refreshSingleFeed = useCallback(
    async (feedId: string) => {
      setIsRefreshing(true);
      refreshTracker.startRefresh();
      try {
        await refreshFeed(feedId, 100); // High priority for manual refresh
        refreshTracker.finishRefresh();
      } catch (error) {
        refreshTracker.finishRefresh(
          error instanceof Error ? error.message : "Refresh failed"
        );
      } finally {
        setIsRefreshing(false);
      }
    },
    [refreshFeed, setIsRefreshing]
  );

  // Initial refresh when store is initialized
  useEffect(() => {
    const feedCount = Object.keys(feeds).length;

    // Only do initial refresh once when:
    // 1. Feeds store is initialized
    // 2. There are feeds to refresh
    // 3. We haven't done initial refresh yet
    if (
      feedsInitialized &&
      feedCount > 0 &&
      !hasInitialRefresh.current
    ) {
      hasInitialRefresh.current = true;
      lastRefreshedFeedCount.current = feedCount;

      // Small delay to let the UI render first
      const timeout = setTimeout(() => {
        refreshAllFeeds();
      }, 300);
      return () => clearTimeout(timeout);
    }

    // Also refresh when new feeds are added
    if (
      feedsInitialized &&
      feedCount > lastRefreshedFeedCount.current
    ) {
      lastRefreshedFeedCount.current = feedCount;

      // Only refresh the new feeds (not all)
      // This is handled automatically by the add feed flow
    }
  }, [feeds, feedsInitialized, refreshAllFeeds]);

  // Listen for manual refresh trigger
  useEffect(() => {
    const handleRefresh = () => refreshAllFeeds({ forceRefresh: true });
    window.addEventListener("refresh-feeds", handleRefresh);
    return () => window.removeEventListener("refresh-feeds", handleRefresh);
  }, [refreshAllFeeds]);

  // Return useful values for components
  return {
    refreshAllFeeds,
    refreshSingleFeed,
    refreshStatus,
    canRefresh: refreshTracker.canRefreshAll(MIN_REFRESH_INTERVAL),
    cooldownRemaining: refreshTracker.getCooldown(MIN_REFRESH_INTERVAL),
  };
}
