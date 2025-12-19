import { getDb, generateId, now, FolderRow } from "../index";

export interface Folder {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  orderIndex: number;
  isExpanded: boolean;
  parentFolderId: string | null;
  createdAt: number;
}

function rowToFolder(row: FolderRow): Folder {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    orderIndex: row.order_index,
    isExpanded: row.is_expanded === 1,
    parentFolderId: row.parent_folder_id,
    createdAt: row.created_at,
  };
}

export function getFoldersByUser(userId: string): Folder[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT * FROM folders
      WHERE user_id = ?
      ORDER BY order_index ASC
    `
    )
    .all(userId) as FolderRow[];

  return rows.map(rowToFolder);
}

export function getFolderById(folderId: string, userId: string): Folder | null {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT * FROM folders
      WHERE id = ? AND user_id = ?
    `
    )
    .get(folderId, userId) as FolderRow | undefined;

  return row ? rowToFolder(row) : null;
}

export function createFolder(
  userId: string,
  data: {
    name: string;
    icon?: string;
    parentFolderId?: string | null;
  }
): Folder {
  const db = getDb();
  const id = generateId();
  const createdAt = now();

  // Get the next order index
  const maxOrder = db
    .prepare(
      `
      SELECT COALESCE(MAX(order_index), -1) + 1 as next_order
      FROM folders
      WHERE user_id = ? AND parent_folder_id IS ?
    `
    )
    .get(userId, data.parentFolderId || null) as { next_order: number };

  db.prepare(
    `
    INSERT INTO folders (id, user_id, name, icon, order_index, is_expanded, parent_folder_id, created_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `
  ).run(
    id,
    userId,
    data.name,
    data.icon || null,
    maxOrder.next_order,
    data.parentFolderId || null,
    createdAt
  );

  return {
    id,
    userId,
    name: data.name,
    icon: data.icon || null,
    orderIndex: maxOrder.next_order,
    isExpanded: true,
    parentFolderId: data.parentFolderId || null,
    createdAt,
  };
}

export function updateFolder(
  folderId: string,
  userId: string,
  data: {
    name?: string;
    icon?: string | null;
    isExpanded?: boolean;
    parentFolderId?: string | null;
    orderIndex?: number;
  }
): Folder | null {
  const db = getDb();

  const existing = getFolderById(folderId, userId);
  if (!existing) return null;

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.icon !== undefined) {
    updates.push("icon = ?");
    values.push(data.icon);
  }
  if (data.isExpanded !== undefined) {
    updates.push("is_expanded = ?");
    values.push(data.isExpanded ? 1 : 0);
  }
  if (data.parentFolderId !== undefined) {
    updates.push("parent_folder_id = ?");
    values.push(data.parentFolderId);
  }
  if (data.orderIndex !== undefined) {
    updates.push("order_index = ?");
    values.push(data.orderIndex);
  }

  if (updates.length > 0) {
    values.push(folderId, userId);
    db.prepare(
      `UPDATE folders SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`
    ).run(...values);
  }

  return getFolderById(folderId, userId);
}

export function deleteFolder(folderId: string, userId: string): boolean {
  const db = getDb();

  // Move feeds in this folder to root (folder_id = null)
  db.prepare(
    `
    UPDATE feeds SET folder_id = NULL
    WHERE folder_id = ? AND user_id = ?
  `
  ).run(folderId, userId);

  // Move subfolders to root
  db.prepare(
    `
    UPDATE folders SET parent_folder_id = NULL
    WHERE parent_folder_id = ? AND user_id = ?
  `
  ).run(folderId, userId);

  // Delete the folder
  const result = db
    .prepare("DELETE FROM folders WHERE id = ? AND user_id = ?")
    .run(folderId, userId);

  return result.changes > 0;
}

export function reorderFolders(
  userId: string,
  folderIds: string[],
  parentFolderId: string | null
): void {
  const db = getDb();

  const updateOrder = db.prepare(
    `
    UPDATE folders SET order_index = ?, parent_folder_id = ?
    WHERE id = ? AND user_id = ?
  `
  );

  const reorder = db.transaction(() => {
    folderIds.forEach((folderId, index) => {
      updateOrder.run(index, parentFolderId, folderId, userId);
    });
  });

  reorder();
}
