"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { useTagStore } from "@/stores/tagStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { MigrationPrompt } from "@/components/auth/MigrationPrompt";

interface StoreInitializerProps {
  children: React.ReactNode;
}

export function StoreInitializer({ children }: StoreInitializerProps) {
  const [isReady, setIsReady] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const { isAuthenticated, isLoading: authLoading, checkSession } = useAuthStore();
  const initializeFeeds = useFeedStore((s) => s.initialize);
  const initializeArticles = useArticleStore((s) => s.initialize);
  const initializeTags = useTagStore((s) => s.initialize);
  const initializeSettings = useSettingsStore((s) => s.initialize);
  const resetFeeds = useFeedStore((s) => s.reset);
  const resetArticles = useArticleStore((s) => s.reset);
  const resetTags = useTagStore((s) => s.reset);
  const resetSettings = useSettingsStore((s) => s.reset);

  const feedsInitialized = useFeedStore((s) => s.isInitialized);
  const articlesInitialized = useArticleStore((s) => s.isInitialized);
  const tagsInitialized = useTagStore((s) => s.isInitialized);
  const settingsInitialized = useSettingsStore((s) => s.isInitialized);

  const feedsCount = useFeedStore((s) => Object.keys(s.feeds).length);

  // Check session on mount
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for localStorage data when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading && !migrationComplete) {
      // Check if there's localStorage data to migrate
      const hasLocalData = typeof window !== "undefined" && (
        localStorage.getItem("rss-reader-feeds") ||
        localStorage.getItem("rss-reader-articles") ||
        localStorage.getItem("rss-reader-tags")
      );

      if (hasLocalData) {
        setShowMigration(true);
      } else {
        setMigrationComplete(true);
      }
    }
  }, [isAuthenticated, authLoading, migrationComplete]);

  // Initialize stores when authenticated and migration is complete
  useEffect(() => {
    if (isAuthenticated && !authLoading && migrationComplete) {
      Promise.all([
        initializeFeeds(),
        initializeArticles(),
        initializeTags(),
        initializeSettings(),
      ]).then(() => {
        setIsReady(true);
      });
    }
  }, [
    isAuthenticated,
    authLoading,
    migrationComplete,
    initializeFeeds,
    initializeArticles,
    initializeTags,
    initializeSettings,
  ]);

  const handleMigrationComplete = useCallback(() => {
    setShowMigration(false);
    setMigrationComplete(true);
    // Reset stores so they fetch fresh data from API after migration
    resetFeeds();
    resetArticles();
    resetTags();
    resetSettings();
  }, [resetFeeds, resetArticles, resetTags, resetSettings]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-cream-50 dark:bg-taupe-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-taupe-600 dark:text-taupe-400 text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, still render children (middleware will redirect)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Show migration prompt if needed
  if (showMigration) {
    return (
      <div className="h-screen w-screen bg-cream-50 dark:bg-taupe-900">
        <MigrationPrompt onComplete={handleMigrationComplete} />
      </div>
    );
  }

  // Wait for all stores to initialize
  if (!isReady || !feedsInitialized || !articlesInitialized || !tagsInitialized || !settingsInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-cream-50 dark:bg-taupe-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-taupe-600 dark:text-taupe-400 text-sm">
            Loading your feeds...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
