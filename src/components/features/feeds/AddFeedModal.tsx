"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUIStore } from "@/stores/uiStore";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { fetchAndParseFeed } from "@/lib/feed-parser";
import { DoodleClose, DoodleLoader, DoodleRss } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

export function AddFeedModal() {
  const { isAddFeedModalOpen, closeAddFeedModal, selectFeed } = useUIStore();
  const { addFeed, folders, folderOrder } = useFeedStore();
  const { fetchArticlesForFeed } = useArticleStore();

  const [url, setUrl] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    title: string;
    description?: string;
    itemCount: number;
  } | null>(null);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError(null);
    setPreview(null);
  };

  const handlePreview = async () => {
    if (!url.trim()) {
      setError("Please enter a feed URL");
      return;
    }

    let feedUrl = url.trim();
    if (!feedUrl.startsWith("http://") && !feedUrl.startsWith("https://")) {
      feedUrl = "https://" + feedUrl;
      setUrl(feedUrl);
    }

    setIsLoading(true);
    setError(null);

    try {
      const feed = await fetchAndParseFeed(feedUrl);
      setPreview({
        title: feed.title,
        description: feed.description,
        itemCount: feed.items.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch feed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!preview) {
      await handlePreview();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const feedId = await addFeed({
        url,
        title: preview.title,
        description: preview.description,
        folderId: selectedFolderId,
        lastFetched: Date.now(),
      });

      if (!feedId) {
        throw new Error("Failed to add feed");
      }

      // Load server-created articles into client store
      await fetchArticlesForFeed(feedId);

      // Select the new feed so user sees articles immediately
      selectFeed(feedId);

      setUrl("");
      setSelectedFolderId(null);
      setPreview(null);
      closeAddFeedModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add feed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setSelectedFolderId(null);
    setPreview(null);
    setError(null);
    closeAddFeedModal();
  };

  return (
    <Dialog.Root open={isAddFeedModalOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-cream-300 dark:border-charcoal-700 rounded-2xl shadow-warm p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Add Feed
          </Dialog.Title>

          <form onSubmit={handleSubmit}>
            {/* URL Input */}
            <div className="mb-4">
              <label
                htmlFor="feed-url"
                className="block text-sm font-medium mb-1.5"
              >
                Feed URL
              </label>
              <div className="flex gap-2">
                <input
                  id="feed-url"
                  type="text"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  className="flex-1 px-3 py-2 text-sm bg-cream-100 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/50 focus:border-sage-400"
                  disabled={isLoading}
                />
                {!preview && (
                  <button
                    type="button"
                    onClick={handlePreview}
                    disabled={isLoading || !url.trim()}
                    className="px-3 py-2 text-sm bg-cream-200 dark:bg-charcoal-700 hover:bg-cream-300 dark:hover:bg-charcoal-600 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="animate-spin">
                        <DoodleLoader size="sm" />
                      </span>
                    ) : (
                      "Preview"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                {error}
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="mb-4 p-4 bg-cream-100 dark:bg-charcoal-800 rounded-xl border border-cream-200 dark:border-charcoal-700">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-sage-100 dark:bg-sage-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sage-600 dark:text-sage-400">
                      <DoodleRss size="md" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {preview.title}
                    </h3>
                    {preview.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {preview.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {preview.itemCount} articles
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Folder Selection */}
            {preview && folderOrder.length > 0 && (
              <div className="mb-4">
                <label
                  htmlFor="folder"
                  className="block text-sm font-medium mb-1.5"
                >
                  Add to folder (optional)
                </label>
                <select
                  id="folder"
                  value={selectedFolderId || ""}
                  onChange={(e) =>
                    setSelectedFolderId(e.target.value || null)
                  }
                  className="w-full px-3 py-2 text-sm bg-cream-100 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/50"
                >
                  <option value="">No folder</option>
                  {folderOrder.map((folderId) => (
                    <option key={folderId} value={folderId}>
                      {folders[folderId]?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm rounded-xl hover:bg-cream-200 dark:hover:bg-charcoal-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || (!preview && !url.trim())}
                className={cn(
                  "px-4 py-2 text-sm rounded-xl transition-all",
                  "bg-sage-500 text-cream-50 hover:bg-sage-600 shadow-soft",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <span className="animate-spin">
                    <DoodleLoader size="sm" />
                  </span>
                ) : preview ? (
                  "Add Feed"
                ) : (
                  "Preview"
                )}
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-700 transition-colors"
              aria-label="Close"
            >
              <DoodleClose size="sm" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
