"use client";

import { useMemo, useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { cn } from "@/utils/cn";
import { formatRelativeDate } from "@/utils/date";
import { stripHtml, truncateText } from "@/utils/sanitize";
import { DoodleCheck, DoodleStar, DoodleSearch } from "@/components/ui/DoodleIcon";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { QuickActions } from "@/components/features/articles/QuickActions";
import { SearchBar } from "@/components/features/search/SearchBar";
import { useSearchStore } from "@/stores/searchStore";
import { useArticleSearch } from "@/hooks/useArticleSearch";
import { useTagStore } from "@/stores/tagStore";
import { SwipeableArticleItem } from "@/components/ui/SwipeableArticleItem";
import { FeedIcon } from "@/components/ui/FeedIcon";
import { ArticleThumbnail } from "@/components/ui/ArticleThumbnail";

// Extract YouTube video ID from URL
function getYouTubeThumbnail(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    }
  }
  return null;
}

interface ArticleListProps {
  hideHeader?: boolean;
}

export function ArticleList({ hideHeader }: ArticleListProps = {}) {
  const { feeds, folders } = useFeedStore();
  const { articles, articlesByFeed, markAllAsRead } = useArticleStore();
  const {
    viewType,
    viewMode,
    selectedFeedId,
    selectedFolderId,
    selectedTagId,
    selectedArticleId,
    selectArticle,
  } = useUIStore();
  const { tags, articleTags } = useTagStore();
  const { markAsReadOnSelect } = useSettingsStore();
  const { markAsRead } = useArticleStore();
  const [hoveredArticleId, setHoveredArticleId] = useState<string | null>(null);
  const { isSearchActive, setSearchActive } = useSearchStore();
  const { searchResults, resultCount, isSearching } = useArticleSearch();

  // Virtual scrolling refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { title, displayedArticles } = useMemo(() => {
    let title = "All Articles";
    let articleIds: string[] = [];

    if (viewType === "starred") {
      title = "Starred";
      articleIds = Object.values(articles)
        .filter((a) => a.isStarred)
        .sort((a, b) => b.publishedAt - a.publishedAt)
        .map((a) => a.id);
    } else if (viewType === "readLater") {
      title = "Read Later";
      articleIds = Object.values(articles)
        .filter((a) => a.isReadLater)
        .sort((a, b) => (b.readLaterAddedAt || b.publishedAt) - (a.readLaterAddedAt || a.publishedAt))
        .map((a) => a.id);
    } else if (viewType === "tag" && selectedTagId) {
      const tag = tags[selectedTagId];
      title = tag?.name || "Tag";
      // Get all articles with this tag
      const taggedArticleIds = Object.entries(articleTags)
        .filter(([_, tagIds]) => tagIds.includes(selectedTagId))
        .map(([articleId]) => articleId);
      articleIds = taggedArticleIds
        .filter((id) => articles[id])
        .sort((a, b) => {
          const articleA = articles[a];
          const articleB = articles[b];
          return (articleB?.publishedAt || 0) - (articleA?.publishedAt || 0);
        });
    } else if (viewType === "feed" && selectedFeedId) {
      const feed = feeds[selectedFeedId];
      title = feed?.title || "Feed";
      articleIds = articlesByFeed[selectedFeedId] || [];
    } else if (viewType === "folder" && selectedFolderId) {
      const folder = folders[selectedFolderId];
      title = folder?.name || "Folder";
      // Get all articles from all feeds in the folder
      const feedStore = useFeedStore.getState();
      const folderFeeds = feedStore.feedOrder[selectedFolderId] || [];
      const allArticleIds = folderFeeds.flatMap(
        (feedId) => articlesByFeed[feedId] || []
      );
      articleIds = allArticleIds.sort((a, b) => {
        const articleA = articles[a];
        const articleB = articles[b];
        return (articleB?.publishedAt || 0) - (articleA?.publishedAt || 0);
      });
    } else {
      // All articles
      articleIds = Object.values(articles)
        .sort((a, b) => b.publishedAt - a.publishedAt)
        .map((a) => a.id);
    }

    // Apply view mode filter
    let filtered = articleIds;
    if (viewMode === "unread") {
      filtered = articleIds.filter((id) => !articles[id]?.isRead);
    } else if (viewMode === "starred") {
      filtered = articleIds.filter((id) => articles[id]?.isStarred);
    }

    return {
      title,
      displayedArticles: filtered
        .map((id) => articles[id])
        .filter(Boolean),
    };
  }, [
    viewType,
    viewMode,
    selectedFeedId,
    selectedFolderId,
    selectedTagId,
    feeds,
    folders,
    articles,
    articlesByFeed,
    tags,
    articleTags,
  ]);

  // Use search results when searching
  const articlesToDisplay = isSearching && searchResults
    ? searchResults.map((r) => r.article)
    : displayedArticles;

  // Virtual scrolling
  const virtualizer = useVirtualizer({
    count: articlesToDisplay.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  const handleArticleClick = (articleId: string) => {
    selectArticle(articleId);
    if (markAsReadOnSelect) {
      markAsRead(articleId);
    }
  };

  const handleMarkAllRead = () => {
    if (viewType === "feed" && selectedFeedId) {
      markAllAsRead(selectedFeedId);
    } else if (viewType === "folder" && selectedFolderId) {
      const feedStore = useFeedStore.getState();
      const folderFeeds = feedStore.feedOrder[selectedFolderId] || [];
      folderFeeds.forEach((feedId) => markAllAsRead(feedId));
    } else {
      markAllAsRead();
    }
  };

  const unreadCount = articlesToDisplay.filter((a) => !a.isRead).length;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      {!hideHeader && (
        <div className="border-b border-border">
          {/* Main header row */}
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h2 className="font-semibold text-sm truncate">
                {isSearching ? "Search Results" : title}
              </h2>
              {!isSearching && unreadCount > 0 && (
                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setSearchActive(!isSearchActive)}
                className={cn(
                  "p-1.5 rounded-md transition-colors flex-shrink-0",
                  isSearchActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted text-muted-foreground"
                )}
                aria-label="Toggle search"
                title="Search articles (press /)"
              >
                <DoodleSearch size="sm" />
              </button>
              <RefreshButton />
              {!isSearching && unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors flex-shrink-0"
                  aria-label="Mark all as read"
                  title="Mark all as read"
                >
                  <span className="text-muted-foreground">
                    <DoodleCheck size="sm" />
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar row */}
          {isSearchActive && (
            <div className="px-4 pb-3">
              <SearchBar autoFocus resultCount={resultCount} />
            </div>
          )}
        </div>
      )}

      {/* Article List - Virtualized */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent"
      >
        {articlesToDisplay.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <p className="text-sm">No articles</p>
            <p className="text-xs mt-1">
              {Object.keys(feeds).length === 0
                ? "Add a feed to get started"
                : isSearching ? "No matching articles" : "All caught up!"}
            </p>
          </div>
        ) : (
          <div
            className="relative w-full"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const article = articlesToDisplay[virtualRow.index];
              if (!article) return null;
              const feed = feeds[article.feedId];

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full border-b border-border/50"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <SwipeableArticleItem article={article}>
                    <div
                      className="relative group"
                      onMouseEnter={() => setHoveredArticleId(article.id)}
                      onMouseLeave={() => setHoveredArticleId(null)}
                    >
                      <button
                        onClick={() => handleArticleClick(article.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 transition-colors",
                          selectedArticleId === article.id
                            ? "bg-accent/10"
                            : "hover:bg-muted/50",
                          article.isRead && "opacity-60"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Main content */}
                          <div className="flex-1 min-w-0">
                            {/* Feed info row */}
                            <div className="flex items-center gap-2 mb-1.5">
                              {feed && (
                                <FeedIcon
                                  iconUrl={feed.iconUrl}
                                  siteUrl={feed.siteUrl}
                                  title={feed.title}
                                  size="sm"
                                />
                              )}
                              <span className="text-xs text-muted-foreground truncate">
                                {feed?.title || "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatRelativeDate(article.publishedAt)}
                              </span>
                              {article.isStarred && (
                                <span className="text-yellow-500 flex-shrink-0">
                                  <DoodleStar size="xs" />
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3
                              className={cn(
                                "text-sm leading-snug line-clamp-2",
                                !article.isRead && "font-semibold"
                              )}
                            >
                              {article.title}
                            </h3>

                            {/* Summary */}
                            {(() => {
                              const summary = truncateText(
                                stripHtml(article.summary || article.content || ""),
                                120
                              );
                              return summary ? (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {summary}
                                </p>
                              ) : null;
                            })()}
                          </div>

                          {/* Thumbnail on right - only if available */}
                          {(() => {
                            const thumbnailUrl = article.imageUrl || getYouTubeThumbnail(article.link);
                            return thumbnailUrl ? (
                              <ArticleThumbnail
                                src={thumbnailUrl}
                                alt={article.title}
                                size="sm"
                                className="flex-shrink-0 rounded-md"
                              />
                            ) : null;
                          })()}
                        </div>
                      </button>

                      {/* Quick actions */}
                      <QuickActions
                        article={article}
                        isVisible={hoveredArticleId === article.id}
                        className="absolute right-16 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </SwipeableArticleItem>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
