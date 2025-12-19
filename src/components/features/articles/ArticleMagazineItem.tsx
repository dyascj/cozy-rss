"use client";

import { Article } from "@/stores/articleStore";
import { Feed } from "@/stores/feedStore";
import { cn } from "@/utils/cn";
import { formatRelativeDate } from "@/utils/date";
import { stripHtml, truncateText } from "@/utils/sanitize";
import { ArticleThumbnail } from "@/components/ui/ArticleThumbnail";
import { DoodleStar } from "@/components/ui/DoodleIcon";

interface ArticleMagazineItemProps {
  article: Article;
  feed?: Feed;
  isSelected: boolean;
  onClick: () => void;
}

export function ArticleMagazineItem({
  article,
  feed,
  isSelected,
  onClick,
}: ArticleMagazineItemProps) {
  const summary = truncateText(
    stripHtml(article.summary || article.content || ""),
    100
  );

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 transition-colors flex gap-3",
        isSelected ? "bg-sage-50 dark:bg-sage-900/20" : "hover:bg-cream-100 dark:hover:bg-charcoal-800",
        article.isRead && "opacity-60"
      )}
    >
      {/* Thumbnail */}
      <ArticleThumbnail
        src={article.imageUrl}
        alt={article.title}
        size="sm"
        className="rounded-md"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-start gap-2">
          {!article.isRead && (
            <span className="w-2 h-2 rounded-full bg-sage-500 mt-1 flex-shrink-0" />
          )}
          <h3
            className={cn(
              "text-sm leading-snug line-clamp-2 flex-1",
              !article.isRead && "font-medium"
            )}
          >
            {article.title}
          </h3>
          {article.isStarred && (
            <span className="flex-shrink-0 text-amber-500">
              <DoodleStar size="xs" />
            </span>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {summary}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          {feed && (
            <>
              <span className="truncate max-w-[100px]">{feed.title}</span>
              <span>·</span>
            </>
          )}
          <span>{formatRelativeDate(article.publishedAt)}</span>
        </div>
      </div>
    </button>
  );
}
