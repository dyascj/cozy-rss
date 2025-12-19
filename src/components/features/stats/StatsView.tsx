"use client";

import { useEffect } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { StreakCard } from "./StreakCard";
import { ArticlesReadCard } from "./ArticlesReadCard";
import { TopFeedsCard } from "./TopFeedsCard";
import { DoodleLoader, DoodleBookOpen } from "@/components/ui/DoodleIcon";

export function StatsView() {
  const { isInitialized, isLoading, error, initialize } = useStatsStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <DoodleLoader size="lg" className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-muted-foreground mb-2">
          Failed to load reading stats
        </p>
        <button
          onClick={() => initialize()}
          className="text-sm text-accent hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold mb-1">Reading Stats</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Track your reading progress and celebrate your milestones
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Streak Card - full width on mobile, half on desktop */}
          <div className="md:col-span-1">
            <StreakCard />
          </div>

          {/* Articles Read Card */}
          <div className="md:col-span-1">
            <ArticlesReadCard />
          </div>

          {/* Top Feeds Card - full width */}
          <div className="md:col-span-2">
            <TopFeedsCard />
          </div>
        </div>

        {/* Motivational footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
            Keep reading to unlock more milestones!
            <DoodleBookOpen size="sm" />
          </p>
        </div>
      </div>
    </div>
  );
}
