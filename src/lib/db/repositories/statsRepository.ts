import { db } from "@/lib/db";
import { readingStats, userMilestones } from "@/lib/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

export interface ReadingStat {
  id: string;
  userId: string;
  date: string;
  articlesRead: number;
  feedsCompleted: number;
}

export interface UserMilestone {
  id: string;
  userId: string;
  milestoneType: string;
  milestoneValue: number;
  celebrated: boolean;
  achievedAt: string;
}

// Get reading stats for a date range
export async function getReadingStats(
  userId: string,
  sinceDate: string
): Promise<ReadingStat[]> {
  return db
    .select()
    .from(readingStats)
    .where(
      and(eq(readingStats.userId, userId), gte(readingStats.date, sinceDate))
    )
    .orderBy(desc(readingStats.date))
    .all();
}

// Get total articles read (all time)
export async function getTotalArticlesRead(userId: string): Promise<number> {
  const result = db
    .select({
      total: sql<number>`coalesce(sum(${readingStats.articlesRead}), 0)`,
    })
    .from(readingStats)
    .where(eq(readingStats.userId, userId))
    .get();

  return result?.total ?? 0;
}

// Get uncelebrated milestones
export async function getUncelebratedMilestones(
  userId: string
): Promise<UserMilestone[]> {
  return db
    .select()
    .from(userMilestones)
    .where(
      and(
        eq(userMilestones.userId, userId),
        eq(userMilestones.celebrated, false)
      )
    )
    .orderBy(desc(userMilestones.achievedAt))
    .all();
}

// Get all milestones
export async function getAllMilestones(
  userId: string
): Promise<UserMilestone[]> {
  return db
    .select()
    .from(userMilestones)
    .where(eq(userMilestones.userId, userId))
    .orderBy(desc(userMilestones.achievedAt))
    .all();
}

// Upsert daily stats -- increment articles_read or feeds_completed for today
export async function incrementDailyStat(
  userId: string,
  date: string,
  field: "articlesRead" | "feedsCompleted"
): Promise<void> {
  const existing = db
    .select()
    .from(readingStats)
    .where(
      and(eq(readingStats.userId, userId), eq(readingStats.date, date))
    )
    .get();

  if (existing) {
    const newValue =
      (field === "articlesRead"
        ? existing.articlesRead
        : existing.feedsCompleted) + 1;

    db.update(readingStats)
      .set({ [field]: newValue })
      .where(eq(readingStats.id, existing.id))
      .run();
  } else {
    db.insert(readingStats)
      .values({
        userId,
        date,
        articlesRead: field === "articlesRead" ? 1 : 0,
        feedsCompleted: field === "feedsCompleted" ? 1 : 0,
      })
      .run();
  }
}

// Check and create milestones based on total articles read
export async function checkAndCreateMilestones(
  userId: string,
  totalArticles: number
): Promise<void> {
  const milestoneValues = [10, 50, 100, 250, 500, 1000, 2500, 5000];

  for (const milestone of milestoneValues) {
    if (totalArticles >= milestone) {
      const existing = db
        .select()
        .from(userMilestones)
        .where(
          and(
            eq(userMilestones.userId, userId),
            eq(userMilestones.milestoneType, "articles_read"),
            eq(userMilestones.milestoneValue, milestone)
          )
        )
        .get();

      if (!existing) {
        db.insert(userMilestones)
          .values({
            userId,
            milestoneType: "articles_read",
            milestoneValue: milestone,
            celebrated: false,
          })
          .run();
      }
    }
  }
}

// Mark milestones as celebrated
export async function celebrateMilestones(
  userId: string,
  milestoneIds: string[]
): Promise<void> {
  for (const id of milestoneIds) {
    db.update(userMilestones)
      .set({ celebrated: true })
      .where(
        and(eq(userMilestones.id, id), eq(userMilestones.userId, userId))
      )
      .run();
  }
}
