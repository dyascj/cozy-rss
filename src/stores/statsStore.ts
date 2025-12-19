import { create } from "zustand";

export interface DailyStat {
  id: string;
  user_id: string;
  date: string;
  articles_read: number;
  feeds_completed: number;
}

export interface Milestone {
  id: string;
  user_id: string;
  milestone_type: string;
  milestone_value: number;
  achieved_at: string;
  celebrated: boolean;
}

interface StatsState {
  streak: number;
  totalArticlesRead: number;
  thisWeekArticles: number;
  thisMonthArticles: number;
  totalFeedsCompleted: number;
  dailyStats: DailyStat[];
  uncelebratedMilestones: Milestone[];
  allMilestones: Milestone[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface StatsActions {
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  recordArticleRead: () => Promise<void>;
  recordFeedCompleted: (feedId: string) => Promise<void>;
  celebrateMilestones: (milestoneIds: string[]) => Promise<void>;
  getNextMilestone: () => number;
  getProgressToNextMilestone: () => number;
  reset: () => void;
}

const initialState: StatsState = {
  streak: 0,
  totalArticlesRead: 0,
  thisWeekArticles: 0,
  thisMonthArticles: 0,
  totalFeedsCompleted: 0,
  dailyStats: [],
  uncelebratedMilestones: [],
  allMilestones: [],
  isLoading: false,
  isInitialized: false,
  error: null,
};

const MILESTONES = [10, 50, 100, 250, 500, 1000, 2500, 5000];

export const useStatsStore = create<StatsState & StatsActions>()((set, get) => ({
  ...initialState,

  initialize: async () => {
    if (get().isInitialized || get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");

      const data = await res.json();

      set({
        streak: data.streak || 0,
        totalArticlesRead: data.totalArticlesRead || 0,
        thisWeekArticles: data.thisWeekArticles || 0,
        thisMonthArticles: data.thisMonthArticles || 0,
        totalFeedsCompleted: data.totalFeedsCompleted || 0,
        dailyStats: data.dailyStats || [],
        uncelebratedMilestones: data.uncelebratedMilestones || [],
        allMilestones: data.allMilestones || [],
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Failed to initialize stats store:", error);
      set({
        isLoading: false,
        isInitialized: true,
        error: error instanceof Error ? error.message : "Failed to load stats",
      });
    }
  },

  refresh: async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");

      const data = await res.json();

      set({
        streak: data.streak || 0,
        totalArticlesRead: data.totalArticlesRead || 0,
        thisWeekArticles: data.thisWeekArticles || 0,
        thisMonthArticles: data.thisMonthArticles || 0,
        totalFeedsCompleted: data.totalFeedsCompleted || 0,
        dailyStats: data.dailyStats || [],
        uncelebratedMilestones: data.uncelebratedMilestones || [],
        allMilestones: data.allMilestones || [],
      });
    } catch (error) {
      console.error("Failed to refresh stats:", error);
    }
  },

  recordArticleRead: async () => {
    // Optimistic update
    set((state) => ({
      totalArticlesRead: state.totalArticlesRead + 1,
      thisWeekArticles: state.thisWeekArticles + 1,
      thisMonthArticles: state.thisMonthArticles + 1,
    }));

    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "article_read" }),
      });

      if (!res.ok) throw new Error("Failed to record article read");

      // Refresh to get any new milestones
      await get().refresh();
    } catch (error) {
      console.error("Failed to record article read:", error);
      // Revert optimistic update
      set((state) => ({
        totalArticlesRead: state.totalArticlesRead - 1,
        thisWeekArticles: state.thisWeekArticles - 1,
        thisMonthArticles: state.thisMonthArticles - 1,
      }));
    }
  },

  recordFeedCompleted: async (feedId: string) => {
    set((state) => ({
      totalFeedsCompleted: state.totalFeedsCompleted + 1,
    }));

    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "feed_completed", feedId }),
      });

      if (!res.ok) throw new Error("Failed to record feed completed");
    } catch (error) {
      console.error("Failed to record feed completed:", error);
      set((state) => ({
        totalFeedsCompleted: state.totalFeedsCompleted - 1,
      }));
    }
  },

  celebrateMilestones: async (milestoneIds: string[]) => {
    if (milestoneIds.length === 0) return;

    // Optimistic update
    set((state) => ({
      uncelebratedMilestones: state.uncelebratedMilestones.filter(
        (m) => !milestoneIds.includes(m.id)
      ),
    }));

    try {
      const res = await fetch("/api/stats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneIds }),
      });

      if (!res.ok) throw new Error("Failed to celebrate milestones");
    } catch (error) {
      console.error("Failed to celebrate milestones:", error);
      // Refresh to restore state
      await get().refresh();
    }
  },

  getNextMilestone: () => {
    const { totalArticlesRead } = get();
    for (const milestone of MILESTONES) {
      if (totalArticlesRead < milestone) {
        return milestone;
      }
    }
    return MILESTONES[MILESTONES.length - 1];
  },

  getProgressToNextMilestone: () => {
    const { totalArticlesRead } = get();
    const nextMilestone = get().getNextMilestone();

    // Find previous milestone
    let prevMilestone = 0;
    for (const milestone of MILESTONES) {
      if (milestone >= nextMilestone) break;
      if (totalArticlesRead >= milestone) {
        prevMilestone = milestone;
      }
    }

    const progress = totalArticlesRead - prevMilestone;
    const total = nextMilestone - prevMilestone;

    return Math.min(100, Math.round((progress / total) * 100));
  },

  reset: () => {
    set(initialState);
  },
}));
