"use client";

import { useState, useCallback } from "react";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { DiscoverFeed } from "@/types/discover";
import { fetchAndParseFeed } from "@/lib/feed-parser";
import { DoodleCheck, DoodlePlus, DoodleLoader } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

interface SubscribeButtonProps {
  feed: DiscoverFeed;
  variant?: "default" | "large";
  onSuccess?: () => void;
}

export function SubscribeButton({
  feed,
  variant = "default",
  onSuccess,
}: SubscribeButtonProps) {
  const { feeds, addFeed } = useFeedStore();
  const { addArticles } = useArticleStore();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already subscribed by URL
  const isSubscribed = Object.values(feeds).some(
    (f) => f.url === feed.feedUrl
  );

  const handleSubscribe = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (isSubscribed || isSubscribing) return;

      setIsSubscribing(true);
      setError(null);

      try {
        const parsedFeed = await fetchAndParseFeed(feed.feedUrl, { maxItems: 50 });

        const feedId = await addFeed({
          url: feed.feedUrl,
          title: parsedFeed.title || feed.name,
          description: parsedFeed.description || feed.description,
          siteUrl: parsedFeed.siteUrl || feed.siteUrl,
          iconUrl: parsedFeed.iconUrl || feed.iconUrl,
          folderId: null,
          lastFetched: Date.now(),
        });

        if (!feedId) {
          throw new Error("Failed to add feed");
        }

        const mappedArticles = parsedFeed.items.map((item) => ({
          feedId,
          guid: item.guid,
          title: item.title,
          link: item.link,
          author: item.author,
          summary: item.summary,
          content: item.content,
          publishedAt: item.publishedAt,
          fetchedAt: Date.now(),
          isRead: false,
          isStarred: false,
          isReadLater: false,
          imageUrl: item.imageUrl,
        }));

        addArticles(feedId, mappedArticles);

        // Persist to database
        fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedId, articles: mappedArticles }),
        }).catch((err) => console.error("Failed to persist articles:", err));

        onSuccess?.();
      } catch (error) {
        console.error("Failed to subscribe:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to subscribe";

        // Provide more helpful error messages
        if (errorMessage.includes("429") || errorMessage.includes("rate")) {
          setError("Rate limited. Try again in a few minutes.");
        } else if (errorMessage.includes("522") || errorMessage.includes("connection")) {
          setError("Feed service unavailable. Try again later.");
        } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
          setError("Feed not found or no longer available.");
        } else if (errorMessage.includes("parse") || errorMessage.includes("Parse")) {
          setError("Unable to read feed format.");
        } else {
          setError("Subscription failed. Please try again.");
        }
      } finally {
        setIsSubscribing(false);
      }
    },
    [feed, isSubscribed, isSubscribing, addFeed, addArticles, onSuccess]
  );

  if (isSubscribed) {
    return (
      <button
        disabled
        className={cn(
          "flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400",
          variant === "large"
            ? "w-full py-2.5 rounded-xl bg-emerald-500/10"
            : "text-xs px-2 py-1"
        )}
      >
        <DoodleCheck size="sm" />
        <span className={variant === "large" ? "font-medium" : ""}>
          Subscribed
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-stretch">
      <button
        onClick={handleSubscribe}
        disabled={isSubscribing}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-xl transition-all",
          "bg-sage-500 text-cream-50 hover:bg-sage-600 shadow-soft hover:shadow-soft-lg",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "large"
            ? "w-full py-2.5 text-sm font-medium"
            : "px-3 py-1.5 text-xs"
        )}
      >
        {isSubscribing ? (
          <span className="animate-spin">
            <DoodleLoader size="sm" />
          </span>
        ) : (
          <>
            <DoodlePlus size="sm" />
            <span>Subscribe</span>
          </>
        )}
      </button>
      {error && (
        <p className={cn(
          "text-xs text-red-500",
          variant === "large" ? "mt-2 text-center" : "mt-1 text-right max-w-[120px]"
        )}>
          {error}
        </p>
      )}
    </div>
  );
}
