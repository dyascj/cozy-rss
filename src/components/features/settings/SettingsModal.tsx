"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUIStore } from "@/stores/uiStore";
import { useSettingsStore, Theme, SwipeAction } from "@/stores/settingsStore";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { parseOPML, flattenOPML } from "@/lib/opml/parser";
import { downloadOPML } from "@/lib/opml/generator";
import { fetchAndParseFeed } from "@/lib/feed-parser";
import { DoodleClose, DoodleSun, DoodleMoon, DoodleMonitor, DoodleUpload, DoodleDownload, DoodleLoader } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

export function SettingsModal() {
  const { isSettingsModalOpen, closeSettingsModal } = useUIStore();
  const {
    theme,
    setTheme,
    markAsReadOnSelect,
    setMarkAsReadOnSelect,
    swipeEnabled,
    setSwipeEnabled,
    swipeLeftAction,
    setSwipeLeftAction,
    swipeRightAction,
    setSwipeRightAction,
  } = useSettingsStore();
  const { feeds, folders, feedOrder, addFeed, addFolder } = useFeedStore();
  const { addArticles } = useArticleStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <DoodleSun size="sm" /> },
    { value: "dark", label: "Dark", icon: <DoodleMoon size="sm" /> },
    { value: "system", label: "System", icon: <DoodleMonitor size="sm" /> },
  ];

  const swipeActions: { value: SwipeAction; label: string }[] = [
    { value: "markRead", label: "Mark as Read" },
    { value: "star", label: "Star" },
    { value: "readLater", label: "Read Later" },
    { value: "none", label: "None" },
  ];

  const handleExport = () => {
    downloadOPML(feeds, folders, feedOrder);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus("Reading file...");

    try {
      const text = await file.text();
      const outlines = parseOPML(text);
      const flatFeeds = flattenOPML(outlines);

      if (flatFeeds.length === 0) {
        throw new Error("No feeds found in OPML file");
      }

      setImportStatus(`Found ${flatFeeds.length} feeds. Importing...`);

      // Create folders first
      const folderMap: Record<string, string> = {};
      const uniqueFolders = [...new Set(flatFeeds.map((f) => f.folderName).filter(Boolean))];

      for (const folderName of uniqueFolders) {
        if (folderName) {
          const existingFolder = Object.values(folders).find(
            (f) => f.name.toLowerCase() === folderName.toLowerCase()
          );
          if (existingFolder) {
            folderMap[folderName] = existingFolder.id;
          } else {
            const newFolderId = await addFolder(folderName);
            if (newFolderId) {
              folderMap[folderName] = newFolderId;
            }
          }
        }
      }

      // Import feeds
      let imported = 0;
      let failed = 0;

      for (const feedData of flatFeeds) {
        // Check if feed already exists
        const existingFeed = Object.values(feeds).find(
          (f) => f.url.toLowerCase() === feedData.url.toLowerCase()
        );
        if (existingFeed) {
          continue;
        }

        try {
          setImportStatus(`Importing ${feedData.title}... (${imported + 1}/${flatFeeds.length})`);

          const parsed = await fetchAndParseFeed(feedData.url);
          const folderId = feedData.folderName ? folderMap[feedData.folderName] : null;

          const feedId = await addFeed({
            url: feedData.url,
            title: parsed.title || feedData.title,
            description: parsed.description,
            siteUrl: parsed.siteUrl || feedData.siteUrl,
            iconUrl: parsed.iconUrl,
            folderId,
            lastFetched: Date.now(),
          });

          if (!feedId) {
            throw new Error("Failed to add feed");
          }

          addArticles(
            feedId,
            parsed.items.map((item) => ({
              feedId,
              guid: item.guid,
              title: item.title,
              link: item.link,
              author: item.author,
              summary: item.summary,
              content: item.content,
              publishedAt: item.publishedAt,
              fetchedAt: Date.now(),
              isRead: false,
              isStarred: false,
              isReadLater: false,
              imageUrl: item.imageUrl,
            }))
          );

          imported++;
        } catch {
          failed++;
        }
      }

      setImportStatus(
        `Import complete! ${imported} feeds imported${failed > 0 ? `, ${failed} failed` : ""}`
      );
    } catch (error) {
      setImportStatus(
        `Error: ${error instanceof Error ? error.message : "Failed to import"}`
      );
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog.Root open={isSettingsModalOpen} onOpenChange={closeSettingsModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-cream-300 dark:border-charcoal-700 rounded-2xl shadow-warm p-6 max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Title className="text-lg font-semibold mb-6">
            Settings
          </Dialog.Title>

          <div className="space-y-6">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium mb-3">Theme</label>
              <div className="flex gap-2">
                {themes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all",
                      theme === t.value
                        ? "bg-sage-500 text-cream-50 shadow-soft"
                        : "bg-cream-200 dark:bg-charcoal-700 hover:bg-cream-300 dark:hover:bg-charcoal-600"
                    )}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mark as read on select */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">
                  Mark as read on select
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically mark articles as read when selected
                </p>
              </div>
              <button
                onClick={() => setMarkAsReadOnSelect(!markAsReadOnSelect)}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors",
                  markAsReadOnSelect ? "bg-sage-500" : "bg-cream-300 dark:bg-charcoal-600"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                    markAsReadOnSelect && "translate-x-5"
                  )}
                />
              </button>
            </div>

            {/* Swipe Gestures */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-sm font-medium">Swipe Gestures</label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Swipe articles on touch devices
                  </p>
                </div>
                <button
                  onClick={() => setSwipeEnabled(!swipeEnabled)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    swipeEnabled ? "bg-sage-500" : "bg-cream-300 dark:bg-charcoal-600"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                      swipeEnabled && "translate-x-5"
                    )}
                  />
                </button>
              </div>

              {swipeEnabled && (
                <div className="space-y-3 pl-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Swipe Right</span>
                    <select
                      value={swipeRightAction}
                      onChange={(e) => setSwipeRightAction(e.target.value as SwipeAction)}
                      className="text-sm bg-cream-100 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-500/50"
                    >
                      {swipeActions.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Swipe Left</span>
                    <select
                      value={swipeLeftAction}
                      onChange={(e) => setSwipeLeftAction(e.target.value as SwipeAction)}
                      className="text-sm bg-cream-100 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-500/50"
                    >
                      {swipeActions.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* OPML Import/Export */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Import / Export
              </label>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".opml,.xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={handleImportClick}
                  disabled={isImporting}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm bg-cream-200 dark:bg-charcoal-700 hover:bg-cream-300 dark:hover:bg-charcoal-600 transition-colors disabled:opacity-50"
                >
                  {isImporting ? (
                    <span className="animate-spin">
                      <DoodleLoader size="sm" />
                    </span>
                  ) : (
                    <DoodleUpload size="sm" />
                  )}
                  Import OPML
                </button>
                <button
                  onClick={handleExport}
                  disabled={Object.keys(feeds).length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm bg-cream-200 dark:bg-charcoal-700 hover:bg-cream-300 dark:hover:bg-charcoal-600 transition-colors disabled:opacity-50"
                >
                  <DoodleDownload size="sm" />
                  Export OPML
                </button>
              </div>
              {importStatus && (
                <p className="text-xs text-muted-foreground mt-2">
                  {importStatus}
                </p>
              )}
            </div>

            {/* Keyboard shortcuts info */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Keyboard Shortcuts
              </label>
              <div className="bg-cream-100 dark:bg-charcoal-800 rounded-xl p-3 text-sm space-y-2 border border-cream-200 dark:border-charcoal-700">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next article</span>
                  <kbd className="px-2 py-0.5 bg-background rounded text-xs">
                    J / ↓
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previous article</span>
                  <kbd className="px-2 py-0.5 bg-background rounded text-xs">
                    K / ↑
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Star article</span>
                  <kbd className="px-2 py-0.5 bg-background rounded text-xs">
                    S
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Read Later</span>
                  <kbd className="px-2 py-0.5 bg-background rounded text-xs">
                    L
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mark read/unread</span>
                  <kbd className="px-2 py-0.5 bg-background rounded text-xs">
                    M
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open in browser</span>
                  <kbd className="px-2 py-0.5 bg-background rounded text-xs">
                    O / Enter
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Search</span>
                  <kbd className="px-2 py-0.5 bg-background rounded text-xs">
                    /
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refresh feeds</span>
                  <kbd className="px-2 py-0.5 bg-background rounded text-xs">
                    R
                  </kbd>
                </div>
              </div>
            </div>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-700 transition-colors"
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
