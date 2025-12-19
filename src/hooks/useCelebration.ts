"use client";

import { useCallback, useEffect } from "react";
import confetti from "canvas-confetti";
import { useStatsStore, Milestone } from "@/stores/statsStore";

// Milestone labels for toast messages
const MILESTONE_LABELS: Record<string, Record<number, string>> = {
  articles_read: {
    10: "10 articles read!",
    50: "50 articles read!",
    100: "100 articles read!",
    250: "250 articles read!",
    500: "500 articles read!",
    1000: "1,000 articles read!",
    2500: "2,500 articles read!",
    5000: "5,000 articles read!",
  },
  streak: {
    7: "7-day streak!",
    14: "2-week streak!",
    30: "30-day streak!",
    60: "60-day streak!",
    100: "100-day streak!",
  },
};

export function useCelebration() {
  const { uncelebratedMilestones, celebrateMilestones } = useStatsStore();

  // Trigger confetti animation
  const triggerConfetti = useCallback(() => {
    // Check for reduced motion preference
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;
    }

    // Subtle confetti burst
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#829F7B", "#B5D6A7", "#6B8E5F", "#E8F0E4"],
      disableForReducedMotion: true,
      ticks: 150,
      gravity: 1.2,
      scalar: 0.8,
    });
  }, []);

  // Get label for a milestone
  const getMilestoneLabel = useCallback((milestone: Milestone): string => {
    const typeLabels = MILESTONE_LABELS[milestone.milestone_type];
    if (typeLabels && typeLabels[milestone.milestone_value]) {
      return typeLabels[milestone.milestone_value];
    }
    return `${milestone.milestone_value} ${milestone.milestone_type.replace(
      "_",
      " "
    )}!`;
  }, []);

  // Celebrate and mark milestones as celebrated
  const celebrate = useCallback(
    async (milestones: Milestone[]) => {
      if (milestones.length === 0) return;

      // Trigger confetti
      triggerConfetti();

      // Mark as celebrated
      await celebrateMilestones(milestones.map((m) => m.id));
    },
    [triggerConfetti, celebrateMilestones]
  );

  return {
    uncelebratedMilestones,
    triggerConfetti,
    getMilestoneLabel,
    celebrate,
  };
}

// Hook to auto-celebrate new milestones
export function useAutoCelebration(onMilestone?: (label: string) => void) {
  const { uncelebratedMilestones, celebrate, getMilestoneLabel } =
    useCelebration();

  useEffect(() => {
    if (uncelebratedMilestones.length > 0) {
      // Get the most recent milestone
      const latestMilestone = uncelebratedMilestones[0];
      const label = getMilestoneLabel(latestMilestone);

      // Notify callback
      onMilestone?.(label);

      // Celebrate all uncelebrated milestones
      celebrate(uncelebratedMilestones);
    }
  }, [uncelebratedMilestones, celebrate, getMilestoneLabel, onMilestone]);
}
