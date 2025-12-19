"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { DiscoverFeed, FeedPreview } from "@/types/discover";
import { FeedIcon } from "@/components/ui/FeedIcon";
import { SubscribeButton } from "./SubscribeButton";
import { PreviewArticleItem } from "./PreviewArticleItem";
import { DoodleClose, DoodleLoader, DoodleExternalLink, DoodleRss } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

interface FeedPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feed: DiscoverFeed;
  preview: FeedPreview | null;
  isLoading: boolean;
}

export function FeedPreviewModal({
  open,
  onOpenChange,
  feed,
  preview,
  isLoading,
}: FeedPreviewModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in-0 z-50" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
            "w-[calc(100%-2rem)] max-w-lg",
            "max-h-[80vh] sm:max-h-[85vh]",
            "bg-card border border-cream-300 dark:border-charcoal-700 rounded-2xl shadow-warm",
            "flex flex-col overflow-hidden",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]",
            "safe-area-bottom"
          )}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <FeedIcon
                  iconUrl={feed.iconUrl}
                  siteUrl={feed.siteUrl}
                  title={feed.name}
                  size="lg"
                />
                <div className="min-w-0">
                  <Dialog.Title className="font-semibold text-foreground truncate">
                    {feed.name}
                  </Dialog.Title>
                  {feed.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {feed.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {feed.siteUrl && (
                      <a
                        href={feed.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <DoodleExternalLink size="xs" />
                        Website
                      </a>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <DoodleRss size="xs" />
                      {feed.source === "rsshub" ? "via RSSHub" : "RSS Feed"}
                    </span>
                  </div>
                </div>
              </div>
              <Dialog.Close
                className="p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-700 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500"
                aria-label="Close preview"
              >
                <DoodleClose size="sm" />
              </Dialog.Close>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <span className="animate-spin text-muted-foreground">
                  <DoodleLoader size="md" />
                </span>
                <p className="text-sm text-muted-foreground mt-3">Loading preview...</p>
              </div>
            ) : preview && preview.articles.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  Recent Articles
                </p>
                {preview.articles.map((article, i) => (
                  <PreviewArticleItem
                    key={`${article.link}-${i}`}
                    article={article}
                    isYouTube={feed.isYouTube}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">
                  Unable to load preview
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Subscribe to see content in your reader
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-border bg-cream-100 dark:bg-charcoal-800/50">
            <SubscribeButton feed={feed} variant="large" onSuccess={() => onOpenChange(false)} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
