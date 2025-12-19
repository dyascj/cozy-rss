"use client";

import { Article } from "@/stores/articleStore";
import { Feed } from "@/stores/feedStore";
import { cn } from "@/utils/cn";
import { formatRelativeDate } from "@/utils/date";
import { DoodleStar } from "@/components/ui/DoodleIcon";

interface ArticleTitleItemProps {
  article: Article;
  feed?: Feed;
  isSelected: boolean;
  onClick: () => void;
}

export function ArticleTitleItem({
  article,
  feed,
  isSelected,
  onClick,
}: ArticleTitleItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-2 transition-colors flex items-center gap-2",
        isSelected ? "bg-sage-50 dark:bg-sage-900/20" : "hover:bg-cream-100 dark:hover:bg-charcoal-800",
        article.isRead && "opacity-60"
      )}
    >
      {/* Unread indicator */}
      <div className="w-2 flex-shrink-0">
        {!article.isRead && (
          <span className="block w-2 h-2 rounded-full bg-sage-500" />
        )}
      </div>

      {/* Title */}
      <h3
        className={cn(
          "text-sm truncate flex-1",
          !article.isRead && "font-medium"
        )}
      >
        {article.title}
      </h3>

      {/* Star */}
      {article.isStarred && (
        <span className="flex-shrink-0 text-amber-500">
          <DoodleStar size="xs" />
        </span>
      )}

      {/* Feed name */}
      {feed && (
        <span className="text-xs text-muted-foreground truncate max-w-[80px] hidden sm:block">
          {feed.title}
        </span>
      )}

      {/* Date */}
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {formatRelativeDate(article.publishedAt)}
      </span>
    </button>
  );
}
