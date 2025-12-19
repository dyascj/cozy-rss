"use client";

import { useStatsStore } from "@/stores/statsStore";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { FeedIcon } from "@/components/ui/FeedIcon";
import { DoodleSparkles } from "@/components/ui/DoodleIcon";

export function TopFeedsCard() {
  const { totalFeedsCompleted } = useStatsStore();
  const { feeds } = useFeedStore();
  const { articles, articlesByFeed } = useArticleStore();

  // Calculate articles read per feed
  const feedStats = Object.entries(articlesByFeed)
    .map(([feedId, articleIds]) => {
      const feed = feeds[feedId];
      if (!feed) return null;

      const readCount = articleIds.filter(
        (id) => articles[id]?.isRead
      ).length;

      return {
        feedId,
        feed,
        readCount,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.readCount || 0) - (a?.readCount || 0))
    .slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Inbox Zero</p>
          <p className="text-2xl font-bold">{totalFeedsCompleted}</p>
          <p className="text-xs text-muted-foreground">times achieved</p>
        </div>
        <DoodleSparkles size="xl" className="text-accent" />
      </div>

      {feedStats.length > 0 && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">
            Most read feeds
          </p>
          <div className="space-y-2">
            {feedStats.map((stat) => {
              if (!stat) return null;
              return (
                <div
                  key={stat.feedId}
                  className="flex items-center gap-2"
                >
                  <FeedIcon
                    iconUrl={stat.feed.iconUrl}
                    siteUrl={stat.feed.siteUrl}
                    title={stat.feed.title}
                    size="sm"
                  />
                  <span className="flex-1 text-sm truncate">
                    {stat.feed.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.readCount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
