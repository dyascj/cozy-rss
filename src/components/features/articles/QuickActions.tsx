"use client";

import { useArticleStore, Article } from "@/stores/articleStore";
import { cn } from "@/utils/cn";
import { DoodleStar, DoodleClock, DoodleCheck, DoodleExternalLink } from "@/components/ui/DoodleIcon";
import * as Tooltip from "@radix-ui/react-tooltip";

interface QuickActionsProps {
  article: Article;
  isVisible: boolean;
  className?: string;
}

export function QuickActions({ article, isVisible, className }: QuickActionsProps) {
  const { toggleStarred, toggleReadLater, markAsRead, markAsUnread } = useArticleStore();

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarred(article.id);
  };

  const handleReadLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleReadLater(article.id);
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.isRead) {
      markAsUnread(article.id);
    } else {
      markAsRead(article.id);
    }
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.link) {
      window.open(article.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <div
        className={cn(
          "flex items-center gap-0.5 bg-background/95 backdrop-blur-sm rounded-md shadow-sm border border-border/50 p-0.5 transition-opacity duration-150",
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
          className
        )}
      >
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={handleStar}
              className={cn(
                "p-1.5 rounded transition-colors",
                article.isStarred
                  ? "text-yellow-500 hover:bg-yellow-500/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <DoodleStar size="xs" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-foreground text-background px-2 py-1 rounded text-xs" sideOffset={5}>
              {article.isStarred ? "Unstar" : "Star"}
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={handleReadLater}
              className={cn(
                "p-1.5 rounded transition-colors",
                article.isReadLater
                  ? "text-blue-500 hover:bg-blue-500/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <DoodleClock size="xs" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-foreground text-background px-2 py-1 rounded text-xs" sideOffset={5}>
              {article.isReadLater ? "Remove from Read Later" : "Read Later"}
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={handleToggleRead}
              className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span className={cn(article.isRead && "text-green-500")}>
                <DoodleCheck size="xs" />
              </span>
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-foreground text-background px-2 py-1 rounded text-xs" sideOffset={5}>
              {article.isRead ? "Mark as unread" : "Mark as read"}
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {article.link && (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={handleOpenExternal}
                className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <DoodleExternalLink size="xs" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-foreground text-background px-2 py-1 rounded text-xs" sideOffset={5}>
                Open in browser
                <Tooltip.Arrow className="fill-foreground" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )}
      </div>
    </Tooltip.Provider>
  );
}
