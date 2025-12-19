import { db } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface UserSettings {
  theme: "light" | "dark" | "system";
  themeMode: "light" | "dark" | "system";
  activeThemeId: string;
  customThemes: string; // JSON string of custom themes
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

export const defaultSettings: UserSettings = {
  theme: "system",
  themeMode: "system",
  activeThemeId: "default",
  customThemes: "[]",
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

function rowToSettings(row: typeof userSettings.$inferSelect): UserSettings {
  return {
    theme: row.theme as UserSettings["theme"],
    themeMode: (row.themeMode || row.theme) as UserSettings["themeMode"],
    activeThemeId: row.activeThemeId || "default",
    customThemes: row.customThemes || "[]",
    fontSize: row.fontSize as UserSettings["fontSize"],
    markAsReadOnSelect: row.markAsReadOnSelect,
    defaultRefreshInterval: row.defaultRefreshInterval,
    maxArticlesPerFeed: row.maxArticlesPerFeed,
    compactMode: row.compactMode,
    swipeEnabled: row.swipeEnabled,
    swipeLeftAction: row.swipeLeftAction as UserSettings["swipeLeftAction"],
    swipeRightAction: row.swipeRightAction as UserSettings["swipeRightAction"],
    uiSidebarWidth: row.uiSidebarWidth,
    uiArticleListWidth: row.uiArticleListWidth,
    uiArticleLayout: row.uiArticleLayout as UserSettings["uiArticleLayout"],
    uiReaderModeEnabled: row.uiReaderModeEnabled,
  };
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const row = db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .get();

  if (!row) {
    // No settings found, create default
    db.insert(userSettings).values({ userId }).run();
    return { ...defaultSettings };
  }

  return rowToSettings(row);
}

export async function updateUserSettings(
  userId: string,
  data: Partial<UserSettings>
): Promise<UserSettings> {
  // Ensure settings exist
  const existing = db
    .select({ userId: userSettings.userId })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .get();

  if (!existing) {
    db.insert(userSettings).values({ userId }).run();
  }

  const updateData: Record<string, unknown> = {};

  if (data.theme !== undefined) updateData.theme = data.theme;
  if (data.themeMode !== undefined) updateData.themeMode = data.themeMode;
  if (data.activeThemeId !== undefined) updateData.activeThemeId = data.activeThemeId;
  if (data.customThemes !== undefined) updateData.customThemes = data.customThemes;
  if (data.fontSize !== undefined) updateData.fontSize = data.fontSize;
  if (data.markAsReadOnSelect !== undefined)
    updateData.markAsReadOnSelect = data.markAsReadOnSelect;
  if (data.defaultRefreshInterval !== undefined)
    updateData.defaultRefreshInterval = data.defaultRefreshInterval;
  if (data.maxArticlesPerFeed !== undefined)
    updateData.maxArticlesPerFeed = data.maxArticlesPerFeed;
  if (data.compactMode !== undefined) updateData.compactMode = data.compactMode;
  if (data.swipeEnabled !== undefined)
    updateData.swipeEnabled = data.swipeEnabled;
  if (data.swipeLeftAction !== undefined)
    updateData.swipeLeftAction = data.swipeLeftAction;
  if (data.swipeRightAction !== undefined)
    updateData.swipeRightAction = data.swipeRightAction;
  if (data.uiSidebarWidth !== undefined)
    updateData.uiSidebarWidth = data.uiSidebarWidth;
  if (data.uiArticleListWidth !== undefined)
    updateData.uiArticleListWidth = data.uiArticleListWidth;
  if (data.uiArticleLayout !== undefined)
    updateData.uiArticleLayout = data.uiArticleLayout;
  if (data.uiReaderModeEnabled !== undefined)
    updateData.uiReaderModeEnabled = data.uiReaderModeEnabled;

  if (Object.keys(updateData).length > 0) {
    db.update(userSettings)
      .set(updateData)
      .where(eq(userSettings.userId, userId))
      .run();
  }

  return getUserSettings(userId);
}
