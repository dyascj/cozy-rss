import { db } from "@/lib/db";
import { folders, feeds } from "@/lib/db/schema";
import { eq, and, asc, isNull, sql } from "drizzle-orm";

export interface Folder {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  orderIndex: number;
  isExpanded: boolean;
  parentFolderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getFoldersByUser(userId: string): Promise<Folder[]> {
  return db
    .select()
    .from(folders)
    .where(eq(folders.userId, userId))
    .orderBy(asc(folders.orderIndex))
    .all();
}

export async function getFolderById(
  folderId: string,
  userId: string
): Promise<Folder | null> {
  const result = db
    .select()
    .from(folders)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
    .get();

  return result ?? null;
}

export async function createFolder(
  userId: string,
  data: {
    name: string;
    icon?: string;
    parentFolderId?: string | null;
  }
): Promise<Folder> {
  const parentFolderId = data.parentFolderId || null;

  // Get the next order index
  const parentCondition = parentFolderId === null
    ? isNull(folders.parentFolderId)
    : eq(folders.parentFolderId, parentFolderId);

  const maxOrderResult = db
    .select({ maxOrder: sql<number>`coalesce(max(${folders.orderIndex}), -1)` })
    .from(folders)
    .where(and(eq(folders.userId, userId), parentCondition))
    .get();

  const nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;

  return db
    .insert(folders)
    .values({
      userId,
      name: data.name,
      icon: data.icon || null,
      orderIndex: nextOrder,
      isExpanded: true,
      parentFolderId,
    })
    .returning()
    .get();
}

export async function updateFolder(
  folderId: string,
  userId: string,
  data: {
    name?: string;
    icon?: string | null;
    isExpanded?: boolean;
    parentFolderId?: string | null;
    orderIndex?: number;
  }
): Promise<Folder | null> {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.isExpanded !== undefined) updateData.isExpanded = data.isExpanded;
  if (data.parentFolderId !== undefined)
    updateData.parentFolderId = data.parentFolderId;
  if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex;

  if (Object.keys(updateData).length === 0) {
    return getFolderById(folderId, userId);
  }

  const result = db
    .update(folders)
    .set(updateData)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
    .returning()
    .get();

  return result ?? null;
}

export async function deleteFolder(
  folderId: string,
  userId: string
): Promise<boolean> {
  // Move feeds in this folder to root (folderId = null)
  db.update(feeds)
    .set({ folderId: null })
    .where(and(eq(feeds.folderId, folderId), eq(feeds.userId, userId)))
    .run();

  // Move subfolders to root
  db.update(folders)
    .set({ parentFolderId: null })
    .where(and(eq(folders.parentFolderId, folderId), eq(folders.userId, userId)))
    .run();

  // Delete the folder
  db.delete(folders)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
    .run();

  return true;
}

export async function reorderFolders(
  userId: string,
  folderIds: string[],
  parentFolderId: string | null
): Promise<void> {
  for (let i = 0; i < folderIds.length; i++) {
    db.update(folders)
      .set({ orderIndex: i, parentFolderId })
      .where(and(eq(folders.id, folderIds[i]), eq(folders.userId, userId)))
      .run();
  }
}
