"use client";

import { useMemo } from "react";
import { useArticleStore, Article } from "@/stores/articleStore";
import { useSearchStore } from "@/stores/searchStore";
import { useUIStore } from "@/stores/uiStore";
import { useFeedStore } from "@/stores/feedStore";
import { stripHtml } from "@/utils/sanitize";

export interface SearchResult {
  article: Article;
  matches: {
    title: boolean;
    content: boolean;
  };
}

export function useArticleSearch() {
  const { articles, articlesByFeed } = useArticleStore();
  const { query, isSearchActive, searchScope } = useSearchStore();
  const { viewType, selectedFeedId, selectedFolderId } = useUIStore();
  const { feedOrder } = useFeedStore();

  const searchResults = useMemo(() => {
    if (!isSearchActive || !query.trim()) {
      return null;
    }

    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Get articles to search based on scope
    let articlesToSearch: Article[];

    if (searchScope === "current") {
      // Search only current view
      if (viewType === "feed" && selectedFeedId) {
        const ids = articlesByFeed[selectedFeedId] || [];
        articlesToSearch = ids.map((id) => articles[id]).filter(Boolean);
      } else if (viewType === "folder" && selectedFolderId) {
        const folderFeeds = feedOrder[selectedFolderId] || [];
        articlesToSearch = folderFeeds
          .flatMap((feedId) => (articlesByFeed[feedId] || []).map((id) => articles[id]))
          .filter(Boolean);
      } else if (viewType === "starred") {
        articlesToSearch = Object.values(articles).filter((a) => a.isStarred);
      } else if (viewType === "readLater") {
        articlesToSearch = Object.values(articles).filter((a) => a.isReadLater);
      } else {
        articlesToSearch = Object.values(articles);
      }
    } else {
      // Search all articles
      articlesToSearch = Object.values(articles);
    }

    // Search each article
    for (const article of articlesToSearch) {
      const titleMatch = article.title.toLowerCase().includes(searchTerm);
      const contentText = stripHtml(article.content || article.summary || "").toLowerCase();
      const contentMatch = contentText.includes(searchTerm);

      if (titleMatch || contentMatch) {
        results.push({
          article,
          matches: {
            title: titleMatch,
            content: contentMatch,
          },
        });
      }
    }

    // Sort by date (newest first)
    results.sort((a, b) => b.article.publishedAt - a.article.publishedAt);

    return results;
  }, [
    isSearchActive,
    query,
    searchScope,
    articles,
    articlesByFeed,
    viewType,
    selectedFeedId,
    selectedFolderId,
    feedOrder,
  ]);

  return {
    searchResults,
    resultCount: searchResults?.length ?? 0,
    isSearching: isSearchActive && query.trim().length > 0,
  };
}

/**
 * Highlight search term in text
 */
export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;

  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, "gi");
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>');
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
