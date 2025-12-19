import { getDb, generateId, now, FeedRow } from "../index";

export interface Feed {
  id: string;
  userId: string;
  url: string;
  title: string;
  description: string | null;
  siteUrl: string | null;
  iconUrl: string | null;
  folderId: string | null;
  orderIndex: number;
  fetchInterval: number;
  lastFetched: number | null;
  lastError: string | null;
  createdAt: number;
}

function rowToFeed(row: FeedRow): Feed {
  return {
    id: row.id,
    userId: row.user_id,
    url: row.url,
    title: row.title,
    description: row.description,
    siteUrl: row.site_url,
    iconUrl: row.icon_url,
    folderId: row.folder_id,
    orderIndex: row.order_index,
    fetchInterval: row.fetch_interval,
    lastFetched: row.last_fetched,
    lastError: row.last_error,
    createdAt: row.created_at,
  };
}

export function getFeedsByUser(userId: string): Feed[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT * FROM feeds
      WHERE user_id = ?
      ORDER BY order_index ASC
    `
    )
    .all(userId) as FeedRow[];

  return rows.map(rowToFeed);
}

export function getFeedById(feedId: string, userId: string): Feed | null {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT * FROM feeds
      WHERE id = ? AND user_id = ?
    `
    )
    .get(feedId, userId) as FeedRow | undefined;

  return row ? rowToFeed(row) : null;
}

export function getFeedByUrl(url: string, userId: string): Feed | null {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT * FROM feeds
      WHERE url = ? AND user_id = ?
    `
    )
    .get(url, userId) as FeedRow | undefined;

  return row ? rowToFeed(row) : null;
}

export function createFeed(
  userId: string,
  data: {
    url: string;
    title: string;
    description?: string;
    siteUrl?: string;
    iconUrl?: string;
    folderId?: string | null;
    fetchInterval?: number;
  }
): Feed {
  const db = getDb();
  const id = generateId();
  const createdAt = now();

  // Get the next order index for the folder
  const maxOrder = db
    .prepare(
      `
      SELECT COALESCE(MAX(order_index), -1) + 1 as next_order
      FROM feeds
      WHERE user_id = ? AND folder_id IS ?
    `
    )
    .get(userId, data.folderId || null) as { next_order: number };

  db.prepare(
    `
    INSERT INTO feeds (id, user_id, url, title, description, site_url, icon_url, folder_id, order_index, fetch_interval, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    id,
    userId,
    data.url,
    data.title,
    data.description || null,
    data.siteUrl || null,
    data.iconUrl || null,
    data.folderId || null,
    maxOrder.next_order,
    data.fetchInterval || 30,
    createdAt
  );

  return {
    id,
    userId,
    url: data.url,
    title: data.title,
    description: data.description || null,
    siteUrl: data.siteUrl || null,
    iconUrl: data.iconUrl || null,
    folderId: data.folderId || null,
    orderIndex: maxOrder.next_order,
    fetchInterval: data.fetchInterval || 30,
    lastFetched: null,
    lastError: null,
    createdAt,
  };
}

export function updateFeed(
  feedId: string,
  userId: string,
  data: {
    title?: string;
    description?: string | null;
    siteUrl?: string | null;
    iconUrl?: string | null;
    folderId?: string | null;
    orderIndex?: number;
    fetchInterval?: number;
    lastFetched?: number;
    lastError?: string | null;
  }
): Feed | null {
  const db = getDb();

  const existing = getFeedById(feedId, userId);
  if (!existing) return null;

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.title !== undefined) {
    updates.push("title = ?");
    values.push(data.title);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    values.push(data.description);
  }
  if (data.siteUrl !== undefined) {
    updates.push("site_url = ?");
    values.push(data.siteUrl);
  }
  if (data.iconUrl !== undefined) {
    updates.push("icon_url = ?");
    values.push(data.iconUrl);
  }
  if (data.folderId !== undefined) {
    updates.push("folder_id = ?");
    values.push(data.folderId);
  }
  if (data.orderIndex !== undefined) {
    updates.push("order_index = ?");
    values.push(data.orderIndex);
  }
  if (data.fetchInterval !== undefined) {
    updates.push("fetch_interval = ?");
    values.push(data.fetchInterval);
  }
  if (data.lastFetched !== undefined) {
    updates.push("last_fetched = ?");
    values.push(data.lastFetched);
  }
  if (data.lastError !== undefined) {
    updates.push("last_error = ?");
    values.push(data.lastError);
  }

  if (updates.length > 0) {
    values.push(feedId, userId);
    db.prepare(
      `UPDATE feeds SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`
    ).run(...values);
  }

  return getFeedById(feedId, userId);
}

export function deleteFeed(feedId: string, userId: string): boolean {
  const db = getDb();

  // Articles will be deleted via CASCADE
  const result = db
    .prepare("DELETE FROM feeds WHERE id = ? AND user_id = ?")
    .run(feedId, userId);

  return result.changes > 0;
}

export function moveFeedToFolder(
  feedId: string,
  userId: string,
  folderId: string | null
): boolean {
  const db = getDb();

  // Get next order index in target folder
  const maxOrder = db
    .prepare(
      `
      SELECT COALESCE(MAX(order_index), -1) + 1 as next_order
      FROM feeds
      WHERE user_id = ? AND folder_id IS ?
    `
    )
    .get(userId, folderId) as { next_order: number };

  const result = db
    .prepare(
      `
      UPDATE feeds SET folder_id = ?, order_index = ?
      WHERE id = ? AND user_id = ?
    `
    )
    .run(folderId, maxOrder.next_order, feedId, userId);

  return result.changes > 0;
}

export function reorderFeeds(
  userId: string,
  feedIds: string[],
  folderId: string | null
): void {
  const db = getDb();

  const updateOrder = db.prepare(
    `
    UPDATE feeds SET order_index = ?, folder_id = ?
    WHERE id = ? AND user_id = ?
  `
  );

  const reorder = db.transaction(() => {
    feedIds.forEach((feedId, index) => {
      updateOrder.run(index, folderId, feedId, userId);
    });
  });

  reorder();
}
