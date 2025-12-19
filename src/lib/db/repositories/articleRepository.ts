import { getDb, generateId, now, ArticleRow, ArticleStateRow } from "../index";

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
  publishedAt: number;
  fetchedAt: number;
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
  readLaterAddedAt: number | null;
  readAt: number | null;
  starredAt: number | null;
}

export interface ArticleWithState extends Article {
  isRead: boolean;
  isStarred: boolean;
  isReadLater: boolean;
  readLaterAddedAt: number | null;
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

// Ensure article exists in database (upsert)
export function ensureArticleExists(data: {
  id: string;
  feedId: string;
  guid: string;
  title: string;
  link: string;
  content?: string | null;
  summary?: string | null;
  author?: string | null;
  imageUrl?: string | null;
  publishedAt?: number;
}): void {
  const db = getDb();
  const timestamp = now();

  // Try to insert, ignore if already exists
  db.prepare(
    `
    INSERT OR IGNORE INTO articles (id, feed_id, guid, title, link, content, summary, author, image_url, published_at, fetched_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    data.id,
    data.feedId,
    data.guid,
    data.title,
    data.link,
    data.content || null,
    data.summary || null,
    data.author || null,
    data.imageUrl || null,
    data.publishedAt || timestamp,
    timestamp
  );
}

export function getArticlesByFeed(
  feedId: string,
  userId: string,
  limit: number = 50
): ArticleWithState[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT
        a.*,
        COALESCE(s.is_read, 0) as is_read,
        COALESCE(s.is_starred, 0) as is_starred,
        COALESCE(s.is_read_later, 0) as is_read_later,
        s.read_later_added_at
      FROM articles a
      LEFT JOIN article_states s ON s.article_id = a.id AND s.user_id = ?
      WHERE a.feed_id = ?
      ORDER BY a.published_at DESC
      LIMIT ?
    `
    )
    .all(userId, feedId, limit) as (ArticleRow & {
    is_read: number;
    is_starred: number;
    is_read_later: number;
    read_later_added_at: number | null;
  })[];

  return rows.map((row) => ({
    ...rowToArticle(row),
    isRead: row.is_read === 1,
    isStarred: row.is_starred === 1,
    isReadLater: row.is_read_later === 1,
    readLaterAddedAt: row.read_later_added_at,
  }));
}

export function getArticlesByUser(
  userId: string,
  options: {
    feedIds?: string[];
    isStarred?: boolean;
    isReadLater?: boolean;
    isUnread?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): ArticleWithState[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: (string | number)[] = [userId];

  if (options.feedIds && options.feedIds.length > 0) {
    conditions.push(`a.feed_id IN (${options.feedIds.map(() => "?").join(", ")})`);
    params.push(...options.feedIds);
  }

  if (options.isStarred) {
    conditions.push("s.is_starred = 1");
  }

  if (options.isReadLater) {
    conditions.push("s.is_read_later = 1");
  }

  if (options.isUnread) {
    conditions.push("(s.is_read IS NULL OR s.is_read = 0)");
  }

  const whereClause = conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";
  const limit = options.limit || 100;
  const offset = options.offset || 0;

  const rows = db
    .prepare(
      `
      SELECT
        a.*,
        COALESCE(s.is_read, 0) as is_read,
        COALESCE(s.is_starred, 0) as is_starred,
        COALESCE(s.is_read_later, 0) as is_read_later,
        s.read_later_added_at
      FROM articles a
      JOIN feeds f ON f.id = a.feed_id AND f.user_id = ?
      LEFT JOIN article_states s ON s.article_id = a.id AND s.user_id = f.user_id
      WHERE 1=1 ${whereClause}
      ORDER BY a.published_at DESC
      LIMIT ? OFFSET ?
    `
    )
    .all(...params, limit, offset) as (ArticleRow & {
    is_read: number;
    is_starred: number;
    is_read_later: number;
    read_later_added_at: number | null;
  })[];

  return rows.map((row) => ({
    ...rowToArticle(row),
    isRead: row.is_read === 1,
    isStarred: row.is_starred === 1,
    isReadLater: row.is_read_later === 1,
    readLaterAddedAt: row.read_later_added_at,
  }));
}

export function getArticleById(
  articleId: string,
  userId: string
): ArticleWithState | null {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT
        a.*,
        COALESCE(s.is_read, 0) as is_read,
        COALESCE(s.is_starred, 0) as is_starred,
        COALESCE(s.is_read_later, 0) as is_read_later,
        s.read_later_added_at
      FROM articles a
      JOIN feeds f ON f.id = a.feed_id AND f.user_id = ?
      LEFT JOIN article_states s ON s.article_id = a.id AND s.user_id = f.user_id
      WHERE a.id = ?
    `
    )
    .get(userId, articleId) as
    | (ArticleRow & {
        is_read: number;
        is_starred: number;
        is_read_later: number;
        read_later_added_at: number | null;
      })
    | undefined;

  if (!row) return null;

  return {
    ...rowToArticle(row),
    isRead: row.is_read === 1,
    isStarred: row.is_starred === 1,
    isReadLater: row.is_read_later === 1,
    readLaterAddedAt: row.read_later_added_at,
  };
}

export function createArticle(data: {
  feedId: string;
  guid: string;
  title: string;
  link: string;
  author?: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  publishedAt: number;
}): Article {
  const db = getDb();

  // Generate deterministic ID from feedId and guid
  const id = generateArticleId(data.feedId, data.guid);
  const fetchedAt = now();

  try {
    db.prepare(
      `
      INSERT INTO articles (id, feed_id, guid, title, link, author, summary, content, image_url, published_at, fetched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      id,
      data.feedId,
      data.guid,
      data.title,
      data.link,
      data.author || null,
      data.summary || null,
      data.content || null,
      data.imageUrl || null,
      data.publishedAt,
      fetchedAt
    );
  } catch (error) {
    // Handle duplicate - article already exists
    if ((error as Error).message.includes("UNIQUE constraint failed")) {
      const existing = db
        .prepare("SELECT * FROM articles WHERE id = ?")
        .get(id) as ArticleRow;
      return rowToArticle(existing);
    }
    throw error;
  }

  return {
    id,
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
    readerContent: null,
    readerError: null,
  };
}

export function createArticlesBulk(
  articles: {
    feedId: string;
    guid: string;
    title: string;
    link: string;
    author?: string;
    summary?: string;
    content?: string;
    imageUrl?: string;
    publishedAt: number;
  }[]
): Article[] {
  const db = getDb();
  const fetchedAt = now();
  const createdArticles: Article[] = [];

  const insert = db.prepare(`
    INSERT OR IGNORE INTO articles (id, feed_id, guid, title, link, author, summary, content, image_url, published_at, fetched_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const bulkInsert = db.transaction(() => {
    for (const data of articles) {
      const id = generateArticleId(data.feedId, data.guid);

      const result = insert.run(
        id,
        data.feedId,
        data.guid,
        data.title,
        data.link,
        data.author || null,
        data.summary || null,
        data.content || null,
        data.imageUrl || null,
        data.publishedAt,
        fetchedAt
      );

      if (result.changes > 0) {
        createdArticles.push({
          id,
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
          readerContent: null,
          readerError: null,
        });
      }
    }
  });

  bulkInsert();
  return createdArticles;
}

function generateArticleId(feedId: string, guid: string): string {
  // Create a deterministic ID from feedId and guid
  const input = `${feedId}:${guid}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `art_${Math.abs(hash).toString(36)}`;
}

export function updateArticleState(
  articleId: string,
  userId: string,
  data: {
    isRead?: boolean;
    isStarred?: boolean;
    isReadLater?: boolean;
  }
): ArticleState | null {
  const db = getDb();
  const timestamp = now();

  // First, ensure the article state exists
  const existingState = db
    .prepare(
      `
      SELECT * FROM article_states
      WHERE article_id = ? AND user_id = ?
    `
    )
    .get(articleId, userId) as ArticleStateRow | undefined;

  if (!existingState) {
    // Create new state
    const stateId = generateId();
    db.prepare(
      `
      INSERT INTO article_states (id, user_id, article_id, is_read, is_starred, is_read_later, read_at, starred_at, read_later_added_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      stateId,
      userId,
      articleId,
      data.isRead ? 1 : 0,
      data.isStarred ? 1 : 0,
      data.isReadLater ? 1 : 0,
      data.isRead ? timestamp : null,
      data.isStarred ? timestamp : null,
      data.isReadLater ? timestamp : null
    );

    return {
      id: stateId,
      userId,
      articleId,
      isRead: data.isRead || false,
      isStarred: data.isStarred || false,
      isReadLater: data.isReadLater || false,
      readLaterAddedAt: data.isReadLater ? timestamp : null,
      readAt: data.isRead ? timestamp : null,
      starredAt: data.isStarred ? timestamp : null,
    };
  }

  // Update existing state
  const updates: string[] = [];
  const values: (number | null)[] = [];

  if (data.isRead !== undefined) {
    updates.push("is_read = ?");
    values.push(data.isRead ? 1 : 0);
    updates.push("read_at = ?");
    values.push(data.isRead ? timestamp : null);
  }
  if (data.isStarred !== undefined) {
    updates.push("is_starred = ?");
    values.push(data.isStarred ? 1 : 0);
    updates.push("starred_at = ?");
    values.push(data.isStarred ? timestamp : null);
  }
  if (data.isReadLater !== undefined) {
    updates.push("is_read_later = ?");
    values.push(data.isReadLater ? 1 : 0);
    updates.push("read_later_added_at = ?");
    values.push(data.isReadLater ? timestamp : null);
  }

  if (updates.length > 0) {
    db.prepare(
      `UPDATE article_states SET ${updates.join(", ")} WHERE article_id = ? AND user_id = ?`
    ).run(...values, articleId, userId);
  }

  const updatedState = db
    .prepare(
      `SELECT * FROM article_states WHERE article_id = ? AND user_id = ?`
    )
    .get(articleId, userId) as ArticleStateRow;

  return {
    id: updatedState.id,
    userId: updatedState.user_id,
    articleId: updatedState.article_id,
    isRead: updatedState.is_read === 1,
    isStarred: updatedState.is_starred === 1,
    isReadLater: updatedState.is_read_later === 1,
    readLaterAddedAt: updatedState.read_later_added_at,
    readAt: updatedState.read_at,
    starredAt: updatedState.starred_at,
  };
}

export function markAllAsRead(feedId: string, userId: string): number {
  const db = getDb();
  const timestamp = now();

  // Get all article IDs for the feed
  const articles = db
    .prepare("SELECT id FROM articles WHERE feed_id = ?")
    .all(feedId) as { id: string }[];

  let updated = 0;

  const markRead = db.transaction(() => {
    for (const article of articles) {
      const existing = db
        .prepare(
          "SELECT id FROM article_states WHERE article_id = ? AND user_id = ?"
        )
        .get(article.id, userId);

      if (existing) {
        db.prepare(
          "UPDATE article_states SET is_read = 1, read_at = ? WHERE article_id = ? AND user_id = ?"
        ).run(timestamp, article.id, userId);
      } else {
        const stateId = generateId();
        db.prepare(
          "INSERT INTO article_states (id, user_id, article_id, is_read, read_at) VALUES (?, ?, ?, 1, ?)"
        ).run(stateId, userId, article.id, timestamp);
      }
      updated++;
    }
  });

  markRead();
  return updated;
}

export function updateReaderContent(
  articleId: string,
  content: string | null,
  error: string | null
): void {
  const db = getDb();
  db.prepare(
    `
    UPDATE articles SET reader_content = ?, reader_error = ?
    WHERE id = ?
  `
  ).run(content, error, articleId);
}

export function pruneArticles(feedId: string, maxArticles: number): number {
  const db = getDb();

  // Get IDs of articles to keep (most recent + starred)
  const keepIds = db
    .prepare(
      `
      SELECT a.id FROM articles a
      LEFT JOIN article_states s ON s.article_id = a.id
      WHERE a.feed_id = ?
      ORDER BY
        CASE WHEN s.is_starred = 1 THEN 0 ELSE 1 END,
        a.published_at DESC
      LIMIT ?
    `
    )
    .all(feedId, maxArticles) as { id: string }[];

  const keepIdSet = new Set(keepIds.map((r) => r.id));

  // Delete articles not in keep list
  const allIds = db
    .prepare("SELECT id FROM articles WHERE feed_id = ?")
    .all(feedId) as { id: string }[];

  const toDelete = allIds.filter((a) => !keepIdSet.has(a.id));

  if (toDelete.length === 0) return 0;

  const deleteArticles = db.transaction(() => {
    for (const article of toDelete) {
      db.prepare("DELETE FROM articles WHERE id = ?").run(article.id);
    }
  });

  deleteArticles();
  return toDelete.length;
}
