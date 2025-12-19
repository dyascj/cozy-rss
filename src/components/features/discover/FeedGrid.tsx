"use client";

import { useEffect, useState } from "react";
import { DiscoverCategory, DiscoverFeed } from "@/types/discover";
import { useDiscoverStore } from "@/stores/discoverStore";
import { DiscoverFeedCard } from "./DiscoverFeedCard";
import { getCategoryMeta } from "@/lib/discover/categories";
import { DoodleLoader } from "@/components/ui/DoodleIcon";

interface FeedGridProps {
  category?: DiscoverCategory;
  feeds?: DiscoverFeed[];
  title?: string;
  emptyMessage?: string;
}

export function FeedGrid({ category, feeds: providedFeeds, title, emptyMessage }: FeedGridProps) {
  const {
    feeds: storedFeeds,
    loadingCategory,
    categoryError,
    setFeeds,
    setLoadingCategory,
    setCategoryError,
  } = useDiscoverStore();

  const [localLoading, setLocalLoading] = useState(false);

  // Use provided feeds or fetch from API
  const feeds = providedFeeds || (category ? storedFeeds[category] : []);
  const isLoading = loadingCategory === category || localLoading;

  useEffect(() => {
    if (!category || providedFeeds) return;

    // Check if we already have feeds for this category
    if (storedFeeds[category].length > 0) return;

    const fetchFeeds = async () => {
      setLoadingCategory(category);
      setLocalLoading(true);
      setCategoryError(null);

      try {
        const response = await fetch(
          `/api/discover/feeds?category=${encodeURIComponent(category)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch feeds: ${response.status}`);
        }

        const data = await response.json();
        setFeeds(category, data.feeds);
      } catch (error) {
        console.error("Error fetching feeds:", error);
        setCategoryError(error instanceof Error ? error.message : "Failed to load feeds");
      } finally {
        setLoadingCategory(null);
        setLocalLoading(false);
      }
    };

    fetchFeeds();
  }, [category, providedFeeds, storedFeeds, setFeeds, setLoadingCategory, setCategoryError]);

  const categoryMeta = category ? getCategoryMeta(category) : null;
  const displayTitle = title || categoryMeta?.description;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="animate-spin text-muted-foreground">
          <DoodleLoader size="lg" />
        </span>
        <p className="text-sm text-muted-foreground mt-3">Loading feeds...</p>
      </div>
    );
  }

  if (categoryError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-destructive">{categoryError}</p>
        <button
          onClick={() => {
            setCategoryError(null);
            // Trigger refetch by clearing feeds
            if (category) {
              setFeeds(category, []);
            }
          }}
          className="mt-3 text-sm text-accent hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (feeds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">
          {emptyMessage || "No feeds available"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {displayTitle && (
        <p className="text-muted-foreground mb-6">{displayTitle}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {feeds.map((feed) => (
          <DiscoverFeedCard key={feed.id} feed={feed} />
        ))}
      </div>
    </div>
  );
}
