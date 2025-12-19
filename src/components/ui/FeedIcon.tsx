"use client";

import { useState, useMemo } from "react";
import { cn } from "@/utils/cn";
import { getFaviconUrl, getDuckDuckGoFaviconUrl, getColorFromString, getInitials } from "@/utils/favicon";

interface FeedIconProps {
  iconUrl?: string;
  siteUrl?: string;
  title: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-3.5 h-3.5 text-[8px]",
  md: "w-4 h-4 text-[9px]",
  lg: "w-5 h-5 text-[10px]",
};

export function FeedIcon({
  iconUrl,
  siteUrl,
  title,
  size = "md",
  className,
}: FeedIconProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [allSourcesFailed, setAllSourcesFailed] = useState(false);

  // Build list of image sources to try
  const imageSources = useMemo(() => {
    const sources: string[] = [];

    // First priority: provided iconUrl
    if (iconUrl) {
      sources.push(iconUrl);
    }

    // Second: DuckDuckGo favicon service (more reliable)
    if (siteUrl) {
      sources.push(getDuckDuckGoFaviconUrl(siteUrl));
    }

    // Third: Google favicon service
    if (siteUrl) {
      sources.push(getFaviconUrl(siteUrl));
    }

    return sources;
  }, [iconUrl, siteUrl]);

  const currentSrc = imageSources[currentSourceIndex];

  // Fallback: colored circle with initials
  const fallbackColor = getColorFromString(title);
  const initials = getInitials(title);

  const handleError = () => {
    if (currentSourceIndex < imageSources.length - 1) {
      // Try the next source
      setCurrentSourceIndex(prev => prev + 1);
    } else {
      // All sources failed
      setAllSourcesFailed(true);
    }
  };

  // Show image if we have a current source and haven't exhausted all options
  if (currentSrc && !allSourcesFailed) {
    return (
      <img
        src={currentSrc}
        alt=""
        className={cn(
          sizeClasses[size],
          "rounded-sm object-cover flex-shrink-0",
          className
        )}
        onError={handleError}
      />
    );
  }

  // Fallback to initials
  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-sm flex items-center justify-center font-semibold text-white flex-shrink-0",
        className
      )}
      style={{ backgroundColor: fallbackColor }}
    >
      {initials.charAt(0)}
    </div>
  );
}
