"use client";

import { useEffect, useCallback, useRef } from "react";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { fetchAndParseFeed } from "@/lib/feed-parser";

export function useFeedRefresh() {
  const { feeds, updateFeed } = useFeedStore();
  const { addArticles, pruneArticles } = useArticleStore();
  const { setIsRefreshing } = useUIStore();
  const { maxArticlesPerFeed } = useSettingsStore();
  const isRefreshing = useRef(false);

  const refreshFeed = useCallback(
    async (feedId: string) => {
      const feed = feeds[feedId];
      if (!feed) return;

      try {
        const parsedFeed = await fetchAndParseFeed(feed.url);

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

  const refreshAllFeeds = useCallback(async () => {
    if (isRefreshing.current) return;

    const feedIds = Object.keys(feeds);
    if (feedIds.length === 0) return;

    isRefreshing.current = true;
    setIsRefreshing(true);

    try {
      // Refresh feeds in parallel (with concurrency limit)
      const concurrencyLimit = 3;
      for (let i = 0; i < feedIds.length; i += concurrencyLimit) {
        const batch = feedIds.slice(i, i + concurrencyLimit);
        await Promise.all(batch.map(refreshFeed));
      }
    } finally {
      isRefreshing.current = false;
      setIsRefreshing(false);
    }
  }, [feeds, refreshFeed, setIsRefreshing]);

  // Initial refresh on first load
  const hasInitialRefresh = useRef(false);
  useEffect(() => {
    if (!hasInitialRefresh.current && Object.keys(feeds).length > 0) {
      hasInitialRefresh.current = true;
      // Small delay to let the UI render first
      const timeout = setTimeout(() => {
        refreshAllFeeds();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [feeds, refreshAllFeeds]);

  // Listen for manual refresh trigger (no auto-refresh interval)
  useEffect(() => {
    const handleRefresh = () => refreshAllFeeds();
    window.addEventListener("refresh-feeds", handleRefresh);
    return () => window.removeEventListener("refresh-feeds", handleRefresh);
  }, [refreshAllFeeds]);
}
