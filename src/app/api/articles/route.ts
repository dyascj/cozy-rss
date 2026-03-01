import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import * as articleRepo from "@/lib/db/repositories/articleRepository";
import * as feedRepo from "@/lib/db/repositories/feedRepository";

/**
 * POST /api/articles
 * Persist articles to the database (called after client-side feed parsing)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { feedId, articles: articleData } = body;

    if (!feedId || !Array.isArray(articleData) || articleData.length === 0) {
      return NextResponse.json(
        { error: "feedId and articles array required" },
        { status: 400 }
      );
    }

    // Verify feed ownership
    const feed = await feedRepo.getFeedById(feedId, user.id);
    if (!feed) {
      return NextResponse.json(
        { error: "Feed not found or access denied" },
        { status: 404 }
      );
    }

    const created = await articleRepo.createArticlesBulk(
      articleData.map((a: Record<string, unknown>) => ({
        feedId,
        guid: a.guid as string,
        title: a.title as string,
        link: (a.link as string) || "",
        author: a.author as string | undefined,
        summary: a.summary as string | undefined,
        content: a.content as string | undefined,
        imageUrl: a.imageUrl as string | undefined,
        publishedAt: a.publishedAt
          ? new Date(a.publishedAt as string | number).toISOString()
          : new Date().toISOString(),
      }))
    );

    return NextResponse.json({ created: created.length });
  } catch (error) {
    console.error("Error creating articles:", error);
    return NextResponse.json(
      { error: "Failed to create articles" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/articles
 * Batch update article states (e.g., mark multiple as read)
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { articleIds, isRead, isStarred, isReadLater } = body;

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return NextResponse.json(
        { error: "articleIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (articleIds.length > 500) {
      return NextResponse.json(
        { error: "Maximum batch size is 500 articles" },
        { status: 400 }
      );
    }

    const updateData: {
      isRead?: boolean;
      isStarred?: boolean;
      isReadLater?: boolean;
    } = {};

    if (isRead !== undefined) updateData.isRead = isRead;
    if (isStarred !== undefined) updateData.isStarred = isStarred;
    if (isReadLater !== undefined) updateData.isReadLater = isReadLater;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "At least one update field is required" },
        { status: 400 }
      );
    }

    const updated = await articleRepo.batchUpdateArticleStates(
      user.id,
      articleIds,
      updateData
    );

    return NextResponse.json({ updated });
  } catch (error) {
    console.error("Error batch updating articles:", error);
    return NextResponse.json(
      { error: "Failed to update articles" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const feedId = searchParams.get("feedId");
    const isStarred = searchParams.get("starred") === "true";
    const isReadLater = searchParams.get("readLater") === "true";
    const isUnread = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let articles;

    if (feedId) {
      // Verify feed ownership before fetching articles
      const feed = await feedRepo.getFeedById(feedId, user.id);
      if (!feed) {
        return NextResponse.json(
          { error: "Feed not found or access denied" },
          { status: 404 }
        );
      }
      articles = await articleRepo.getArticlesByFeed(feedId, user.id, limit);
    } else {
      articles = await articleRepo.getArticlesByUser(user.id, {
        isStarred: isStarred || undefined,
        isReadLater: isReadLater || undefined,
        isUnread: isUnread || undefined,
        limit,
        offset,
      });
    }

    // Transform to match existing store format
    const articlesMap: Record<string, (typeof articles)[0]> = {};
    const articlesByFeed: Record<string, string[]> = {};
    const starredArticles: string[] = [];
    const readLaterArticles: string[] = [];

    articles.forEach((article) => {
      articlesMap[article.id] = article;

      if (!articlesByFeed[article.feedId]) {
        articlesByFeed[article.feedId] = [];
      }
      articlesByFeed[article.feedId].push(article.id);

      if (article.isStarred) {
        starredArticles.push(article.id);
      }
      if (article.isReadLater) {
        readLaterArticles.push(article.id);
      }
    });

    return NextResponse.json({
      articles: articlesMap,
      articlesByFeed,
      starredArticles,
      readLaterArticles,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
