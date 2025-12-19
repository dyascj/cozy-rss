import { db } from "@/lib/db";
import { feeds } from "@/lib/db/schema";
import { eq, and, asc, isNull, sql } from "drizzle-orm";

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
  lastFetched: string | null;
  lastError: string | null;
  createdAt: string;
}

export async function getFeedsByUser(userId: string): Promise<Feed[]> {
  return db
    .select()
    .from(feeds)
    .where(eq(feeds.userId, userId))
    .orderBy(asc(feeds.orderIndex))
    .all();
}

export async function getFeedById(
  feedId: string,
  userId: string
): Promise<Feed | null> {
  const result = db
    .select()
    .from(feeds)
    .where(and(eq(feeds.id, feedId), eq(feeds.userId, userId)))
    .get();

  return result ?? null;
}

export async function getFeedByUrl(
  url: string,
  userId: string
): Promise<Feed | null> {
  const result = db
    .select()
    .from(feeds)
    .where(and(eq(feeds.url, url), eq(feeds.userId, userId)))
    .get();

  return result ?? null;
}

export async function createFeed(
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
): Promise<Feed> {
  const folderId = data.folderId || null;

  // Get the next order index for the folder
  const folderCondition = folderId === null
    ? isNull(feeds.folderId)
    : eq(feeds.folderId, folderId);

  const maxOrderResult = db
    .select({ maxOrder: sql<number>`coalesce(max(${feeds.orderIndex}), -1)` })
    .from(feeds)
    .where(and(eq(feeds.userId, userId), folderCondition))
    .get();

  const nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

  return db
    .insert(feeds)
    .values({
      userId,
      url: data.url,
      title: data.title,
      description: data.description || null,
      siteUrl: data.siteUrl || null,
      iconUrl: data.iconUrl || null,
      folderId,
      orderIndex: nextOrder,
      fetchInterval: data.fetchInterval || 30,
    })
    .returning()
    .get();
}

export async function updateFeed(
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
    lastFetched?: string;
    lastError?: string | null;
  }
): Promise<Feed | null> {
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.siteUrl !== undefined) updateData.siteUrl = data.siteUrl;
  if (data.iconUrl !== undefined) updateData.iconUrl = data.iconUrl;
  if (data.folderId !== undefined) updateData.folderId = data.folderId;
  if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;
  if (data.fetchInterval !== undefined)
    updateData.fetchInterval = data.fetchInterval;
  if (data.lastFetched !== undefined) {
    updateData.lastFetched =
      typeof data.lastFetched === "number"
        ? new Date(data.lastFetched).toISOString()
        : data.lastFetched;
  }
  if (data.lastError !== undefined) updateData.lastError = data.lastError;

  if (Object.keys(updateData).length === 0) {
    return getFeedById(feedId, userId);
  }

  const result = db
    .update(feeds)
    .set(updateData)
    .where(and(eq(feeds.id, feedId), eq(feeds.userId, userId)))
    .returning()
    .get();

  return result ?? null;
}

export async function deleteFeed(
  feedId: string,
  userId: string
): Promise<boolean> {
  db.delete(feeds)
    .where(and(eq(feeds.id, feedId), eq(feeds.userId, userId)))
    .run();

  return true;
}

export async function moveFeedToFolder(
  feedId: string,
  userId: string,
  folderId: string | null
): Promise<boolean> {
  // Get next order index in target folder
  const folderCondition = folderId === null
    ? isNull(feeds.folderId)
    : eq(feeds.folderId, folderId);

  const maxOrderResult = db
    .select({ maxOrder: sql<number>`coalesce(max(${feeds.orderIndex}), -1)` })
    .from(feeds)
    .where(and(eq(feeds.userId, userId), folderCondition))
    .get();

  const nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

  db.update(feeds)
    .set({ folderId, orderIndex: nextOrder })
    .where(and(eq(feeds.id, feedId), eq(feeds.userId, userId)))
    .run();

  return true;
}

export async function reorderFeeds(
  userId: string,
  feedIds: string[],
  folderId: string | null
): Promise<void> {
  for (let i = 0; i < feedIds.length; i++) {
    db.update(feeds)
      .set({ orderIndex: i, folderId })
      .where(and(eq(feeds.id, feedIds[i]), eq(feeds.userId, userId)))
      .run();
  }
}
