import { useCallback, useRef, useEffect } from "react";
import { useDiscoverStore } from "@/stores/discoverStore";
import { FeedPreview, PreviewArticle, DiscoverFeed } from "@/types/discover";

const PREVIEW_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const DEBOUNCE_MS = 300;

export function useFeedPreview(feed: DiscoverFeed) {
  const {
    feedPreviews,
    loadingPreview,
    setFeedPreview,
    setLoadingPreview,
    setPreviewError,
  } = useDiscoverStore();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const feedUrl = feed.feedUrl;
  const cachedPreview = feedPreviews[feedUrl];
  const isCacheValid =
    cachedPreview && Date.now() - cachedPreview.fetchedAt < PREVIEW_CACHE_TTL;
  const isLoading = loadingPreview === feedUrl;

  const fetchPreview = useCallback(async () => {
    // Use cached version if valid
    if (isCacheValid) return;

    // Already loading this feed
    if (loadingPreview === feedUrl) return;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingPreview(feedUrl);
    setPreviewError(null);

    try {
      const response = await fetch(
        `/api/discover/preview?url=${encodeURIComponent(feedUrl)}&limit=5`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch preview: ${response.status}`);
      }

      const data = await response.json();

      const preview: FeedPreview = {
        feed,
        articles: data.articles as PreviewArticle[],
        fetchedAt: Date.now(),
      };

      setFeedPreview(feedUrl, preview);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Request was cancelled, ignore
        return;
      }
      console.error("Preview fetch error:", error);
      setPreviewError(error instanceof Error ? error.message : "Failed to load preview");
    } finally {
      if (loadingPreview === feedUrl) {
        setLoadingPreview(null);
      }
    }
  }, [feedUrl, feed, isCacheValid, loadingPreview, setFeedPreview, setLoadingPreview, setPreviewError]);

  const debouncedFetchPreview = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchPreview();
    }, DEBOUNCE_MS);
  }, [fetchPreview]);

  const cancelFetch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelFetch();
      // Clear loading state if this feed was loading
      if (loadingPreview === feedUrl) {
        setLoadingPreview(null);
      }
    };
  }, [cancelFetch, loadingPreview, feedUrl, setLoadingPreview]);

  return {
    preview: isCacheValid ? cachedPreview : null,
    isLoading,
    fetchPreview: debouncedFetchPreview,
    fetchPreviewImmediately: fetchPreview,
    cancelFetch,
  };
}
