"use client";

import { useEffect, useCallback } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useArticleStore } from "@/stores/articleStore";
import { useFeedStore } from "@/stores/feedStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useSearchStore } from "@/stores/searchStore";

export function useKeyboardNavigation() {
  const {
    selectedArticleId,
    selectArticle,
    selectedFeedId,
    selectedFolderId,
    viewType,
  } = useUIStore();

  const { articles, articlesByFeed, markAsRead, toggleStarred, toggleReadLater } =
    useArticleStore();
  const { feedOrder } = useFeedStore();
  const { markAsReadOnSelect } = useSettingsStore();
  const { setSearchActive, isSearchActive } = useSearchStore();

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

    // All articles
    return Object.values(articles)
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .map((a) => a.id);
  }, [
    viewType,
    selectedFeedId,
    selectedFolderId,
    articles,
    articlesByFeed,
    feedOrder,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const visibleArticleIds = getVisibleArticleIds();
      const currentIndex = selectedArticleId
        ? visibleArticleIds.indexOf(selectedArticleId)
        : -1;

      switch (e.key.toLowerCase()) {
        case "j":
        case "arrowdown": {
          e.preventDefault();
          const nextIndex =
            currentIndex === -1 ? 0 : Math.min(currentIndex + 1, visibleArticleIds.length - 1);
          if (visibleArticleIds[nextIndex]) {
            const nextId = visibleArticleIds[nextIndex];
            selectArticle(nextId);
            if (markAsReadOnSelect) {
              markAsRead(nextId);
            }
          }
          break;
        }

        case "k":
        case "arrowup": {
          e.preventDefault();
          if (currentIndex > 0) {
            selectArticle(visibleArticleIds[currentIndex - 1]);
          }
          break;
        }

        case "s": {
          if (selectedArticleId) {
            e.preventDefault();
            toggleStarred(selectedArticleId);
          }
          break;
        }

        case "l": {
          if (selectedArticleId) {
            e.preventDefault();
            toggleReadLater(selectedArticleId);
          }
          break;
        }

        case "m": {
          if (selectedArticleId) {
            e.preventDefault();
            const article = articles[selectedArticleId];
            if (article) {
              if (article.isRead) {
                useArticleStore.getState().markAsUnread(selectedArticleId);
              } else {
                markAsRead(selectedArticleId);
              }
            }
          }
          break;
        }

        case "o":
        case "enter": {
          if (selectedArticleId) {
            e.preventDefault();
            const article = articles[selectedArticleId];
            if (article?.link) {
              window.open(article.link, "_blank", "noopener,noreferrer");
            }
          }
          break;
        }

        case "r": {
          e.preventDefault();
          // Trigger refresh (handled by useFeedRefresh hook)
          window.dispatchEvent(new CustomEvent("refresh-feeds"));
          break;
        }

        case "/": {
          e.preventDefault();
          setSearchActive(true);
          break;
        }

        case "escape": {
          if (isSearchActive) {
            e.preventDefault();
            setSearchActive(false);
          }
          break;
        }
      }
    },
    [
      selectedArticleId,
      getVisibleArticleIds,
      selectArticle,
      markAsRead,
      markAsReadOnSelect,
      toggleStarred,
      toggleReadLater,
      setSearchActive,
      isSearchActive,
      articles,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
