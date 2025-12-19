import { db } from "@/lib/db";
import { articles, articleStates, feeds } from "@/lib/db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";

export interface Article {
  id: string;
  feedId: string;
  guid: string;
  title: string;
  link: string | null;
  author: string | null;
  summary: string | null;
  content: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  fetchedAt: string;
  readerContent: string | null;
  readerError: string | null;
}

export interface ArticleState {
  id: string;
  userId: string;
  articleId: string;
  isRead: boolean;
  isStarred: boolean;
  isReadLater: boolean;
  readLaterAddedAt: string | null;
  readAt: string | null;
  starredAt: string | null;
}

export interface ArticleWithState extends Article {
  isRead: boolean;
  isStarred: boolean;
  isReadLater: boolean;
  readLaterAddedAt: string | null;
}

function mapRowToArticleWithState(row: {
  article: typeof articles.$inferSelect;
  state: typeof articleStates.$inferSelect | null;
}): ArticleWithState {
  return {
    ...row.article,
    isRead: row.state?.isRead ?? false,
    isStarred: row.state?.isStarred ?? false,
    isReadLater: row.state?.isReadLater ?? false,
    readLaterAddedAt: row.state?.readLaterAddedAt ?? null,
  };
}

export async function getArticlesByFeed(
  feedId: string,
  userId: string,
  limit: number = 50
): Promise<ArticleWithState[]> {
  const rows = db
    .select({
      article: articles,
      state: articleStates,
    })
    .from(articles)
    .leftJoin(
      articleStates,
      and(
        eq(articleStates.articleId, articles.id),
        eq(articleStates.userId, userId)
      )
    )
    .where(eq(articles.feedId, feedId))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .all();

  return rows.map(mapRowToArticleWithState);
}

export async function getArticlesByUser(
  userId: string,
  options: {
    feedIds?: string[];
    isStarred?: boolean;
    isReadLater?: boolean;
    isUnread?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): Promise<ArticleWithState[]> {
  // First get the user's feeds
  const userFeeds = db
    .select({ id: feeds.id })
    .from(feeds)
    .where(eq(feeds.userId, userId))
    .all();

  const userFeedIds = userFeeds.map((f) => f.id);

  if (userFeedIds.length === 0) return [];

  const feedIdsToQuery = options.feedIds
    ? options.feedIds.filter((id) => userFeedIds.includes(id))
    : userFeedIds;

  if (feedIdsToQuery.length === 0) return [];

  let query = db
    .select({
      article: articles,
      state: articleStates,
    })
    .from(articles)
    .leftJoin(
      articleStates,
      and(
        eq(articleStates.articleId, articles.id),
        eq(articleStates.userId, userId)
      )
    )
    .where(inArray(articles.feedId, feedIdsToQuery))
    .orderBy(desc(articles.publishedAt))
    .limit(options.limit || 100);

  if (options.offset) {
    query = query.offset(options.offset) as typeof query;
  }

  const rows = query.all();

  let results = rows.map(mapRowToArticleWithState);

  // Filter based on options
  if (options.isStarred) {
    results = results.filter((a) => a.isStarred);
  }
  if (options.isReadLater) {
    results = results.filter((a) => a.isReadLater);
  }
  if (options.isUnread) {
    results = results.filter((a) => !a.isRead);
  }

  return results;
}

export async function getArticleById(
  articleId: string,
  userId: string
): Promise<ArticleWithState | null> {
  const row = db
    .select({
      article: articles,
      state: articleStates,
    })
    .from(articles)
    .leftJoin(
      articleStates,
      and(
        eq(articleStates.articleId, articles.id),
        eq(articleStates.userId, userId)
      )
    )
    .where(eq(articles.id, articleId))
    .get();

  if (!row) return null;

  return mapRowToArticleWithState(row);
}

export async function createArticle(data: {
  feedId: string;
  guid: string;
  title: string;
  link: string;
  author?: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  publishedAt: string;
}): Promise<Article> {
  try {
    return db
      .insert(articles)
      .values({
        feedId: data.feedId,
        guid: data.guid,
        title: data.title,
        link: data.link,
        author: data.author || null,
        summary: data.summary || null,
        content: data.content || null,
        imageUrl: data.imageUrl || null,
        publishedAt: data.publishedAt,
        fetchedAt: new Date().toISOString(),
      })
      .returning()
      .get();
  } catch (err: unknown) {
    // Handle duplicate - article already exists
    if (
      err instanceof Error &&
      err.message.includes("UNIQUE constraint failed")
    ) {
      const existing = db
        .select()
        .from(articles)
        .where(
          and(eq(articles.feedId, data.feedId), eq(articles.guid, data.guid))
        )
        .get();
      if (existing) return existing;
    }
    throw err;
  }
}

export async function createArticlesBulk(
  articleData: {
    feedId: string;
    guid: string;
    title: string;
    link: string;
    author?: string;
    summary?: string;
    content?: string;
    imageUrl?: string;
    publishedAt: string;
  }[]
): Promise<Article[]> {
  if (articleData.length === 0) return [];

  const fetchedAt = new Date().toISOString();

  const insertData = articleData.map((data) => ({
    feedId: data.feedId,
    guid: data.guid,
    title: data.title,
    link: data.link,
    author: data.author || null,
    summary: data.summary || null,
    content: data.content || null,
    imageUrl: data.imageUrl || null,
    publishedAt: data.publishedAt,
    fetchedAt,
  }));

  return db
    .insert(articles)
    .values(insertData)
    .onConflictDoNothing()
    .returning()
    .all();
}

export async function updateArticleState(
  articleId: string,
  userId: string,
  data: {
    isRead?: boolean;
    isStarred?: boolean;
    isReadLater?: boolean;
  }
): Promise<ArticleState | null> {
  const timestamp = new Date().toISOString();

  // Check if state exists
  const existingState = db
    .select()
    .from(articleStates)
    .where(
      and(
        eq(articleStates.articleId, articleId),
        eq(articleStates.userId, userId)
      )
    )
    .get();

  if (!existingState) {
    // Create new state
    const newState = db
      .insert(articleStates)
      .values({
        userId,
        articleId,
        isRead: data.isRead ?? false,
        isStarred: data.isStarred ?? false,
        isReadLater: data.isReadLater ?? false,
        readAt: data.isRead ? timestamp : null,
        starredAt: data.isStarred ? timestamp : null,
        readLaterAddedAt: data.isReadLater ? timestamp : null,
      })
      .returning()
      .get();

    return {
      id: newState.id,
      userId: newState.userId,
      articleId: newState.articleId,
      isRead: newState.isRead,
      isStarred: newState.isStarred,
      isReadLater: newState.isReadLater,
      readLaterAddedAt: newState.readLaterAddedAt,
      readAt: newState.readAt,
      starredAt: newState.starredAt,
    };
  }

  // Update existing state
  const updateData: Record<string, unknown> = {};

  if (data.isRead !== undefined) {
    updateData.isRead = data.isRead;
    updateData.readAt = data.isRead ? timestamp : null;
  }
  if (data.isStarred !== undefined) {
    updateData.isStarred = data.isStarred;
    updateData.starredAt = data.isStarred ? timestamp : null;
  }
  if (data.isReadLater !== undefined) {
    updateData.isReadLater = data.isReadLater;
    updateData.readLaterAddedAt = data.isReadLater ? timestamp : null;
  }

  const updatedState = db
    .update(articleStates)
    .set(updateData)
    .where(
      and(
        eq(articleStates.articleId, articleId),
        eq(articleStates.userId, userId)
      )
    )
    .returning()
    .get();

  if (!updatedState) return null;

  return {
    id: updatedState.id,
    userId: updatedState.userId,
    articleId: updatedState.articleId,
    isRead: updatedState.isRead,
    isStarred: updatedState.isStarred,
    isReadLater: updatedState.isReadLater,
    readLaterAddedAt: updatedState.readLaterAddedAt,
    readAt: updatedState.readAt,
    starredAt: updatedState.starredAt,
  };
}

export async function markAllAsRead(
  feedId: string,
  userId: string
): Promise<number> {
  const timestamp = new Date().toISOString();

  // Get all articles for the feed
  const feedArticles = db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.feedId, feedId))
    .all();

  if (feedArticles.length === 0) return 0;

  let updated = 0;
  for (const article of feedArticles) {
    const existing = db
      .select({ id: articleStates.id })
      .from(articleStates)
      .where(
        and(
          eq(articleStates.articleId, article.id),
          eq(articleStates.userId, userId)
        )
      )
      .get();

    if (existing) {
      db.update(articleStates)
        .set({ isRead: true, readAt: timestamp })
        .where(
          and(
            eq(articleStates.articleId, article.id),
            eq(articleStates.userId, userId)
          )
        )
        .run();
    } else {
      db.insert(articleStates)
        .values({
          userId,
          articleId: article.id,
          isRead: true,
          readAt: timestamp,
        })
        .run();
    }
    updated++;
  }

  return updated;
}

export async function updateReaderContent(
  articleId: string,
  content: string | null,
  error: string | null
): Promise<void> {
  db.update(articles)
    .set({ readerContent: content, readerError: error })
    .where(eq(articles.id, articleId))
    .run();
}

export async function batchUpdateArticleStates(
  userId: string,
  articleIds: string[],
  data: {
    isRead?: boolean;
    isStarred?: boolean;
    isReadLater?: boolean;
  }
): Promise<number> {
  if (articleIds.length === 0) return 0;

  let updated = 0;
  for (const articleId of articleIds) {
    await updateArticleState(articleId, userId, data);
    updated++;
  }

  return updated;
}

export async function pruneArticles(
  feedId: string,
  maxArticles: number
): Promise<number> {
  // Get articles with starred state
  const rows = db
    .select({
      article: articles,
      state: articleStates,
    })
    .from(articles)
    .leftJoin(articleStates, eq(articleStates.articleId, articles.id))
    .where(eq(articles.feedId, feedId))
    .orderBy(desc(articles.publishedAt))
    .all();

  if (rows.length === 0) return 0;

  // Sort: starred first, then by recency (already ordered by publishedAt desc)
  const sorted = rows.sort((a, b) => {
    const aStarred = a.state?.isStarred ?? false;
    const bStarred = b.state?.isStarred ?? false;
    if (aStarred && !bStarred) return -1;
    if (!aStarred && bStarred) return 1;
    return 0;
  });

  const keepIds = new Set(
    sorted.slice(0, maxArticles).map((r) => r.article.id)
  );
  const toDelete = sorted
    .filter((r) => !keepIds.has(r.article.id))
    .map((r) => r.article.id);

  if (toDelete.length === 0) return 0;

  db.delete(articles).where(inArray(articles.id, toDelete)).run();

  return toDelete.length;
}

// Ensure article exists (for compatibility)
// Returns the actual article ID (may differ from input if article already exists)
export async function ensureArticleExists(data: {
  id: string;
  feedId: string;
  guid: string;
  title: string;
  link: string;
  content?: string | null;
  summary?: string | null;
  author?: string | null;
  imageUrl?: string | null;
  publishedAt?: string;
}): Promise<string> {
  // First check if article already exists by feedId and guid
  const existing = db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.feedId, data.feedId), eq(articles.guid, data.guid)))
    .get();

  if (existing) {
    return existing.id;
  }

  // Insert new article
  try {
    const inserted = db
      .insert(articles)
      .values({
        id: data.id,
        feedId: data.feedId,
        guid: data.guid,
        title: data.title,
        link: data.link,
        content: data.content || null,
        summary: data.summary || null,
        author: data.author || null,
        imageUrl: data.imageUrl || null,
        publishedAt: data.publishedAt || new Date().toISOString(),
        fetchedAt: new Date().toISOString(),
      })
      .returning()
      .get();

    return inserted.id;
  } catch {
    // If insert failed due to conflict, try to get existing
    const fallback = db
      .select({ id: articles.id })
      .from(articles)
      .where(
        and(eq(articles.feedId, data.feedId), eq(articles.guid, data.guid))
      )
      .get();
    return fallback?.id || data.id;
  }
}
