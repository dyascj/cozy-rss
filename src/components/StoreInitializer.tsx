"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { useTagStore } from "@/stores/tagStore";
import { useSettingsStore } from "@/stores/settingsStore";

interface StoreInitializerProps {
  children: React.ReactNode;
}

export function StoreInitializer({ children }: StoreInitializerProps) {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading: authLoading, checkSession, sessionChecked } = useAuthStore();
  const initializeFeeds = useFeedStore((s) => s.initialize);
  const initializeArticles = useArticleStore((s) => s.initialize);
  const initializeTags = useTagStore((s) => s.initialize);
  const initializeSettings = useSettingsStore((s) => s.initialize);

  const feedsInitialized = useFeedStore((s) => s.isInitialized);
  const articlesInitialized = useArticleStore((s) => s.isInitialized);
  const tagsInitialized = useTagStore((s) => s.isInitialized);
  const settingsInitialized = useSettingsStore((s) => s.isInitialized);

  // Check session on mount
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When not authenticated and session check is done, check if setup is needed
  useEffect(() => {
    if (sessionChecked && !isAuthenticated && !authLoading) {
      fetch("/api/auth/setup")
        .then((res) => res.json())
        .then((data) => {
          if (data.needsSetup) {
            window.location.href = "/setup";
          }
          // If needsSetup is false, middleware handles redirect to /signin
        })
        .catch((err) => {
          console.error("Failed to check setup status:", err);
        });
    }
  }, [sessionChecked, isAuthenticated, authLoading]);

  // Initialize stores when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
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
    initializeFeeds,
    initializeArticles,
    initializeTags,
    initializeSettings,
  ]);

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
