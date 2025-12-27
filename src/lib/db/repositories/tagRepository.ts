import { createClient } from "@/lib/supabase/server";

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

interface TagRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
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

export async function getTagsByUser(userId: string): Promise<Tag[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(rowToTag);
}

export async function getTagById(
  tagId: string,
  userId: string
): Promise<Tag | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("id", tagId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? rowToTag(data) : null;
}

export async function getTagByName(
  name: string,
  userId: string
): Promise<Tag | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("name", name)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? rowToTag(data) : null;
}

export async function createTag(
  userId: string,
  data: {
    name: string;
    color: string;
  }
): Promise<Tag> {
  const supabase = await createClient();

  const { data: tag, error } = await supabase
    .from("tags")
    .insert({
      user_id: userId,
      name: data.name,
      color: data.color,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToTag(tag);
}

export async function updateTag(
  tagId: string,
  userId: string,
  data: {
    name?: string;
    color?: string;
  }
): Promise<Tag | null> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.color !== undefined) updateData.color = data.color;

  if (Object.keys(updateData).length === 0) {
    return getTagById(tagId, userId);
  }

  const { data: tag, error } = await supabase
    .from("tags")
    .update(updateData)
    .eq("id", tagId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return tag ? rowToTag(tag) : null;
}

export async function deleteTag(
  tagId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error, count } = await supabase
    .from("tags")
    .delete()
    .eq("id", tagId)
    .eq("user_id", userId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function getArticleTags(
  articleId: string,
  userId: string
): Promise<Tag[]> {
  const supabase = await createClient();

  // First get the article state id
  const { data: state } = await supabase
    .from("article_states")
    .select("id")
    .eq("article_id", articleId)
    .eq("user_id", userId)
    .single();

  if (!state) return [];

  // Then get tags via article_tags junction
  const { data, error } = await supabase
    .from("article_tags")
    .select(
      `
      tag_id,
      tags(*)
    `
    )
    .eq("article_state_id", state.id);

  if (error) throw error;

  return (data || [])
    .map((row) => (row.tags ? rowToTag(row.tags as unknown as TagRow) : null))
    .filter((tag): tag is Tag => tag !== null);
}

export async function setArticleTags(
  articleId: string,
  userId: string,
  tagIds: string[]
): Promise<void> {
  const supabase = await createClient();

  // Ensure article state exists
  let { data: state } = await supabase
    .from("article_states")
    .select("id")
    .eq("article_id", articleId)
    .eq("user_id", userId)
    .single();

  if (!state) {
    const { data: newState } = await supabase
      .from("article_states")
      .insert({
        user_id: userId,
        article_id: articleId,
      })
      .select("id")
      .single();
    state = newState;
  }

  if (!state) return;

  // Remove all existing tags
  await supabase
    .from("article_tags")
    .delete()
    .eq("article_state_id", state.id);

  // Add new tags
  if (tagIds.length > 0) {
    const insertData = tagIds.map((tagId) => ({
      article_state_id: state!.id,
      tag_id: tagId,
    }));

    await supabase.from("article_tags").insert(insertData);
  }
}

export async function addTagToArticle(
  articleId: string,
  userId: string,
  tagId: string
): Promise<void> {
  const supabase = await createClient();

  // Ensure article state exists
  let { data: state } = await supabase
    .from("article_states")
    .select("id")
    .eq("article_id", articleId)
    .eq("user_id", userId)
    .single();

  if (!state) {
    const { data: newState } = await supabase
      .from("article_states")
      .insert({
        user_id: userId,
        article_id: articleId,
      })
      .select("id")
      .single();
    state = newState;
  }

  if (!state) return;

  // Check if tag already exists
  const { data: existing } = await supabase
    .from("article_tags")
    .select("id")
    .eq("article_state_id", state.id)
    .eq("tag_id", tagId)
    .single();

  if (!existing) {
    await supabase.from("article_tags").insert({
      article_state_id: state.id,
      tag_id: tagId,
    });
  }
}

export async function removeTagFromArticle(
  articleId: string,
  userId: string,
  tagId: string
): Promise<void> {
  const supabase = await createClient();

  // Get article state id
  const { data: state } = await supabase
    .from("article_states")
    .select("id")
    .eq("article_id", articleId)
    .eq("user_id", userId)
    .single();

  if (!state) return;

  await supabase
    .from("article_tags")
    .delete()
    .eq("article_state_id", state.id)
    .eq("tag_id", tagId);
}

export async function getArticleTagsMap(
  userId: string
): Promise<Record<string, string[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("article_states")
    .select(
      `
      article_id,
      article_tags(tag_id)
    `
    )
    .eq("user_id", userId);

  if (error) throw error;

  const map: Record<string, string[]> = {};
  for (const row of data || []) {
    const tagIds = (row.article_tags || []).map((at) => at.tag_id);
    if (tagIds.length > 0) {
      map[row.article_id] = tagIds;
    }
  }

  return map;
}
