import { createClient } from "@/lib/supabase/server";

export interface Article {
  id: string;
  feedId: string;
  guid: string;
  title: string;
  link: string;
  author: string | null;
  summary: string | null;
  content: string | null;
  imageUrl: string | null;
  publishedAt: string;
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

interface ArticleRow {
  id: string;
  feed_id: string;
  guid: string;
  title: string;
  link: string;
  author: string | null;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  published_at: string;
  fetched_at: string;
  reader_content: string | null;
  reader_error: string | null;
}

function rowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    feedId: row.feed_id,
    guid: row.guid,
    title: row.title,
    link: row.link,
    author: row.author,
    summary: row.summary,
    content: row.content,
    imageUrl: row.image_url,
    publishedAt: row.published_at,
    fetchedAt: row.fetched_at,
    readerContent: row.reader_content,
    readerError: row.reader_error,
  };
}

export async function getArticlesByFeed(
  feedId: string,
  userId: string,
  limit: number = 50
): Promise<ArticleWithState[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      article_states!left(is_read, is_starred, is_read_later, read_later_added_at)
    `
    )
    .eq("feed_id", feedId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((row) => ({
    ...rowToArticle(row as ArticleRow),
    isRead: row.article_states?.[0]?.is_read ?? false,
    isStarred: row.article_states?.[0]?.is_starred ?? false,
    isReadLater: row.article_states?.[0]?.is_read_later ?? false,
    readLaterAddedAt: row.article_states?.[0]?.read_later_added_at ?? null,
  }));
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
  const supabase = await createClient();

  // First get the user's feeds
  const { data: userFeeds } = await supabase
    .from("feeds")
    .select("id")
    .eq("user_id", userId);

  const userFeedIds = userFeeds?.map((f) => f.id) || [];

  if (userFeedIds.length === 0) return [];

  const feedIdsToQuery = options.feedIds
    ? options.feedIds.filter((id) => userFeedIds.includes(id))
    : userFeedIds;

  if (feedIdsToQuery.length === 0) return [];

  let query = supabase
    .from("articles")
    .select(
      `
      *,
      article_states!left(is_read, is_starred, is_read_later, read_later_added_at, user_id)
    `
    )
    .in("feed_id", feedIdsToQuery)
    .order("published_at", { ascending: false })
    .limit(options.limit || 100);

  if (options.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 100) - 1
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  let results = (data || []).map((row) => {
    // Find the state for this user
    const state = row.article_states?.find(
      (s: { user_id: string }) => s.user_id === userId
    );
    return {
      ...rowToArticle(row as ArticleRow),
      isRead: state?.is_read ?? false,
      isStarred: state?.is_starred ?? false,
      isReadLater: state?.is_read_later ?? false,
      readLaterAddedAt: state?.read_later_added_at ?? null,
    };
  });

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
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      article_states!left(is_read, is_starred, is_read_later, read_later_added_at, user_id)
    `
    )
    .eq("id", articleId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  if (!data) return null;

  const state = data.article_states?.find(
    (s: { user_id: string }) => s.user_id === userId
  );

  return {
    ...rowToArticle(data as ArticleRow),
    isRead: state?.is_read ?? false,
    isStarred: state?.is_starred ?? false,
    isReadLater: state?.is_read_later ?? false,
    readLaterAddedAt: state?.read_later_added_at ?? null,
  };
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
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from("articles")
    .insert({
      feed_id: data.feedId,
      guid: data.guid,
      title: data.title,
      link: data.link,
      author: data.author || null,
      summary: data.summary || null,
      content: data.content || null,
      image_url: data.imageUrl || null,
      published_at: data.publishedAt,
      fetched_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    // Handle duplicate - article already exists
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("articles")
        .select("*")
        .eq("feed_id", data.feedId)
        .eq("guid", data.guid)
        .single();
      if (existing) return rowToArticle(existing);
    }
    throw error;
  }

  return rowToArticle(article);
}

export async function createArticlesBulk(
  articles: {
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
  const supabase = await createClient();
  const fetchedAt = new Date().toISOString();

  const insertData = articles.map((data) => ({
    feed_id: data.feedId,
    guid: data.guid,
    title: data.title,
    link: data.link,
    author: data.author || null,
    summary: data.summary || null,
    content: data.content || null,
    image_url: data.imageUrl || null,
    published_at: data.publishedAt,
    fetched_at: fetchedAt,
  }));

  const { data, error } = await supabase
    .from("articles")
    .upsert(insertData, { onConflict: "feed_id,guid", ignoreDuplicates: true })
    .select();

  if (error) throw error;
  return (data || []).map(rowToArticle);
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
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  // Check if state exists
  const { data: existingState } = await supabase
    .from("article_states")
    .select("*")
    .eq("article_id", articleId)
    .eq("user_id", userId)
    .single();

  const updateData: Record<string, unknown> = {};

  if (data.isRead !== undefined) {
    updateData.is_read = data.isRead;
    updateData.read_at = data.isRead ? timestamp : null;
  }
  if (data.isStarred !== undefined) {
    updateData.is_starred = data.isStarred;
    updateData.starred_at = data.isStarred ? timestamp : null;
  }
  if (data.isReadLater !== undefined) {
    updateData.is_read_later = data.isReadLater;
    updateData.read_later_added_at = data.isReadLater ? timestamp : null;
  }

  if (!existingState) {
    // Create new state
    const { data: newState, error } = await supabase
      .from("article_states")
      .insert({
        user_id: userId,
        article_id: articleId,
        is_read: data.isRead ?? false,
        is_starred: data.isStarred ?? false,
        is_read_later: data.isReadLater ?? false,
        read_at: data.isRead ? timestamp : null,
        starred_at: data.isStarred ? timestamp : null,
        read_later_added_at: data.isReadLater ? timestamp : null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: newState.id,
      userId: newState.user_id,
      articleId: newState.article_id,
      isRead: newState.is_read,
      isStarred: newState.is_starred,
      isReadLater: newState.is_read_later,
      readLaterAddedAt: newState.read_later_added_at,
      readAt: newState.read_at,
      starredAt: newState.starred_at,
    };
  }

  // Update existing state
  const { data: updatedState, error } = await supabase
    .from("article_states")
    .update(updateData)
    .eq("article_id", articleId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: updatedState.id,
    userId: updatedState.user_id,
    articleId: updatedState.article_id,
    isRead: updatedState.is_read,
    isStarred: updatedState.is_starred,
    isReadLater: updatedState.is_read_later,
    readLaterAddedAt: updatedState.read_later_added_at,
    readAt: updatedState.read_at,
    starredAt: updatedState.starred_at,
  };
}

export async function markAllAsRead(
  feedId: string,
  userId: string
): Promise<number> {
  const supabase = await createClient();
  const timestamp = new Date().toISOString();

  // Get all articles for the feed
  const { data: articles } = await supabase
    .from("articles")
    .select("id")
    .eq("feed_id", feedId);

  if (!articles || articles.length === 0) return 0;

  let updated = 0;
  for (const article of articles) {
    const { data: existing } = await supabase
      .from("article_states")
      .select("id")
      .eq("article_id", article.id)
      .eq("user_id", userId)
      .single();

    if (existing) {
      await supabase
        .from("article_states")
        .update({ is_read: true, read_at: timestamp })
        .eq("article_id", article.id)
        .eq("user_id", userId);
    } else {
      await supabase.from("article_states").insert({
        user_id: userId,
        article_id: article.id,
        is_read: true,
        read_at: timestamp,
      });
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
  const supabase = await createClient();

  await supabase
    .from("articles")
    .update({ reader_content: content, reader_error: error })
    .eq("id", articleId);
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
  const supabase = await createClient();

  // Get articles to keep (most recent + starred)
  const { data: keepArticles } = await supabase
    .from("articles")
    .select(
      `
      id,
      article_states!left(is_starred)
    `
    )
    .eq("feed_id", feedId)
    .order("published_at", { ascending: false });

  if (!keepArticles) return 0;

  // Sort: starred first, then by recency
  const sorted = keepArticles.sort((a, b) => {
    const aStarred = a.article_states?.some((s) => s.is_starred) ?? false;
    const bStarred = b.article_states?.some((s) => s.is_starred) ?? false;
    if (aStarred && !bStarred) return -1;
    if (!aStarred && bStarred) return 1;
    return 0;
  });

  const keepIds = new Set(sorted.slice(0, maxArticles).map((a) => a.id));
  const toDelete = sorted.filter((a) => !keepIds.has(a.id)).map((a) => a.id);

  if (toDelete.length === 0) return 0;

  const { error } = await supabase
    .from("articles")
    .delete()
    .in("id", toDelete);

  if (error) throw error;
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
  const supabase = await createClient();

  // First check if article already exists by feed_id and guid
  const { data: existing } = await supabase
    .from("articles")
    .select("id")
    .eq("feed_id", data.feedId)
    .eq("guid", data.guid)
    .single();

  if (existing) {
    return existing.id; // Return existing article's ID
  }

  // Insert new article
  const { data: inserted, error } = await supabase
    .from("articles")
    .insert({
      id: data.id,
      feed_id: data.feedId,
      guid: data.guid,
      title: data.title,
      link: data.link,
      content: data.content || null,
      summary: data.summary || null,
      author: data.author || null,
      image_url: data.imageUrl || null,
      published_at: data.publishedAt || new Date().toISOString(),
      fetched_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    // If insert failed due to conflict, try to get existing
    const { data: fallback } = await supabase
      .from("articles")
      .select("id")
      .eq("feed_id", data.feedId)
      .eq("guid", data.guid)
      .single();
    return fallback?.id || data.id;
  }

  return inserted?.id || data.id;
}
