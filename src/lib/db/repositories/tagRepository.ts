import { getDb, generateId, now, TagRow, ArticleTagRow } from "../index";

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: number;
}

function rowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
  };
}

export function getTagsByUser(userId: string): Tag[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT * FROM tags
      WHERE user_id = ?
      ORDER BY created_at ASC
    `
    )
    .all(userId) as TagRow[];

  return rows.map(rowToTag);
}

export function getTagById(tagId: string, userId: string): Tag | null {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT * FROM tags
      WHERE id = ? AND user_id = ?
    `
    )
    .get(tagId, userId) as TagRow | undefined;

  return row ? rowToTag(row) : null;
}

export function getTagByName(name: string, userId: string): Tag | null {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT * FROM tags
      WHERE name = ? AND user_id = ?
    `
    )
    .get(name, userId) as TagRow | undefined;

  return row ? rowToTag(row) : null;
}

export function createTag(
  userId: string,
  data: {
    name: string;
    color: string;
  }
): Tag {
  const db = getDb();
  const id = generateId();
  const createdAt = now();

  db.prepare(
    `
    INSERT INTO tags (id, user_id, name, color, created_at)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(id, userId, data.name, data.color, createdAt);

  return {
    id,
    userId,
    name: data.name,
    color: data.color,
    createdAt,
  };
}

export function updateTag(
  tagId: string,
  userId: string,
  data: {
    name?: string;
    color?: string;
  }
): Tag | null {
  const db = getDb();

  const existing = getTagById(tagId, userId);
  if (!existing) return null;

  const updates: string[] = [];
  const values: string[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.color !== undefined) {
    updates.push("color = ?");
    values.push(data.color);
  }

  if (updates.length > 0) {
    values.push(tagId, userId);
    db.prepare(
      `UPDATE tags SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`
    ).run(...values);
  }

  return getTagById(tagId, userId);
}

export function deleteTag(tagId: string, userId: string): boolean {
  const db = getDb();

  // article_tags will be deleted via CASCADE
  const result = db
    .prepare("DELETE FROM tags WHERE id = ? AND user_id = ?")
    .run(tagId, userId);

  return result.changes > 0;
}

export function getArticleTags(articleId: string, userId: string): Tag[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT t.* FROM tags t
      JOIN article_tags at ON at.tag_id = t.id
      JOIN article_states s ON s.id = at.article_state_id
      WHERE s.article_id = ? AND s.user_id = ?
    `
    )
    .all(articleId, userId) as TagRow[];

  return rows.map(rowToTag);
}

export function setArticleTags(
  articleId: string,
  userId: string,
  tagIds: string[]
): void {
  const db = getDb();
  const timestamp = now();

  // First, ensure article state exists
  let stateId = db
    .prepare(
      "SELECT id FROM article_states WHERE article_id = ? AND user_id = ?"
    )
    .get(articleId, userId) as { id: string } | undefined;

  if (!stateId) {
    const newStateId = generateId();
    db.prepare(
      "INSERT INTO article_states (id, user_id, article_id) VALUES (?, ?, ?)"
    ).run(newStateId, userId, articleId);
    stateId = { id: newStateId };
  }

  const updateTags = db.transaction(() => {
    // Remove all existing tags
    db.prepare(
      "DELETE FROM article_tags WHERE article_state_id = ?"
    ).run(stateId!.id);

    // Add new tags
    const insert = db.prepare(
      "INSERT INTO article_tags (id, article_state_id, tag_id, created_at) VALUES (?, ?, ?, ?)"
    );

    for (const tagId of tagIds) {
      insert.run(generateId(), stateId!.id, tagId, timestamp);
    }
  });

  updateTags();
}

export function addTagToArticle(
  articleId: string,
  userId: string,
  tagId: string
): void {
  const db = getDb();
  const timestamp = now();

  // Ensure article state exists
  let stateId = db
    .prepare(
      "SELECT id FROM article_states WHERE article_id = ? AND user_id = ?"
    )
    .get(articleId, userId) as { id: string } | undefined;

  if (!stateId) {
    const newStateId = generateId();
    db.prepare(
      "INSERT INTO article_states (id, user_id, article_id) VALUES (?, ?, ?)"
    ).run(newStateId, userId, articleId);
    stateId = { id: newStateId };
  }

  // Check if tag already added
  const existing = db
    .prepare(
      "SELECT 1 FROM article_tags WHERE article_state_id = ? AND tag_id = ?"
    )
    .get(stateId.id, tagId);

  if (!existing) {
    db.prepare(
      "INSERT INTO article_tags (id, article_state_id, tag_id, created_at) VALUES (?, ?, ?, ?)"
    ).run(generateId(), stateId.id, tagId, timestamp);
  }
}

export function removeTagFromArticle(
  articleId: string,
  userId: string,
  tagId: string
): void {
  const db = getDb();

  db.prepare(
    `
    DELETE FROM article_tags
    WHERE tag_id = ? AND article_state_id IN (
      SELECT id FROM article_states
      WHERE article_id = ? AND user_id = ?
    )
  `
  ).run(tagId, articleId, userId);
}

export function getArticleTagsMap(userId: string): Record<string, string[]> {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT s.article_id, at.tag_id
      FROM article_tags at
      JOIN article_states s ON s.id = at.article_state_id
      WHERE s.user_id = ?
    `
    )
    .all(userId) as { article_id: string; tag_id: string }[];

  const map: Record<string, string[]> = {};
  for (const row of rows) {
    if (!map[row.article_id]) {
      map[row.article_id] = [];
    }
    map[row.article_id].push(row.tag_id);
  }

  return map;
}
