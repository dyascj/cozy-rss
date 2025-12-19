"use client";

import { useStatsStore } from "@/stores/statsStore";

export function ArticlesReadCard() {
  const {
    totalArticlesRead,
    thisWeekArticles,
    thisMonthArticles,
    getNextMilestone,
    getProgressToNextMilestone,
    allMilestones,
  } = useStatsStore();

  const nextMilestone = getNextMilestone();
  const progress = getProgressToNextMilestone();

  // Calculate circle progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Get achieved milestones for articles_read
  const achievedMilestones = allMilestones
    .filter((m) => m.milestone_type === "articles_read")
    .map((m) => m.milestone_value);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Articles Read</p>
          <p className="text-3xl font-bold">{totalArticlesRead}</p>
        </div>

        {/* Progress ring */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke="rgb(var(--muted))"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke="rgb(var(--accent))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Next</span>
            <span className="text-sm font-semibold">{nextMilestone}</span>
          </div>
        </div>
      </div>

      {/* Time-based stats */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-border">
        <div>
          <p className="text-lg font-semibold">{thisWeekArticles}</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{thisMonthArticles}</p>
          <p className="text-xs text-muted-foreground">This month</p>
        </div>
      </div>

      {/* Milestone badges */}
      {achievedMilestones.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Milestones</p>
          <div className="flex flex-wrap gap-2">
            {[10, 50, 100, 250, 500, 1000].map((milestone) => (
              <span
                key={milestone}
                className={`text-xs px-2 py-1 rounded-full ${
                  achievedMilestones.includes(milestone)
                    ? "bg-accent/20 text-accent"
                    : "bg-muted/50 text-muted-foreground/50"
                }`}
              >
                {milestone}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
