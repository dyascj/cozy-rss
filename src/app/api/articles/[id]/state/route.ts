import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import * as articleRepo from "@/lib/db/repositories/articleRepository";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isRead, isStarred, isReadLater, article } = body;

    // Determine the actual article ID to use
    let articleId = id;

    // If article data is provided, ensure the article exists in the database
    if (article) {
      // Convert publishedAt timestamp to ISO string if it's a number
      const publishedAt = article.publishedAt
        ? typeof article.publishedAt === "number"
          ? new Date(article.publishedAt).toISOString()
          : article.publishedAt
        : undefined;

      // ensureArticleExists returns the actual article ID (which may differ if article already exists)
      articleId = await articleRepo.ensureArticleExists({
        id,
        feedId: article.feedId,
        guid: article.guid || id,
        title: article.title,
        link: article.link,
        content: article.content,
        summary: article.summary,
        author: article.author,
        imageUrl: article.imageUrl,
        publishedAt,
      });
    }

    const state = await articleRepo.updateArticleState(articleId, user.id, {
      isRead,
      isStarred,
      isReadLater,
    });

    if (!state) {
      return NextResponse.json(
        { error: "Failed to update article state" },
        { status: 500 }
      );
    }

    return NextResponse.json({ state });
  } catch (error) {
    console.error("Error updating article state:", error);
    return NextResponse.json(
      { error: "Failed to update article state" },
      { status: 500 }
    );
  }
}
