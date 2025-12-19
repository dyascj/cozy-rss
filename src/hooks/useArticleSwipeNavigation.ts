"use client";

import { useRef, useCallback, useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useArticleStore } from "@/stores/articleStore";
import { useFeedStore } from "@/stores/feedStore";
import { useSettingsStore } from "@/stores/settingsStore";

interface SwipeNavigationState {
  isSwiping: boolean;
  direction: "left" | "right" | "down" | null;
  progress: number;
}

interface UseArticleSwipeNavigationOptions {
  enabled?: boolean;
  onClose?: () => void;
}

export function useArticleSwipeNavigation(options: UseArticleSwipeNavigationOptions = {}) {
  const { enabled = true, onClose } = options;

  const {
    selectedArticleId,
    selectArticle,
    selectedFeedId,
    selectedFolderId,
    viewType,
    setMobilePanel,
  } = useUIStore();

  const { articles, articlesByFeed, markAsRead } = useArticleStore();
  const { feedOrder } = useFeedStore();
  const { markAsReadOnSelect } = useSettingsStore();

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const currentDeltaX = useRef<number>(0);
  const currentDeltaY = useRef<number>(0);
  const swipeDirection = useRef<"horizontal" | "vertical" | null>(null);

  const [swipeState, setSwipeState] = useState<SwipeNavigationState>({
    isSwiping: false,
    direction: null,
    progress: 0,
  });

  // Get visible article IDs based on current view
  const getVisibleArticleIds = useCallback(() => {
    if (viewType === "starred") {
      return Object.values(articles)
        .filter((a) => a.isStarred)
        .sort((a, b) => b.publishedAt - a.publishedAt)
        .map((a) => a.id);
    }

    if (viewType === "readLater") {
      return Object.values(articles)
        .filter((a) => a.isReadLater)
        .sort((a, b) => (b.readLaterAddedAt || b.publishedAt) - (a.readLaterAddedAt || a.publishedAt))
        .map((a) => a.id);
    }

    if (viewType === "feed" && selectedFeedId) {
      return articlesByFeed[selectedFeedId] || [];
    }

    if (viewType === "folder" && selectedFolderId) {
      const folderFeeds = feedOrder[selectedFolderId] || [];
      return folderFeeds
        .flatMap((feedId) => articlesByFeed[feedId] || [])
        .map((id) => articles[id])
        .filter(Boolean)
        .sort((a, b) => b.publishedAt - a.publishedAt)
        .map((a) => a.id);
    }

    return Object.values(articles)
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .map((a) => a.id);
  }, [viewType, selectedFeedId, selectedFolderId, articles, articlesByFeed, feedOrder]);

  const navigateToNext = useCallback(() => {
    const visibleArticleIds = getVisibleArticleIds();
    const currentIndex = selectedArticleId
      ? visibleArticleIds.indexOf(selectedArticleId)
      : -1;

    const nextIndex = currentIndex === -1 ? 0 : currentIndex + 1;
    if (nextIndex < visibleArticleIds.length) {
      const nextId = visibleArticleIds[nextIndex];
      selectArticle(nextId);
      if (markAsReadOnSelect) {
        markAsRead(nextId);
      }
    }
  }, [getVisibleArticleIds, selectedArticleId, selectArticle, markAsRead, markAsReadOnSelect]);

  const navigateToPrevious = useCallback(() => {
    const visibleArticleIds = getVisibleArticleIds();
    const currentIndex = selectedArticleId
      ? visibleArticleIds.indexOf(selectedArticleId)
      : -1;

    if (currentIndex > 0) {
      selectArticle(visibleArticleIds[currentIndex - 1]);
    }
  }, [getVisibleArticleIds, selectedArticleId, selectArticle]);

  const closeArticle = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      setMobilePanel("list");
    }
  }, [onClose, setMobilePanel]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      currentDeltaX.current = 0;
      currentDeltaY.current = 0;
      swipeDirection.current = null;
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;

      // Determine swipe direction if not yet set
      if (swipeDirection.current === null) {
        if (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15) {
          swipeDirection.current = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
        }
      }

      if (swipeDirection.current === null) return;

      currentDeltaX.current = deltaX;
      currentDeltaY.current = deltaY;

      // Only track downward swipes for vertical
      if (swipeDirection.current === "vertical") {
        if (deltaY > 0) {
          const progress = Math.min(deltaY / 150, 1);
          setSwipeState({
            isSwiping: true,
            direction: "down",
            progress,
          });
        }
      } else {
        // Horizontal swipes
        const direction = deltaX > 0 ? "right" : "left";
        const progress = Math.min(Math.abs(deltaX) / 100, 1);
        setSwipeState({
          isSwiping: true,
          direction,
          progress,
        });
      }
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled) return;

    const HORIZONTAL_THRESHOLD = 80;
    const VERTICAL_THRESHOLD = 100;

    if (swipeDirection.current === "horizontal") {
      if (currentDeltaX.current < -HORIZONTAL_THRESHOLD) {
        // Swiped left - next article
        navigateToNext();
      } else if (currentDeltaX.current > HORIZONTAL_THRESHOLD) {
        // Swiped right - previous article
        navigateToPrevious();
      }
    } else if (swipeDirection.current === "vertical") {
      if (currentDeltaY.current > VERTICAL_THRESHOLD) {
        // Swiped down - close article
        closeArticle();
      }
    }

    // Reset state
    setSwipeState({
      isSwiping: false,
      direction: null,
      progress: 0,
    });
    currentDeltaX.current = 0;
    currentDeltaY.current = 0;
    swipeDirection.current = null;
  }, [enabled, navigateToNext, navigateToPrevious, closeArticle]);

  return {
    swipeState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    navigateToNext,
    navigateToPrevious,
    closeArticle,
  };
}
