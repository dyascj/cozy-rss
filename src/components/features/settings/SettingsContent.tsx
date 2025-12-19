"use client";

import { useRef, useState } from "react";
import { useSettingsStore, ThemeMode, SwipeAction } from "@/stores/settingsStore";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { parseOPML, flattenOPML } from "@/lib/opml/parser";
import { downloadOPML } from "@/lib/opml/generator";
import { fetchAndParseFeed } from "@/lib/feed-parser";
import {
  LIGHT_THEMES,
  DARK_THEMES,
  generateThemeFromAccent,
  Theme as ColorTheme,
} from "@/lib/themes";
import { DoodleSun, DoodleMoon, DoodleMonitor, DoodleUpload, DoodleDownload, DoodleLoader, DoodlePlus, DoodleTrash } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

interface SettingsContentProps {
  showKeyboardShortcuts?: boolean;
}

export function SettingsContent({ showKeyboardShortcuts = true }: SettingsContentProps) {
  const {
    themeMode,
    setThemeMode,
    activeThemeId,
    setActiveTheme,
    customThemes,
    addCustomTheme,
    removeCustomTheme,
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
  const [showCustomThemeCreator, setShowCustomThemeCreator] = useState(false);
  const [customAccentColor, setCustomAccentColor] = useState("#829F7B");
  const [customThemeName, setCustomThemeName] = useState("");
  const [customThemeIsDark, setCustomThemeIsDark] = useState(false);

  const themeModes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <DoodleSun size="sm" /> },
    { value: "dark", label: "Dark", icon: <DoodleMoon size="sm" /> },
    { value: "system", label: "System", icon: <DoodleMonitor size="sm" /> },
  ];

  const handleCreateCustomTheme = () => {
    if (!customThemeName.trim()) return;
    if (customThemes.length >= 3) return;

    const newTheme = generateThemeFromAccent(
      customAccentColor,
      customThemeIsDark,
      customThemeName.trim()
    );
    addCustomTheme(newTheme);
    setActiveTheme(newTheme.id);
    setShowCustomThemeCreator(false);
    setCustomThemeName("");
    setCustomAccentColor("#829F7B");
  };

  const getThemePreviewStyle = (theme: ColorTheme) => {
    const [bgR, bgG, bgB] = theme.colors.background.split(" ");
    const [accentR, accentG, accentB] = theme.colors.accent.split(" ");
    return {
      background: `rgb(${bgR}, ${bgG}, ${bgB})`,
      accent: `rgb(${accentR}, ${accentG}, ${accentB})`,
    };
  };

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

      let imported = 0;
      let failed = 0;

      for (const feedData of flatFeeds) {
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Appearance Section */}
      <div>
        <label className="block text-sm font-medium mb-3">Appearance</label>

        {/* Theme Mode Toggle */}
        <div className="flex gap-2 mb-4">
          {themeModes.map((t) => (
            <button
              key={t.value}
              onClick={() => setThemeMode(t.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all",
                themeMode === t.value
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-cream-200 dark:bg-charcoal-700 hover:bg-cream-300 dark:hover:bg-charcoal-600"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Theme Gallery */}
        <div className="space-y-3">
          {/* Light Themes */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Light Themes</p>
            <div className="grid grid-cols-4 gap-2">
              {LIGHT_THEMES.map((theme) => {
                const preview = getThemePreviewStyle(theme);
                const isActive = activeThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme.id)}
                    className={cn(
                      "relative p-1 rounded-lg transition-all",
                      isActive
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                        : "hover:ring-1 hover:ring-border"
                    )}
                    title={theme.name}
                  >
                    <div
                      className="h-10 rounded-md flex items-end justify-center pb-1 overflow-hidden"
                      style={{ backgroundColor: preview.background }}
                    >
                      <div
                        className="w-6 h-2 rounded-full"
                        style={{ backgroundColor: preview.accent }}
                      />
                    </div>
                    <p className="text-[10px] text-center mt-1 truncate">{theme.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dark Themes */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Dark Themes</p>
            <div className="grid grid-cols-4 gap-2">
              {DARK_THEMES.map((theme) => {
                const preview = getThemePreviewStyle(theme);
                const isActive = activeThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme.id)}
                    className={cn(
                      "relative p-1 rounded-lg transition-all",
                      isActive
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                        : "hover:ring-1 hover:ring-border"
                    )}
                    title={theme.name}
                  >
                    <div
                      className="h-10 rounded-md flex items-end justify-center pb-1 overflow-hidden"
                      style={{ backgroundColor: preview.background }}
                    >
                      <div
                        className="w-6 h-2 rounded-full"
                        style={{ backgroundColor: preview.accent }}
                      />
                    </div>
                    <p className="text-[10px] text-center mt-1 truncate">{theme.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Themes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Custom Themes</p>
              {customThemes.length < 3 && (
                <button
                  onClick={() => setShowCustomThemeCreator(!showCustomThemeCreator)}
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  <DoodlePlus size="xs" />
                  Create
                </button>
              )}
            </div>

            {/* Custom Theme Creator */}
            {showCustomThemeCreator && (
              <div className="bg-muted/50 rounded-lg p-3 mb-2 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customThemeName}
                    onChange={(e) => setCustomThemeName(e.target.value)}
                    placeholder="Theme name"
                    className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/50"
                    maxLength={20}
                  />
                  <input
                    type="color"
                    value={customAccentColor}
                    onChange={(e) => setCustomAccentColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-border"
                    title="Accent color"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={customThemeIsDark}
                      onChange={(e) => setCustomThemeIsDark(e.target.checked)}
                      className="rounded accent-accent"
                    />
                    Dark mode base
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCustomThemeCreator(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateCustomTheme}
                      disabled={!customThemeName.trim()}
                      className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-lg disabled:opacity-50"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Themes List */}
            {customThemes.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {customThemes.map((theme) => {
                  const preview = getThemePreviewStyle(theme);
                  const isActive = activeThemeId === theme.id;
                  return (
                    <div key={theme.id} className="relative group">
                      <button
                        onClick={() => setActiveTheme(theme.id)}
                        className={cn(
                          "w-full relative p-1 rounded-lg transition-all",
                          isActive
                            ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                            : "hover:ring-1 hover:ring-border"
                        )}
                        title={theme.name}
                      >
                        <div
                          className="h-10 rounded-md flex items-end justify-center pb-1 overflow-hidden"
                          style={{ backgroundColor: preview.background }}
                        >
                          <div
                            className="w-6 h-2 rounded-full"
                            style={{ backgroundColor: preview.accent }}
                          />
                        </div>
                        <p className="text-[10px] text-center mt-1 truncate">{theme.name}</p>
                      </button>
                      <button
                        onClick={() => removeCustomTheme(theme.id)}
                        className="absolute -top-1 -right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete theme"
                      >
                        <DoodleTrash size="xs" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              !showCustomThemeCreator && (
                <p className="text-xs text-muted-foreground/70 italic">
                  No custom themes yet
                </p>
              )
            )}
          </div>
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
      {showKeyboardShortcuts && (
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
      )}
    </div>
  );
}
