"use client";

import { useStatsStore, DailyStat } from "@/stores/statsStore";
import { cn } from "@/utils/cn";
import {
  DoodleFire,
  DoodleTrophy,
  DoodleStar,
  DoodleZap,
  DoodleCheckCircle,
  DoodleBookOpen,
} from "@/components/ui/DoodleIcon";

export function StreakCard() {
  const { streak, dailyStats } = useStatsStore();

  // Generate last 30 days for calendar
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split("T")[0]);
  }

  // Create a map of date -> articles read
  const statsMap = new Map<string, number>();
  dailyStats.forEach((stat: DailyStat) => {
    statsMap.set(stat.date, stat.articles_read);
  });

  // Get intensity level for heat map
  const getIntensity = (count: number): string => {
    if (count === 0) return "bg-muted/50";
    if (count <= 2) return "bg-accent/30";
    if (count <= 5) return "bg-accent/50";
    if (count <= 10) return "bg-accent/70";
    return "bg-accent";
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-3 mb-4">
        <DoodleFire size="xl" className="text-accent" />
        <div>
          <p className="text-2xl font-bold">{streak}</p>
          <p className="text-sm text-muted-foreground">
            {streak === 1 ? "day streak" : "day streak"}
          </p>
        </div>
      </div>

      {/* Calendar heat map */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground mb-2">Last 30 days</p>
        <div className="grid grid-cols-10 gap-1">
          {days.map((day) => {
            const count = statsMap.get(day) || 0;
            const isToday = day === today.toISOString().split("T")[0];
            return (
              <div
                key={day}
                className={cn(
                  "w-full aspect-square rounded-sm transition-colors",
                  getIntensity(count),
                  isToday && "ring-1 ring-foreground/30"
                )}
                title={`${day}: ${count} articles`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-muted/50" />
          <div className="w-2.5 h-2.5 rounded-sm bg-accent/30" />
          <div className="w-2.5 h-2.5 rounded-sm bg-accent/50" />
          <div className="w-2.5 h-2.5 rounded-sm bg-accent/70" />
          <div className="w-2.5 h-2.5 rounded-sm bg-accent" />
          <span>More</span>
        </div>
      </div>

      {/* Streak milestones */}
      {streak > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {streak >= 100 ? (
              <>
                <DoodleTrophy size="sm" className="text-accent" />
                <span>Legendary reader!</span>
              </>
            ) : streak >= 30 ? (
              <>
                <DoodleStar size="sm" className="text-accent" />
                <span>Amazing dedication!</span>
              </>
            ) : streak >= 14 ? (
              <>
                <DoodleZap size="sm" className="text-accent" />
                <span>Keep it up!</span>
              </>
            ) : streak >= 7 ? (
              <>
                <DoodleCheckCircle size="sm" className="text-accent" />
                <span>One week strong!</span>
              </>
            ) : (
              <>
                <DoodleBookOpen size="sm" className="text-accent" />
                <span>Building the habit!</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
