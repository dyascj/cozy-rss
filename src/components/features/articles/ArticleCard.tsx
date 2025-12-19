"use client";

import { Article } from "@/stores/articleStore";
import { Feed } from "@/stores/feedStore";
import { cn } from "@/utils/cn";
import { formatRelativeDate } from "@/utils/date";
import { stripHtml, truncateText } from "@/utils/sanitize";
import { ArticleThumbnail } from "@/components/ui/ArticleThumbnail";
import { DoodleStar } from "@/components/ui/DoodleIcon";

interface ArticleCardProps {
  article: Article;
  feed?: Feed;
  isSelected: boolean;
  onClick: () => void;
}

export function ArticleCard({ article, feed, isSelected, onClick }: ArticleCardProps) {
  const summary = truncateText(
    stripHtml(article.summary || article.content || ""),
    80
  );

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border transition-all",
        "hover:shadow-soft",
        isSelected
          ? "bg-sage-50 dark:bg-sage-900/20 border-sage-200 dark:border-sage-800/50 shadow-soft"
          : "bg-card border-border hover:border-sage-200 dark:hover:border-sage-800/50",
        article.isRead && "opacity-65"
      )}
    >
      {/* Thumbnail */}
      <ArticleThumbnail
        src={article.imageUrl}
        alt={article.title}
        size="lg"
        aspectRatio="video"
        className="w-full rounded-t-lg rounded-b-none"
      />

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <div className="flex items-start gap-2">
          {!article.isRead && (
            <span className="w-2 h-2 rounded-full bg-sage-500 mt-1.5 flex-shrink-0" />
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
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
            {summary}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
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
