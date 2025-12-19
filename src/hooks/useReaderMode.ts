"use client";

import { useCallback, useEffect } from "react";
import { useArticleStore, ReaderContent } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";

interface ExtractedArticle {
  title: string;
  content: string;
  excerpt: string | null;
  byline: string | null;
  siteName: string | null;
  length: number;
}

interface UseReaderModeReturn {
  isReaderMode: boolean;
  toggleReaderMode: () => void;
  isLoading: boolean;
  error: string | null;
  readerContent: ReaderContent | null;
  fetchReaderContent: () => Promise<void>;
}

export function useReaderMode(
  articleId: string | null,
  articleLink: string | null
): UseReaderModeReturn {
  const { articles, setReaderContent, setReaderError } = useArticleStore();
  const {
    readerModeEnabled,
    toggleReaderMode,
    loadingReaderContent,
    setLoadingReaderContent,
  } = useUIStore();

  const article = articleId ? articles[articleId] : null;
  const isLoading = articleId ? loadingReaderContent[articleId] ?? false : false;
  const error = article?.readerError ?? null;
  const readerContent = article?.readerContent ?? null;

  const fetchReaderContent = useCallback(async () => {
    if (!articleId || !articleLink) return;

    // Skip if already loaded or currently loading
    if (readerContent || isLoading) return;

    setLoadingReaderContent(articleId, true);

    try {
      const response = await fetch(
        `/api/extract-article?url=${encodeURIComponent(articleLink)}`
      );

      const data = await response.json();

      if (!data.success) {
        setReaderError(articleId, data.error || "Failed to extract article");
        return;
      }

      const extracted: ExtractedArticle = data.data;
      setReaderContent(articleId, {
        content: extracted.content,
        excerpt: extracted.excerpt,
        byline: extracted.byline,
        fetchedAt: Date.now(),
      });
    } catch (err) {
      setReaderError(
        articleId,
        err instanceof Error ? err.message : "Failed to extract article"
      );
    } finally {
      setLoadingReaderContent(articleId, false);
    }
  }, [
    articleId,
    articleLink,
    readerContent,
    isLoading,
    setLoadingReaderContent,
    setReaderContent,
    setReaderError,
  ]);

  // Auto-fetch when reader mode is enabled and article is selected
  useEffect(() => {
    if (readerModeEnabled && articleId && articleLink && !readerContent && !isLoading && !error) {
      fetchReaderContent();
    }
  }, [readerModeEnabled, articleId, articleLink, readerContent, isLoading, error, fetchReaderContent]);

  return {
    isReaderMode: readerModeEnabled,
    toggleReaderMode,
    isLoading,
    error,
    readerContent,
    fetchReaderContent,
  };
}
