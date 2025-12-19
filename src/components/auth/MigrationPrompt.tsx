"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DoodleUpload, DoodleTrash, DoodleX } from "@/components/ui/DoodleIcon";

interface LocalStorageData {
  feeds?: Record<string, unknown>;
  folders?: Record<string, unknown>;
  articles?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  articleTags?: Record<string, string[]>;
  settings?: Record<string, unknown>;
}

function getLocalStorageData(): LocalStorageData | null {
  if (typeof window === "undefined") return null;

  try {
    const data: LocalStorageData = {};
    let hasData = false;

    // Check for feeds
    const feedsStr = localStorage.getItem("rss-reader-feeds");
    if (feedsStr) {
      const feeds = JSON.parse(feedsStr);
      if (feeds.state?.feeds && Object.keys(feeds.state.feeds).length > 0) {
        data.feeds = feeds.state.feeds;
        data.folders = feeds.state.folders;
        hasData = true;
      }
    }

    // Check for articles
    const articlesStr = localStorage.getItem("rss-reader-articles");
    if (articlesStr) {
      const articles = JSON.parse(articlesStr);
      if (articles.state?.articles && Object.keys(articles.state.articles).length > 0) {
        data.articles = articles.state.articles;
        hasData = true;
      }
    }

    // Check for tags
    const tagsStr = localStorage.getItem("rss-reader-tags");
    if (tagsStr) {
      const tags = JSON.parse(tagsStr);
      if (tags.state?.tags && Object.keys(tags.state.tags).length > 0) {
        data.tags = tags.state.tags;
        data.articleTags = tags.state.articleTags;
        hasData = true;
      }
    }

    // Check for settings
    const settingsStr = localStorage.getItem("rss-reader-settings");
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      if (settings.state) {
        data.settings = settings.state;
        hasData = true;
      }
    }

    return hasData ? data : null;
  } catch (error) {
    console.error("Error reading localStorage:", error);
    return null;
  }
}

function clearLocalStorageData() {
  localStorage.removeItem("rss-reader-feeds");
  localStorage.removeItem("rss-reader-articles");
  localStorage.removeItem("rss-reader-tags");
  localStorage.removeItem("rss-reader-settings");
}

interface MigrationPromptProps {
  onComplete: () => void;
}

export function MigrationPrompt({ onComplete }: MigrationPromptProps) {
  const [localData, setLocalData] = useState<LocalStorageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const data = getLocalStorageData();
    if (!data) {
      // No data to migrate, complete immediately
      onComplete();
    } else {
      setLocalData(data);
    }
  }, [onComplete]);

  const handleImport = async () => {
    if (!localData) return;

    setIsLoading(true);
    setError(null);

    try {
      // Transform data to match API format
      const migrateData = {
        feeds: localData.feeds,
        folders: localData.folders,
        articles: localData.articles,
        tags: localData.tags,
        articleTags: localData.articleTags,
        settings: localData.settings,
        // Extract read/starred/readLater from articles
        readArticles: localData.articles
          ? Object.entries(localData.articles)
              .filter(([, a]) => (a as { isRead?: boolean }).isRead)
              .map(([id]) => id)
          : [],
        starredArticles: localData.articles
          ? Object.entries(localData.articles)
              .filter(([, a]) => (a as { isStarred?: boolean }).isStarred)
              .map(([id]) => id)
          : [],
        readLaterArticles: localData.articles
          ? Object.entries(localData.articles)
              .filter(([, a]) => (a as { isReadLater?: boolean }).isReadLater)
              .map(([id]) => id)
          : [],
      };

      const res = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(migrateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Migration failed");
      }

      const result = await res.json();
      console.log("Migration result:", result);

      // Clear localStorage after successful migration
      clearLocalStorageData();

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err) {
      console.error("Migration error:", err);
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleDiscard = () => {
    clearLocalStorageData();
    onComplete();
  };

  if (!localData) {
    return null;
  }

  const feedCount = localData.feeds ? Object.keys(localData.feeds).length : 0;
  const folderCount = localData.folders ? Object.keys(localData.folders).length : 0;
  const articleCount = localData.articles ? Object.keys(localData.articles).length : 0;
  const tagCount = localData.tags ? Object.keys(localData.tags).length : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-cream-50 dark:bg-taupe-800 rounded-xl shadow-xl max-w-md w-full p-6"
        >
          {success ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto mb-4 bg-sage-100 dark:bg-sage-900/30 rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-8 h-8 text-sage-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
              <h3 className="text-xl font-medium text-taupe-900 dark:text-cream-100">
                Data Imported!
              </h3>
              <p className="text-taupe-600 dark:text-taupe-400 mt-2">
                Your data has been successfully imported.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-taupe-900 dark:text-cream-100">
                  Import Existing Data?
                </h2>
                <button
                  onClick={handleSkip}
                  className="p-2 rounded-lg hover:bg-taupe-100 dark:hover:bg-taupe-700 text-taupe-500"
                >
                  <DoodleX className="w-5 h-5" />
                </button>
              </div>

              <p className="text-taupe-600 dark:text-taupe-400 mb-4">
                We found existing data from a previous session. Would you like to
                import it to your new account?
              </p>

              <div className="bg-taupe-100 dark:bg-taupe-700/50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-taupe-700 dark:text-taupe-300 mb-2">
                  Data found:
                </h4>
                <ul className="space-y-1 text-sm text-taupe-600 dark:text-taupe-400">
                  {feedCount > 0 && <li>{feedCount} feed(s)</li>}
                  {folderCount > 0 && <li>{folderCount} folder(s)</li>}
                  {articleCount > 0 && <li>{articleCount} article(s)</li>}
                  {tagCount > 0 && <li>{tagCount} tag(s)</li>}
                </ul>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleImport}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-sage-600 hover:bg-sage-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <DoodleUpload className="w-5 h-5" />
                      Import Data
                    </>
                  )}
                </button>

                <button
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="w-full py-3 px-4 text-taupe-600 dark:text-taupe-400 hover:bg-taupe-100 dark:hover:bg-taupe-700 rounded-lg font-medium transition-colors"
                >
                  Skip for Now
                </button>

                <button
                  onClick={handleDiscard}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm transition-colors"
                >
                  <DoodleTrash className="w-4 h-4" />
                  Discard Old Data
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
