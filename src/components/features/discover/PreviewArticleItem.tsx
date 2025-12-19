"use client";

import { PreviewArticle } from "@/types/discover";
import { ArticleThumbnail } from "@/components/ui/ArticleThumbnail";
import { formatRelativeDate } from "@/utils/date";
import { DoodlePlay } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

interface PreviewArticleItemProps {
  article: PreviewArticle;
  isYouTube?: boolean;
}

export function PreviewArticleItem({ article, isYouTube }: PreviewArticleItemProps) {
  // For YouTube videos, use the video thumbnail
  const thumbnailUrl = article.videoId
    ? `https://img.youtube.com/vi/${article.videoId}/mqdefault.jpg`
    : article.imageUrl;

  if (isYouTube || article.videoId) {
    // YouTube video layout - larger thumbnail
    return (
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex gap-3 p-2 -mx-2 rounded-lg",
          "hover:bg-muted/50 transition-colors"
        )}
      >
        <div className="relative flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground/50">
              <DoodlePlay size="lg" />
            </span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
              <span className="text-white ml-0.5">
              <DoodlePlay size="md" />
            </span>
            </div>
          </div>
          {article.duration && (
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {article.duration}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <h4 className="text-sm font-medium line-clamp-2 text-foreground">
            {article.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1.5">
            {formatRelativeDate(article.publishedAt)}
          </p>
        </div>
      </a>
    );
  }

  // Standard article layout
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex gap-3 p-2 -mx-2 rounded-lg",
        "hover:bg-muted/50 transition-colors"
      )}
    >
      {thumbnailUrl && (
        <ArticleThumbnail
          src={thumbnailUrl}
          alt={article.title}
          size="sm"
          aspectRatio="square"
          className="flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium line-clamp-2 text-foreground">
          {article.title}
        </h4>
        {article.summary && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {article.summary}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1.5">
          {formatRelativeDate(article.publishedAt)}
        </p>
      </div>
    </a>
  );
}
