"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { DiscoverFeed } from "@/types/discover";
import { FeedIcon } from "@/components/ui/FeedIcon";
import { SubscribeButton } from "./SubscribeButton";
import { FeedPreviewModal } from "./FeedPreviewModal";
import { useFeedPreview } from "@/hooks/useFeedPreview";
import { DoodlePlay, DoodleExternalLink } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

interface DiscoverFeedCardProps {
  feed: DiscoverFeed;
}

export function DiscoverFeedCard({ feed }: DiscoverFeedCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { preview, isLoading, fetchPreview, cancelFetch, fetchPreviewImmediately } =
    useFeedPreview(feed);

  const handleMouseEnter = useCallback(() => {
    fetchPreview();
  }, [fetchPreview]);

  const handleMouseLeave = useCallback(() => {
    cancelFetch();
  }, [cancelFetch]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't open preview if clicking on subscribe button or external link
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    setShowPreview(true);
    fetchPreviewImmediately();
  }, [fetchPreviewImmediately]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle Enter/Space if not focused on an interactive element
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowPreview(true);
      fetchPreviewImmediately();
    }
  }, [fetchPreviewImmediately]);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "group w-full p-4 rounded-xl border border-border bg-card text-left cursor-pointer",
          "hover:border-sage-300 dark:hover:border-sage-700/50 hover:shadow-soft transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`Preview ${feed.name} feed`}
      >
        <div className="flex items-start gap-3">
          <FeedIcon
            iconUrl={feed.iconUrl}
            siteUrl={feed.siteUrl}
            title={feed.name}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm truncate group-hover:text-sage-600 dark:group-hover:text-sage-400 transition-colors">
                {feed.name}
              </h3>
              {feed.isYouTube && (
                <span className="text-red-500 flex-shrink-0">
                  <DoodlePlay size="xs" />
                </span>
              )}
            </div>
            {feed.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {feed.description}
              </p>
            )}
            {feed.tags && feed.tags.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {feed.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-cream-200 dark:bg-charcoal-700 text-taupe-600 dark:text-taupe-300 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <SubscribeButton feed={feed} />
            {feed.siteUrl && (
              <a
                href={feed.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Visit website"
              >
                <DoodleExternalLink size="sm" />
              </a>
            )}
          </div>
        </div>
      </div>

      <FeedPreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        feed={feed}
        preview={preview}
        isLoading={isLoading}
      />
    </>
  );
}
