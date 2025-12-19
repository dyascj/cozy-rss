import { db } from "@/lib/db";
import { tags, articleTags, articleStates } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

export async function getTagsByUser(userId: string): Promise<Tag[]> {
  return db
    .select()
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(asc(tags.createdAt))
    .all();
}

export async function getTagById(
  tagId: string,
  userId: string
): Promise<Tag | null> {
  const result = db
    .select()
    .from(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
    .get();

  return result ?? null;
}

export async function getTagByName(
  name: string,
  userId: string
): Promise<Tag | null> {
  const result = db
    .select()
    .from(tags)
    .where(and(eq(tags.name, name), eq(tags.userId, userId)))
    .get();

  return result ?? null;
}

export async function createTag(
  userId: string,
  data: {
    name: string;
    color: string;
  }
): Promise<Tag> {
  return db
    .insert(tags)
    .values({
      userId,
      name: data.name,
      color: data.color,
    })
    .returning()
    .get();
}

export async function updateTag(
  tagId: string,
  userId: string,
  data: {
    name?: string;
    color?: string;
  }
): Promise<Tag | null> {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.color !== undefined) updateData.color = data.color;

  if (Object.keys(updateData).length === 0) {
    return getTagById(tagId, userId);
  }

  const result = db
    .update(tags)
    .set(updateData)
    .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
    .returning()
    .get();

  return result ?? null;
}

export async function deleteTag(
  tagId: string,
  userId: string
): Promise<boolean> {
  db.delete(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, userId)))
    .run();

  return true;
}

export async function getArticleTags(
  articleId: string,
  userId: string
): Promise<Tag[]> {
  // First get the article state id
  const state = db
    .select({ id: articleStates.id })
    .from(articleStates)
    .where(
      and(
        eq(articleStates.articleId, articleId),
        eq(articleStates.userId, userId)
      )
    )
    .get();

  if (!state) return [];

  // Then get tags via article_tags junction
  const rows = db
    .select({ tag: tags })
    .from(articleTags)
    .innerJoin(tags, eq(tags.id, articleTags.tagId))
    .where(eq(articleTags.articleStateId, state.id))
    .all();

  return rows.map((r) => r.tag);
}

export async function setArticleTags(
  articleId: string,
  userId: string,
  tagIds: string[]
): Promise<void> {
  // Ensure article state exists
  let state = db
    .select({ id: articleStates.id })
    .from(articleStates)
    .where(
      and(
        eq(articleStates.articleId, articleId),
        eq(articleStates.userId, userId)
      )
    )
    .get();

  if (!state) {
    const newState = db
      .insert(articleStates)
      .values({
        userId,
        articleId,
      })
      .returning()
      .get();
    state = { id: newState.id };
  }

  if (!state) return;

  // Remove all existing tags
  db.delete(articleTags)
    .where(eq(articleTags.articleStateId, state.id))
    .run();

  // Add new tags
  if (tagIds.length > 0) {
    const insertData = tagIds.map((tagId) => ({
      articleStateId: state!.id,
      tagId,
    }));

    db.insert(articleTags).values(insertData).run();
  }
}

export async function addTagToArticle(
  articleId: string,
  userId: string,
  tagId: string
): Promise<void> {
  // Ensure article state exists
  let state = db
    .select({ id: articleStates.id })
    .from(articleStates)
    .where(
      and(
        eq(articleStates.articleId, articleId),
        eq(articleStates.userId, userId)
      )
    )
    .get();

  if (!state) {
    const newState = db
      .insert(articleStates)
      .values({
        userId,
        articleId,
      })
      .returning()
      .get();
    state = { id: newState.id };
  }

  if (!state) return;

  // Check if tag already exists
  const existing = db
    .select({ id: articleTags.id })
    .from(articleTags)
    .where(
      and(
        eq(articleTags.articleStateId, state.id),
        eq(articleTags.tagId, tagId)
      )
    )
    .get();

  if (!existing) {
    db.insert(articleTags)
      .values({
        articleStateId: state.id,
        tagId,
      })
      .run();
  }
}

export async function removeTagFromArticle(
  articleId: string,
  userId: string,
  tagId: string
): Promise<void> {
  // Get article state id
  const state = db
    .select({ id: articleStates.id })
    .from(articleStates)
    .where(
      and(
        eq(articleStates.articleId, articleId),
        eq(articleStates.userId, userId)
      )
    )
    .get();

  if (!state) return;

  db.delete(articleTags)
    .where(
      and(
        eq(articleTags.articleStateId, state.id),
        eq(articleTags.tagId, tagId)
      )
    )
    .run();
}

export async function getArticleTagsMap(
  userId: string
): Promise<Record<string, string[]>> {
  const rows = db
    .select({
      articleId: articleStates.articleId,
      tagId: articleTags.tagId,
    })
    .from(articleStates)
    .innerJoin(articleTags, eq(articleTags.articleStateId, articleStates.id))
    .where(eq(articleStates.userId, userId))
    .all();

  const map: Record<string, string[]> = {};
  for (const row of rows) {
    if (!map[row.articleId]) {
      map[row.articleId] = [];
    }
    map[row.articleId].push(row.tagId);
  }

  return map;
}
