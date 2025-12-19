"use client";

import { ReactNode, useMemo } from "react";
import { useSwipeGesture, SwipeState } from "@/hooks/useSwipeGesture";
import { useSettingsStore, SwipeAction } from "@/stores/settingsStore";
import { useArticleStore } from "@/stores/articleStore";
import { Article } from "@/stores/articleStore";
import { cn } from "@/utils/cn";
import { DoodleStar, DoodleClock, DoodleCheckCircle } from "@/components/ui/DoodleIcon";

interface SwipeableArticleItemProps {
  article: Article;
  children: ReactNode;
  className?: string;
}

type DoodleIconComponent = React.ComponentType<{ size?: "xs" | "sm" | "md" | "lg" | "xl" }>;

const ACTION_CONFIG: Record<
  SwipeAction,
  { icon: DoodleIconComponent; color: string; bgColor: string; label: string } | null
> = {
  star: {
    icon: DoodleStar,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/20",
    label: "Star",
  },
  readLater: {
    icon: DoodleClock,
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
    label: "Read Later",
  },
  markRead: {
    icon: DoodleCheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/20",
    label: "Mark Read",
  },
  none: null,
};

function SwipeIndicator({
  action,
  direction,
  progress,
}: {
  action: SwipeAction;
  direction: "left" | "right";
  progress: number;
}) {
  const config = ACTION_CONFIG[action];
  if (!config) return null;

  const Icon = config.icon;
  const isActive = progress > 0.5;

  return (
    <div
      className={cn(
        "absolute inset-y-0 flex items-center justify-center w-20 transition-opacity",
        direction === "right" ? "left-0" : "right-0",
        config.bgColor
      )}
      style={{ opacity: Math.min(progress * 2, 1) }}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-1 transition-transform",
          isActive ? "scale-110" : "scale-100"
        )}
      >
        <span
          className={cn(
            "transition-all",
            config.color
          )}
        >
          <Icon size="md" />
        </span>
        <span className={cn("text-[10px] font-medium", config.color)}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

export function SwipeableArticleItem({
  article,
  children,
  className,
}: SwipeableArticleItemProps) {
  const { swipeEnabled, swipeLeftAction, swipeRightAction } = useSettingsStore();
  const { toggleStarred, toggleReadLater, markAsRead } = useArticleStore();

  const executeAction = (action: SwipeAction) => {
    switch (action) {
      case "star":
        toggleStarred(article.id);
        break;
      case "readLater":
        toggleReadLater(article.id);
        break;
      case "markRead":
        if (!article.isRead) {
          markAsRead(article.id);
        }
        break;
    }
  };

  const { swipeState, handlers, getSwipeStyle } = useSwipeGesture({
    enabled: swipeEnabled,
    onSwipeLeft: () => executeAction(swipeLeftAction),
    onSwipeRight: () => executeAction(swipeRightAction),
  });

  const swipeStyle = useMemo(() => getSwipeStyle(), [getSwipeStyle]);

  if (!swipeEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)} {...handlers}>
      {/* Background indicators */}
      {swipeState.isSwiping && swipeState.direction === "right" && (
        <SwipeIndicator
          action={swipeRightAction}
          direction="right"
          progress={swipeState.progress}
        />
      )}
      {swipeState.isSwiping && swipeState.direction === "left" && (
        <SwipeIndicator
          action={swipeLeftAction}
          direction="left"
          progress={swipeState.progress}
        />
      )}

      {/* Swipeable content */}
      <div
        className={cn(
          "relative bg-background transition-transform",
          !swipeState.isSwiping && "transition-all duration-200"
        )}
        style={swipeStyle}
      >
        {children}
      </div>
    </div>
  );
}
