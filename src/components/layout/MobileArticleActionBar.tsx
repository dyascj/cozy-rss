"use client";

import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/utils/cn";
import {
  DoodleStar,
  DoodleClock,
  DoodleMail,
  DoodleMailOpen,
  DoodleExternalLink,
  DoodleBookOpen,
  DoodleTag,
} from "@/components/ui/DoodleIcon";

interface MobileArticleActionBarProps {
  articleId: string;
  isReaderMode?: boolean;
  onToggleReaderMode?: () => void;
  onOpenTagSelector?: () => void;
}

export function MobileArticleActionBar({
  articleId,
  isReaderMode,
  onToggleReaderMode,
  onOpenTagSelector,
}: MobileArticleActionBarProps) {
  const { articles, toggleStarred, toggleReadLater, markAsRead, markAsUnread } = useArticleStore();
  const article = articles[articleId];

  if (!article) return null;

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

  return (
    <div className="bg-sidebar-bg border-t border-border safe-area-bottom">
      <nav className="flex items-stretch h-14">
        {/* Star */}
        <button
          onClick={() => toggleStarred(article.id)}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px]",
            article.isStarred
              ? "text-yellow-500"
              : "text-muted-foreground active:bg-muted/50"
          )}
          aria-label={article.isStarred ? "Unstar" : "Star"}
        >
          <DoodleStar size="md" />
          <span className="text-[10px] font-medium">Star</span>
        </button>

        {/* Read Later */}
        <button
          onClick={() => toggleReadLater(article.id)}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px]",
            article.isReadLater
              ? "text-blue-500"
              : "text-muted-foreground active:bg-muted/50"
          )}
          aria-label={article.isReadLater ? "Remove from Read Later" : "Read Later"}
        >
          <DoodleClock size="md" />
          <span className="text-[10px] font-medium">Later</span>
        </button>

        {/* Mark Read/Unread */}
        <button
          onClick={handleToggleRead}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px]",
            article.isRead
              ? "text-muted-foreground active:bg-muted/50"
              : "text-green-500"
          )}
          aria-label={article.isRead ? "Mark as unread" : "Mark as read"}
        >
          {article.isRead ? <DoodleMailOpen size="md" /> : <DoodleMail size="md" />}
          <span className="text-[10px] font-medium">{article.isRead ? "Unread" : "Read"}</span>
        </button>

        {/* Reader Mode */}
        {article.link && onToggleReaderMode && (
          <button
            onClick={onToggleReaderMode}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px]",
              isReaderMode
                ? "text-accent"
                : "text-muted-foreground active:bg-muted/50"
            )}
            aria-label={isReaderMode ? "Disable reader mode" : "Enable reader mode"}
          >
            <DoodleBookOpen size="md" />
            <span className="text-[10px] font-medium">Reader</span>
          </button>
        )}

        {/* Tags */}
        {onOpenTagSelector && (
          <button
            onClick={onOpenTagSelector}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px] text-muted-foreground active:bg-muted/50"
            aria-label="Add tags"
          >
            <DoodleTag size="md" />
            <span className="text-[10px] font-medium">Tags</span>
          </button>
        )}

        {/* Open in Browser */}
        <button
          onClick={handleOpenInBrowser}
          disabled={!article.link}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px]",
            article.link
              ? "text-muted-foreground active:bg-muted/50"
              : "text-muted-foreground/30"
          )}
          aria-label="Open in browser"
        >
          <DoodleExternalLink size="md" />
          <span className="text-[10px] font-medium">Open</span>
        </button>
      </nav>
    </div>
  );
}
