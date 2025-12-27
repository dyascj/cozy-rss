import { createClient } from "@/lib/supabase/server";

export interface UserSettings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  markAsReadOnSelect: boolean;
  defaultRefreshInterval: number;
  maxArticlesPerFeed: number;
  compactMode: boolean;
  swipeEnabled: boolean;
  swipeLeftAction: "star" | "readLater" | "markRead" | "none";
  swipeRightAction: "star" | "readLater" | "markRead" | "none";
  uiSidebarWidth: number;
  uiArticleListWidth: number;
  uiArticleLayout: "list" | "card" | "magazine" | "title-only";
  uiReaderModeEnabled: boolean;
}

interface UserSettingsRow {
  theme: string;
  font_size: string;
  mark_as_read_on_select: boolean;
  default_refresh_interval: number;
  max_articles_per_feed: number;
  compact_mode: boolean;
  swipe_enabled: boolean;
  swipe_left_action: string;
  swipe_right_action: string;
  ui_sidebar_width: number;
  ui_article_list_width: number;
  ui_article_layout: string;
  ui_reader_mode_enabled: boolean;
}

function rowToSettings(row: UserSettingsRow): UserSettings {
  return {
    theme: row.theme as UserSettings["theme"],
    fontSize: row.font_size as UserSettings["fontSize"],
    markAsReadOnSelect: row.mark_as_read_on_select,
    defaultRefreshInterval: row.default_refresh_interval,
    maxArticlesPerFeed: row.max_articles_per_feed,
    compactMode: row.compact_mode,
    swipeEnabled: row.swipe_enabled,
    swipeLeftAction: row.swipe_left_action as UserSettings["swipeLeftAction"],
    swipeRightAction:
      row.swipe_right_action as UserSettings["swipeRightAction"],
    uiSidebarWidth: row.ui_sidebar_width,
    uiArticleListWidth: row.ui_article_list_width,
    uiArticleLayout: row.ui_article_layout as UserSettings["uiArticleLayout"],
    uiReaderModeEnabled: row.ui_reader_mode_enabled,
  };
}

const defaultSettings: UserSettings = {
  theme: "system",
  fontSize: "medium",
  markAsReadOnSelect: true,
  defaultRefreshInterval: 30,
  maxArticlesPerFeed: 50,
  compactMode: false,
  swipeEnabled: true,
  swipeLeftAction: "readLater",
  swipeRightAction: "markRead",
  uiSidebarWidth: 250,
  uiArticleListWidth: 350,
  uiArticleLayout: "list",
  uiReaderModeEnabled: false,
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No settings found, create default
      await supabase.from("user_settings").insert({ user_id: userId });
      return { ...defaultSettings };
    }
    throw error;
  }

  return rowToSettings(data);
}

export async function updateUserSettings(
  userId: string,
  data: Partial<UserSettings>
): Promise<UserSettings> {
  const supabase = await createClient();

  // Ensure settings exist
  const { data: existing } = await supabase
    .from("user_settings")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (!existing) {
    await supabase.from("user_settings").insert({ user_id: userId });
  }

  const updateData: Record<string, unknown> = {};

  if (data.theme !== undefined) updateData.theme = data.theme;
  if (data.fontSize !== undefined) updateData.font_size = data.fontSize;
  if (data.markAsReadOnSelect !== undefined)
    updateData.mark_as_read_on_select = data.markAsReadOnSelect;
  if (data.defaultRefreshInterval !== undefined)
    updateData.default_refresh_interval = data.defaultRefreshInterval;
  if (data.maxArticlesPerFeed !== undefined)
    updateData.max_articles_per_feed = data.maxArticlesPerFeed;
  if (data.compactMode !== undefined) updateData.compact_mode = data.compactMode;
  if (data.swipeEnabled !== undefined)
    updateData.swipe_enabled = data.swipeEnabled;
  if (data.swipeLeftAction !== undefined)
    updateData.swipe_left_action = data.swipeLeftAction;
  if (data.swipeRightAction !== undefined)
    updateData.swipe_right_action = data.swipeRightAction;
  if (data.uiSidebarWidth !== undefined)
    updateData.ui_sidebar_width = data.uiSidebarWidth;
  if (data.uiArticleListWidth !== undefined)
    updateData.ui_article_list_width = data.uiArticleListWidth;
  if (data.uiArticleLayout !== undefined)
    updateData.ui_article_layout = data.uiArticleLayout;
  if (data.uiReaderModeEnabled !== undefined)
    updateData.ui_reader_mode_enabled = data.uiReaderModeEnabled;

  if (Object.keys(updateData).length > 0) {
    await supabase
      .from("user_settings")
      .update(updateData)
      .eq("user_id", userId);
  }

  return getUserSettings(userId);
}
