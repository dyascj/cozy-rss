import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import * as articleRepo from "@/lib/db/repositories/articleRepository";

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
      articles = articleRepo.getArticlesByFeed(feedId, user.id, limit);
    } else {
      articles = articleRepo.getArticlesByUser(user.id, {
        isStarred: isStarred || undefined,
        isReadLater: isReadLater || undefined,
        isUnread: isUnread || undefined,
        limit,
        offset,
      });
    }

    // Transform to match existing store format
    const articlesMap: Record<string, typeof articles[0]> = {};
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
