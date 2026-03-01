"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { refreshTracker, RefreshStatus } from "@/lib/feed-cache";

export type { RefreshStatus };

const MIN_REFRESH_INTERVAL = 30000; // 30 seconds

export function useFeedRefresh() {
  const { feeds, isInitialized: feedsInitialized } = useFeedStore();
  const { setIsRefreshing } = useUIStore();
  const isRefreshing = useRef(false);
  const hasInitialRefresh = useRef(false);

  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>(
    refreshTracker.getStatus()
  );

  useEffect(() => {
    return refreshTracker.subscribe(setRefreshStatus);
  }, []);

  const refreshAllFeeds = useCallback(
    async (options: { forceRefresh?: boolean } = {}) => {
      if (isRefreshing.current) return;

      if (!options.forceRefresh && !refreshTracker.canRefreshAll(MIN_REFRESH_INTERVAL)) {
        return;
      }

      const feedIds = Object.keys(feeds);
      if (feedIds.length === 0) return;

      isRefreshing.current = true;
      setIsRefreshing(true);
      refreshTracker.startRefresh();

      try {
        await fetch("/api/feeds/refresh", { method: "POST" });

        // Re-initialize article store to pick up new articles from DB
        useArticleStore.setState({ isInitialized: false, isLoading: false });
        await useArticleStore.getState().initialize();

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
    [feeds, setIsRefreshing]
  );

  const refreshSingleFeed = useCallback(
    async (feedId: string) => {
      setIsRefreshing(true);
      refreshTracker.startRefresh();
      try {
        await fetch("/api/feeds/refresh", { method: "POST" });
        await useArticleStore.getState().fetchArticlesForFeed(feedId);
        refreshTracker.finishRefresh();
      } catch (error) {
        refreshTracker.finishRefresh(
          error instanceof Error ? error.message : "Refresh failed"
        );
      } finally {
        setIsRefreshing(false);
      }
    },
    [setIsRefreshing]
  );

  // Initial refresh when store is initialized
  useEffect(() => {
    const feedCount = Object.keys(feeds).length;

    if (
      feedsInitialized &&
      feedCount > 0 &&
      !hasInitialRefresh.current
    ) {
      hasInitialRefresh.current = true;

      const timeout = setTimeout(() => {
        refreshAllFeeds();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [feeds, feedsInitialized, refreshAllFeeds]);

  // Listen for manual refresh trigger
  useEffect(() => {
    const handleRefresh = () => refreshAllFeeds({ forceRefresh: true });
    window.addEventListener("refresh-feeds", handleRefresh);
    return () => window.removeEventListener("refresh-feeds", handleRefresh);
  }, [refreshAllFeeds]);

  return {
    refreshAllFeeds,
    refreshSingleFeed,
    refreshStatus,
    canRefresh: refreshTracker.canRefreshAll(MIN_REFRESH_INTERVAL),
    cooldownRemaining: refreshTracker.getCooldown(MIN_REFRESH_INTERVAL),
  };
}
