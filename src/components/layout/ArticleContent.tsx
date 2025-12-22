"use client";

import { useMemo } from "react";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { sanitizeHtml } from "@/utils/sanitize";
import { formatFullDate } from "@/utils/date";
import {
  DoodleStar,
  DoodleClock,
  DoodleExternalLink,
  DoodleMail,
  DoodleMailOpen,
  DoodleRss,
  DoodleBookOpen,
  DoodleLoader,
  DoodleAlertCircle,
} from "@/components/ui/DoodleIcon";
import { FeedIcon } from "@/components/ui/FeedIcon";
import { useReaderMode } from "@/hooks/useReaderMode";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { cn } from "@/utils/cn";
import { extractVideoUrls, VideoEmbed as VideoEmbedType } from "@/utils/video";
import { VideoEmbed } from "@/components/ui/VideoEmbed";

// Extract YouTube video ID from URL
function getYouTubeVideoFromLink(url: string): VideoEmbedType | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        type: "youtube",
        id: match[1],
        url: url,
        thumbnailUrl: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`,
      };
    }
  }
  return null;
}
import { TagSelector } from "@/components/features/tags/TagSelector";
import { TagBadge } from "@/components/features/tags/TagBadge";
import { useTagStore } from "@/stores/tagStore";
import { Tooltip } from "@/components/ui/Tooltip";

interface ArticleContentProps {
  onBack?: () => void;
  hideToolbar?: boolean;
}

export function ArticleContent({ onBack, hideToolbar }: ArticleContentProps = {}) {
  const { feeds } = useFeedStore();
  const { articles, toggleStarred, toggleReadLater, markAsRead, markAsUnread } = useArticleStore();
  const { selectedArticleId } = useUIStore();
  const { getArticleTags } = useTagStore();

  const article = selectedArticleId ? articles[selectedArticleId] : null;
  const feed = article ? feeds[article.feedId] : null;

  const {
    isReaderMode,
    toggleReaderMode,
    isLoading,
    error,
    readerContent,
    fetchReaderContent,
  } = useReaderMode(selectedArticleId, article?.link ?? null);

  const sanitizedContent = useMemo(() => {
    if (!article) return "";

    // Use reader content if available and reader mode is enabled
    if (isReaderMode && readerContent) {
      return sanitizeHtml(readerContent.content);
    }

    const content = article.content || article.summary || "";
    return sanitizeHtml(content);
  }, [article, isReaderMode, readerContent]);

  // Extract videos from content and article link
  const videos = useMemo(() => {
    if (!article) return [];

    const allVideos: VideoEmbedType[] = [];

    // First, check if the article link itself is a YouTube video
    const linkVideo = getYouTubeVideoFromLink(article.link);
    if (linkVideo) {
      allVideos.push(linkVideo);
    }

    // Then extract videos from content
    const content = isReaderMode && readerContent
      ? readerContent.content
      : article.content || article.summary || "";
    const contentVideos = extractVideoUrls(content);

    // Add content videos, avoiding duplicates
    for (const video of contentVideos) {
      if (!allVideos.some(v => v.type === video.type && v.id === video.id)) {
        allVideos.push(video);
      }
    }

    return allVideos;
  }, [article, isReaderMode, readerContent]);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-background">
        <span className="opacity-20 mb-4">
          <DoodleRss size="xl" />
        </span>
        <p className="text-sm">Select an article to read</p>
      </div>
    );
  }

  const handleOpenInBrowser = () => {
    if (article.link) {
      window.open(article.link, "_blank", "noopener,noreferrer");
    }
  };

  const handleToggleRead = () => {
    if (article.isRead) {
      markAsUnread(article.id);
    } else {
      markAsRead(article.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar - hidden on mobile where we use bottom action bar */}
      {!hideToolbar && (
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border">
        <Tooltip
          title={article.isStarred ? "Unstar" : "Star"}
          content={article.isStarred ? "Remove from your starred articles." : "Add to your starred articles for quick access later."}
        >
          <button
            onClick={() => toggleStarred(article.id)}
            className={cn(
              "p-2 rounded-md transition-colors",
              article.isStarred
                ? "text-yellow-500 hover:bg-yellow-500/10"
                : "text-muted-foreground hover:bg-muted"
            )}
            aria-label={article.isStarred ? "Unstar" : "Star"}
          >
            <DoodleStar size="sm" />
          </button>
        </Tooltip>

        <Tooltip
          title={article.isReadLater ? "Remove from Read Later" : "Read Later"}
          content={article.isReadLater ? "Remove from your reading queue." : "Save to your reading queue for later."}
        >
          <button
            onClick={() => toggleReadLater(article.id)}
            className={cn(
              "p-2 rounded-md transition-colors",
              article.isReadLater
                ? "text-blue-500 hover:bg-blue-500/10"
                : "text-muted-foreground hover:bg-muted"
            )}
            aria-label={article.isReadLater ? "Remove from Read Later" : "Read Later"}
          >
            <DoodleClock size="sm" />
          </button>
        </Tooltip>

        <Tooltip
          title={article.isRead ? "Mark as Unread" : "Mark as Read"}
          content={article.isRead ? "Mark this article as unread." : "Mark this article as read."}
        >
          <button
            onClick={handleToggleRead}
            className="p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            aria-label={article.isRead ? "Mark as unread" : "Mark as read"}
          >
            {article.isRead ? (
              <DoodleMailOpen size="sm" />
            ) : (
              <DoodleMail size="sm" />
            )}
          </button>
        </Tooltip>

        <Tooltip
          title="Readability"
          content="Fetches the original website content for a cleaner reading experience. Use when RSS content is incomplete or hard to read."
          side="bottom"
          align="center"
        >
          <button
            onClick={toggleReaderMode}
            disabled={!article.link}
            className={cn(
              "p-2 rounded-md transition-colors",
              isReaderMode
                ? "text-accent bg-accent/10 hover:bg-accent/20"
                : "text-muted-foreground hover:bg-muted",
              !article.link && "opacity-50 cursor-not-allowed"
            )}
            aria-label={isReaderMode ? "Disable reader mode" : "Enable reader mode"}
          >
            <DoodleBookOpen size="sm" />
          </button>
        </Tooltip>

        <TagSelector articleId={article.id} />

        <div className="flex-1" />

        <Tooltip
          title="Open in Browser"
          content="Open the original article in your default browser."
        >
          <button
            onClick={handleOpenInBrowser}
            className="p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Open in browser"
          >
            <DoodleExternalLink size="sm" />
          </button>
        </Tooltip>
      </div>
      )}

      {/* Content */}
      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="h-full w-full">
          <article className="max-w-3xl mx-auto px-4 py-4 sm:px-8 sm:py-6">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold leading-tight mb-3">
                {article.link ? (
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {article.title}
                  </a>
                ) : (
                  article.title
                )}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {feed && (
                  <div className="flex items-center gap-2">
                    <FeedIcon
                      iconUrl={feed.iconUrl}
                      siteUrl={feed.siteUrl}
                      title={feed.title}
                      size="md"
                    />
                    <span className="font-medium text-foreground">
                      {feed.title}
                    </span>
                  </div>
                )}
                {article.author && <span>by {article.author}</span>}
                <span>{formatFullDate(article.publishedAt)}</span>
              </div>

              {/* Tags */}
              {getArticleTags(article.id).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {getArticleTags(article.id).map((tag) => (
                    <TagBadge key={tag.id} tag={tag} size="md" />
                  ))}
                </div>
              )}
            </header>

            {/* Embedded videos */}
            {videos.length > 0 && (
              <div className="mb-6 space-y-4">
                {videos.map((video, index) => (
                  <VideoEmbed key={`${video.type}-${video.id}-${index}`} video={video} />
                ))}
              </div>
            )}

            {/* Article body */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <span className="animate-spin mb-3">
                  <DoodleLoader size="lg" />
                </span>
                <p className="text-sm">Fetching full article...</p>
              </div>
            ) : isReaderMode && error ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <span className="text-yellow-500 mb-3">
                  <DoodleAlertCircle size="lg" />
                </span>
                <p className="text-sm mb-3">{error}</p>
                <button
                  onClick={fetchReaderContent}
                  className="px-4 py-2 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
                >
                  Retry
                </button>
                <p className="text-xs mt-4 text-muted-foreground/70">
                  Showing feed content below
                </p>
                <div
                  className="article-content prose prose-neutral dark:prose-invert max-w-none mt-4 pt-4 border-t border-border"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(article.content || article.summary || ""),
                  }}
                />
              </div>
            ) : (
              <div
                className="article-content prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            )}

            {/* Footer */}
            {article.link && (
              <footer className="mt-8 pt-6 border-t border-border">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                >
                  <DoodleExternalLink size="sm" />
                  Read original article
                </a>
              </footer>
            )}
          </article>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex select-none touch-none p-0.5 bg-transparent transition-colors duration-150 ease-out data-[orientation=vertical]:w-2.5"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-muted-foreground/30 rounded-full" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}
