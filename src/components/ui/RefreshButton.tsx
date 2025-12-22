"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/utils/cn";
import { DoodleRefresh } from "@/components/ui/DoodleIcon";
import { refreshTracker } from "@/lib/feed-cache";
import { Tooltip } from "@/components/ui/Tooltip";

interface RefreshButtonProps {
  className?: string;
  size?: "sm" | "md";
}

const MIN_REFRESH_INTERVAL = 30000; // 30 seconds

export function RefreshButton({ className, size = "sm" }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Subscribe to refresh status
  useEffect(() => {
    const unsubscribe = refreshTracker.subscribe((status) => {
      setIsRefreshing(status.isRefreshing);
    });

    return unsubscribe;
  }, []);

  // Update cooldown timer
  useEffect(() => {
    const updateCooldown = () => {
      const remaining = refreshTracker.getCooldown(MIN_REFRESH_INTERVAL);
      setCooldownRemaining(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [isRefreshing]);

  const handleRefresh = useCallback(() => {
    if (isRefreshing || cooldownRemaining > 0) return;
    window.dispatchEvent(new CustomEvent("refresh-feeds"));
  }, [isRefreshing, cooldownRemaining]);

  const isDisabled = isRefreshing || cooldownRemaining > 0;
  const cooldownSeconds = Math.ceil(cooldownRemaining / 1000);

  const tooltipTitle = isRefreshing
    ? "Refreshing..."
    : cooldownRemaining > 0
    ? `Wait ${cooldownSeconds}s`
    : "Refresh Feeds";

  const tooltipContent = isRefreshing
    ? "Fetching the latest articles from your feeds."
    : cooldownRemaining > 0
    ? "Please wait before refreshing again to avoid rate limits."
    : "Fetch the latest articles from all your subscribed feeds.";

  return (
    <Tooltip title={tooltipTitle} content={tooltipContent}>
      <button
        onClick={handleRefresh}
        disabled={isDisabled}
        className={cn(
          "p-1.5 rounded-md transition-colors flex-shrink-0 relative",
          isDisabled
            ? "text-muted-foreground cursor-not-allowed"
            : "hover:bg-muted text-muted-foreground hover:text-foreground",
          className
        )}
        aria-label={
          isRefreshing
            ? "Refreshing feeds..."
            : cooldownRemaining > 0
            ? `Refresh available in ${cooldownSeconds}s`
            : "Refresh feeds"
        }
      >
        <span className={isRefreshing ? "animate-spin inline-block" : ""}>
          <DoodleRefresh size={size} />
        </span>

        {/* Cooldown indicator ring */}
        {cooldownRemaining > 0 && !isRefreshing && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 36 36"
          >
            <circle
              className="stroke-muted-foreground/30"
              strokeWidth="2"
              fill="none"
              cx="18"
              cy="18"
              r="15"
            />
            <circle
              className="stroke-accent transition-all duration-1000"
              strokeWidth="2"
              strokeDasharray={`${(cooldownRemaining / MIN_REFRESH_INTERVAL) * 94.2} 94.2`}
              strokeLinecap="round"
              fill="none"
              cx="18"
              cy="18"
              r="15"
            />
          </svg>
        )}
      </button>
    </Tooltip>
  );
}
