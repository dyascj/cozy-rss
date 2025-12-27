import { createClient } from "@/lib/supabase/server";

export interface Folder {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  orderIndex: number;
  isExpanded: boolean;
  parentFolderId: string | null;
  createdAt: string;
}

interface FolderRow {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  order_index: number;
  is_expanded: boolean;
  parent_folder_id: string | null;
  created_at: string;
}

function rowToFolder(row: FolderRow): Folder {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    orderIndex: row.order_index,
    isExpanded: row.is_expanded,
    parentFolderId: row.parent_folder_id,
    createdAt: row.created_at,
  };
}

export async function getFoldersByUser(userId: string): Promise<Folder[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .order("order_index", { ascending: true });

  if (error) throw error;
  return (data || []).map(rowToFolder);
}

export async function getFolderById(
  folderId: string,
  userId: string
): Promise<Folder | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("id", folderId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? rowToFolder(data) : null;
}

export async function createFolder(
  userId: string,
  data: {
    name: string;
    icon?: string;
    parentFolderId?: string | null;
  }
): Promise<Folder> {
  const supabase = await createClient();

  // Get the next order index
  const { data: maxOrderData } = await supabase
    .from("folders")
    .select("order_index")
    .eq("user_id", userId)
    .is("parent_folder_id", data.parentFolderId || null)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxOrderData?.order_index ?? -1) + 1;

  const { data: folder, error } = await supabase
    .from("folders")
    .insert({
      user_id: userId,
      name: data.name,
      icon: data.icon || null,
      order_index: nextOrder,
      is_expanded: true,
      parent_folder_id: data.parentFolderId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToFolder(folder);
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
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.isExpanded !== undefined) updateData.is_expanded = data.isExpanded;
  if (data.parentFolderId !== undefined)
    updateData.parent_folder_id = data.parentFolderId;
  if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;

  if (Object.keys(updateData).length === 0) {
    return getFolderById(folderId, userId);
  }

  const { data: folder, error } = await supabase
    .from("folders")
    .update(updateData)
    .eq("id", folderId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return folder ? rowToFolder(folder) : null;
}

export async function deleteFolder(
  folderId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  // Move feeds in this folder to root (folder_id = null)
  await supabase
    .from("feeds")
    .update({ folder_id: null })
    .eq("folder_id", folderId)
    .eq("user_id", userId);

  // Move subfolders to root
  await supabase
    .from("folders")
    .update({ parent_folder_id: null })
    .eq("parent_folder_id", folderId)
    .eq("user_id", userId);

  // Delete the folder
  const { error, count } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId)
    .eq("user_id", userId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function reorderFolders(
  userId: string,
  folderIds: string[],
  parentFolderId: string | null
): Promise<void> {
  const supabase = await createClient();

  for (let i = 0; i < folderIds.length; i++) {
    const { error } = await supabase
      .from("folders")
      .update({ order_index: i, parent_folder_id: parentFolderId })
      .eq("id", folderIds[i])
      .eq("user_id", userId);

    if (error) throw error;
  }
}
