"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";
import { Article, useArticleStore } from "@/stores/articleStore";
import { useFeedStore } from "@/stores/feedStore";
import {
  DoodleStar,
  DoodleClock,
  DoodleMail,
  DoodleMailOpen,
  DoodleExternalLink,
  DoodleX,
} from "@/components/ui/DoodleIcon";
import { FeedIcon } from "@/components/ui/FeedIcon";
import { formatRelativeDate } from "@/utils/date";

interface MobileActionSheetProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileActionSheet({
  article,
  isOpen,
  onClose,
}: MobileActionSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const { feeds } = useFeedStore();
  const { toggleStarred, toggleReadLater, markAsRead, markAsUnread } = useArticleStore();
  const feed = feeds[article.feedId];

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const handleToggleRead = () => {
    if (article.isRead) {
      markAsUnread(article.id);
    } else {
      markAsRead(article.id);
    }
  };

  const handleOpenInBrowser = () => {
    if (article.link) {
      window.open(article.link, "_blank", "noopener,noreferrer");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-popover rounded-t-2xl safe-area-bottom animate-in slide-in-from-bottom duration-300"
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Article preview */}
        <div className="px-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            {feed && (
              <FeedIcon
                iconUrl={feed.iconUrl}
                siteUrl={feed.siteUrl}
                title={feed.title}
                size="sm"
              />
            )}
            <span className="text-xs text-muted-foreground truncate">
              {feed?.title}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeDate(article.publishedAt)}
            </span>
          </div>
          <h3 className="text-sm font-medium line-clamp-2">{article.title}</h3>
        </div>

        {/* Actions */}
        <div className="py-2">
          <button
            onClick={() => handleAction(() => toggleStarred(article.id))}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors active:bg-muted min-h-[52px]",
              article.isStarred && "text-yellow-500"
            )}
          >
            <DoodleStar size="md" />
            <span className="text-sm font-medium">
              {article.isStarred ? "Remove Star" : "Star Article"}
            </span>
          </button>

          <button
            onClick={() => handleAction(() => toggleReadLater(article.id))}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors active:bg-muted min-h-[52px]",
              article.isReadLater && "text-blue-500"
            )}
          >
            <DoodleClock size="md" />
            <span className="text-sm font-medium">
              {article.isReadLater ? "Remove from Read Later" : "Save for Later"}
            </span>
          </button>

          <button
            onClick={() => handleAction(handleToggleRead)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors active:bg-muted min-h-[52px]",
              !article.isRead && "text-green-500"
            )}
          >
            {article.isRead ? <DoodleMailOpen size="md" /> : <DoodleMail size="md" />}
            <span className="text-sm font-medium">
              {article.isRead ? "Mark as Unread" : "Mark as Read"}
            </span>
          </button>

          {article.link && (
            <button
              onClick={() => handleAction(handleOpenInBrowser)}
              className="w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors active:bg-muted min-h-[52px]"
            >
              <DoodleExternalLink size="md" />
              <span className="text-sm font-medium">Open in Browser</span>
            </button>
          )}
        </div>

        {/* Cancel button */}
        <div className="px-4 pb-4 pt-2">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-muted text-foreground font-medium transition-colors active:bg-muted/70 min-h-[52px]"
          >
            <DoodleX size="sm" />
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
