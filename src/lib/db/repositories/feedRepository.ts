import { createClient } from "@/lib/supabase/server";

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

interface FeedRow {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description: string | null;
  site_url: string | null;
  icon_url: string | null;
  folder_id: string | null;
  order_index: number;
  fetch_interval: number;
  last_fetched: string | null;
  last_error: string | null;
  created_at: string;
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

export async function getFeedsByUser(userId: string): Promise<Feed[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feeds")
    .select("*")
    .eq("user_id", userId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data || []).map(rowToFeed);
}

export async function getFeedById(
  feedId: string,
  userId: string
): Promise<Feed | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feeds")
    .select("*")
    .eq("id", feedId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows found
    throw error;
  }
  return data ? rowToFeed(data) : null;
}

export async function getFeedByUrl(
  url: string,
  userId: string
): Promise<Feed | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feeds")
    .select("*")
    .eq("url", url)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? rowToFeed(data) : null;
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
  const supabase = await createClient();

  // Get the next order index for the folder
  const { data: maxOrderData } = await supabase
    .from("feeds")
    .select("order_index")
    .eq("user_id", userId)
    .is("folder_id", data.folderId || null)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrderData?.order_index ?? -1) + 1;

  const { data: feed, error } = await supabase
    .from("feeds")
    .insert({
      user_id: userId,
      url: data.url,
      title: data.title,
      description: data.description || null,
      site_url: data.siteUrl || null,
      icon_url: data.iconUrl || null,
      folder_id: data.folderId || null,
      order_index: nextOrder,
      fetch_interval: data.fetchInterval || 30,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToFeed(feed);
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
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.siteUrl !== undefined) updateData.site_url = data.siteUrl;
  if (data.iconUrl !== undefined) updateData.icon_url = data.iconUrl;
  if (data.folderId !== undefined) updateData.folder_id = data.folderId;
  if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;
  if (data.fetchInterval !== undefined)
    updateData.fetch_interval = data.fetchInterval;
  if (data.lastFetched !== undefined) {
    // Convert timestamp to ISO string if it's a number
    updateData.last_fetched =
      typeof data.lastFetched === "number"
        ? new Date(data.lastFetched).toISOString()
        : data.lastFetched;
  }
  if (data.lastError !== undefined) updateData.last_error = data.lastError;

  if (Object.keys(updateData).length === 0) {
    return getFeedById(feedId, userId);
  }

  const { data: feed, error } = await supabase
    .from("feeds")
    .update(updateData)
    .eq("id", feedId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return feed ? rowToFeed(feed) : null;
}

export async function deleteFeed(
  feedId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error, count } = await supabase
    .from("feeds")
    .delete()
    .eq("id", feedId)
    .eq("user_id", userId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function moveFeedToFolder(
  feedId: string,
  userId: string,
  folderId: string | null
): Promise<boolean> {
  const supabase = await createClient();

  // Get next order index in target folder
  const { data: maxOrderData } = await supabase
    .from("feeds")
    .select("order_index")
    .eq("user_id", userId)
    .is("folder_id", folderId)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrderData?.order_index ?? -1) + 1;

  const { error, count } = await supabase
    .from("feeds")
    .update({ folder_id: folderId, order_index: nextOrder })
    .eq("id", feedId)
    .eq("user_id", userId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function reorderFeeds(
  userId: string,
  feedIds: string[],
  folderId: string | null
): Promise<void> {
  const supabase = await createClient();

  // Update each feed's order in sequence
  for (let i = 0; i < feedIds.length; i++) {
    const { error } = await supabase
      .from("feeds")
      .update({ order_index: i, folder_id: folderId })
      .eq("id", feedIds[i])
      .eq("user_id", userId);

    if (error) throw error;
  }
}
