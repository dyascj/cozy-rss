import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import {
  getReadingStats,
  getTotalArticlesRead,
  getUncelebratedMilestones,
  getAllMilestones,
  incrementDailyStat,
  checkAndCreateMilestones,
  celebrateMilestones,
} from "@/lib/db/repositories/statsRepository";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get reading stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sinceDate = thirtyDaysAgo.toISOString().split("T")[0];

    const readingStatsData = await getReadingStats(user.id, sinceDate);
    const totalArticlesRead = await getTotalArticlesRead(user.id);
    const uncelebratedMilestones = await getUncelebratedMilestones(user.id);
    const allMilestonesData = await getAllMilestones(user.id);

    // Map camelCase fields to snake_case for response compatibility
    const dailyStats = readingStatsData.map((s) => ({
      id: s.id,
      user_id: s.userId,
      date: s.date,
      articles_read: s.articlesRead,
      feeds_completed: s.feedsCompleted,
    }));

    // Calculate streak
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    if (dailyStats.length > 0) {
      const sortedStats = [...dailyStats].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      let expectedDate = today;
      // Allow starting from today or yesterday
      const firstDate = sortedStats[0]?.date;
      if (firstDate !== today && firstDate !== yesterday) {
        streak = 0;
      } else {
        expectedDate = firstDate;
        for (const stat of sortedStats) {
          if (
            stat.date === expectedDate &&
            stat.articles_read &&
            stat.articles_read > 0
          ) {
            streak++;
            const nextDate = new Date(expectedDate);
            nextDate.setDate(nextDate.getDate() - 1);
            expectedDate = nextDate.toISOString().split("T")[0];
          } else if (stat.date !== expectedDate) {
            break;
          }
        }
      }
    }

    // Calculate this week/month totals
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeekArticles =
      dailyStats
        .filter((s) => new Date(s.date) >= startOfWeek)
        .reduce((sum, s) => sum + (s.articles_read || 0), 0) || 0;

    const thisMonthArticles =
      dailyStats
        .filter((s) => new Date(s.date) >= startOfMonth)
        .reduce((sum, s) => sum + (s.articles_read || 0), 0) || 0;

    const totalFeedsCompleted =
      dailyStats.reduce((sum, s) => sum + (s.feeds_completed || 0), 0) || 0;

    // Map milestones to snake_case for response compatibility
    const mapMilestone = (m: {
      id: string;
      userId: string;
      milestoneType: string;
      milestoneValue: number;
      celebrated: boolean;
      achievedAt: string;
    }) => ({
      id: m.id,
      user_id: m.userId,
      milestone_type: m.milestoneType,
      milestone_value: m.milestoneValue,
      celebrated: m.celebrated,
      achieved_at: m.achievedAt,
    });

    return NextResponse.json({
      streak,
      totalArticlesRead,
      thisWeekArticles,
      thisMonthArticles,
      totalFeedsCompleted,
      dailyStats,
      uncelebratedMilestones: uncelebratedMilestones.map(mapMilestone),
      allMilestones: allMilestonesData.map(mapMilestone),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

// Record an article read
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const today = new Date().toISOString().split("T")[0];

    if (action === "article_read") {
      await incrementDailyStat(user.id, today, "articlesRead");

      // Check for milestones
      const totalArticles = await getTotalArticlesRead(user.id);
      await checkAndCreateMilestones(user.id, totalArticles);
    } else if (action === "feed_completed") {
      await incrementDailyStat(user.id, today, "feedsCompleted");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording stat:", error);
    return NextResponse.json(
      { error: "Failed to record stat" },
      { status: 500 }
    );
  }
}

// Mark milestones as celebrated
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { milestoneIds } = body;

    if (!milestoneIds || !Array.isArray(milestoneIds)) {
      return NextResponse.json(
        { error: "Invalid milestone IDs" },
        { status: 400 }
      );
    }

    await celebrateMilestones(user.id, milestoneIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating milestones:", error);
    return NextResponse.json(
      { error: "Failed to update milestones" },
      { status: 500 }
    );
  }
}
