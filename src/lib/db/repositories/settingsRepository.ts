import { getDb, UserSettingsRow } from "../index";

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

function rowToSettings(row: UserSettingsRow): UserSettings {
  return {
    theme: row.theme as UserSettings["theme"],
    fontSize: row.font_size as UserSettings["fontSize"],
    markAsReadOnSelect: row.mark_as_read_on_select === 1,
    defaultRefreshInterval: row.default_refresh_interval,
    maxArticlesPerFeed: row.max_articles_per_feed,
    compactMode: row.compact_mode === 1,
    swipeEnabled: row.swipe_enabled === 1,
    swipeLeftAction: row.swipe_left_action as UserSettings["swipeLeftAction"],
    swipeRightAction: row.swipe_right_action as UserSettings["swipeRightAction"],
    uiSidebarWidth: row.ui_sidebar_width,
    uiArticleListWidth: row.ui_article_list_width,
    uiArticleLayout: row.ui_article_layout as UserSettings["uiArticleLayout"],
    uiReaderModeEnabled: row.ui_reader_mode_enabled === 1,
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

export function getUserSettings(userId: string): UserSettings {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM user_settings WHERE user_id = ?")
    .get(userId) as UserSettingsRow | undefined;

  if (!row) {
    // Create default settings
    db.prepare("INSERT INTO user_settings (user_id) VALUES (?)").run(userId);
    return { ...defaultSettings };
  }

  return rowToSettings(row);
}

export function updateUserSettings(
  userId: string,
  data: Partial<UserSettings>
): UserSettings {
  const db = getDb();

  // Ensure settings exist
  const existing = db
    .prepare("SELECT 1 FROM user_settings WHERE user_id = ?")
    .get(userId);

  if (!existing) {
    db.prepare("INSERT INTO user_settings (user_id) VALUES (?)").run(userId);
  }

  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.theme !== undefined) {
    updates.push("theme = ?");
    values.push(data.theme);
  }
  if (data.fontSize !== undefined) {
    updates.push("font_size = ?");
    values.push(data.fontSize);
  }
  if (data.markAsReadOnSelect !== undefined) {
    updates.push("mark_as_read_on_select = ?");
    values.push(data.markAsReadOnSelect ? 1 : 0);
  }
  if (data.defaultRefreshInterval !== undefined) {
    updates.push("default_refresh_interval = ?");
    values.push(data.defaultRefreshInterval);
  }
  if (data.maxArticlesPerFeed !== undefined) {
    updates.push("max_articles_per_feed = ?");
    values.push(data.maxArticlesPerFeed);
  }
  if (data.compactMode !== undefined) {
    updates.push("compact_mode = ?");
    values.push(data.compactMode ? 1 : 0);
  }
  if (data.swipeEnabled !== undefined) {
    updates.push("swipe_enabled = ?");
    values.push(data.swipeEnabled ? 1 : 0);
  }
  if (data.swipeLeftAction !== undefined) {
    updates.push("swipe_left_action = ?");
    values.push(data.swipeLeftAction);
  }
  if (data.swipeRightAction !== undefined) {
    updates.push("swipe_right_action = ?");
    values.push(data.swipeRightAction);
  }
  if (data.uiSidebarWidth !== undefined) {
    updates.push("ui_sidebar_width = ?");
    values.push(data.uiSidebarWidth);
  }
  if (data.uiArticleListWidth !== undefined) {
    updates.push("ui_article_list_width = ?");
    values.push(data.uiArticleListWidth);
  }
  if (data.uiArticleLayout !== undefined) {
    updates.push("ui_article_layout = ?");
    values.push(data.uiArticleLayout);
  }
  if (data.uiReaderModeEnabled !== undefined) {
    updates.push("ui_reader_mode_enabled = ?");
    values.push(data.uiReaderModeEnabled ? 1 : 0);
  }

  if (updates.length > 0) {
    values.push(userId);
    db.prepare(
      `UPDATE user_settings SET ${updates.join(", ")} WHERE user_id = ?`
    ).run(...values);
  }

  return getUserSettings(userId);
}
