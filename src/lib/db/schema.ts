import { sqliteTable, text, integer, AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const now = sql`(datetime('now'))`;

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(now),
  updatedAt: text("updated_at").notNull().default(now),
});

export const folders = sqliteTable("folders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  icon: text("icon"),
  orderIndex: integer("order_index").notNull().default(0),
  isExpanded: integer("is_expanded", { mode: "boolean" }).notNull().default(true),
  parentFolderId: text("parent_folder_id").references((): AnySQLiteColumn => folders.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull().default(now),
  updatedAt: text("updated_at").notNull().default(now),
});

export const feeds = sqliteTable("feeds", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  siteUrl: text("site_url"),
  iconUrl: text("icon_url"),
  folderId: text("folder_id").references(() => folders.id, { onDelete: "set null" }),
  orderIndex: integer("order_index").notNull().default(0),
  fetchInterval: integer("fetch_interval").notNull().default(30),
  lastFetched: text("last_fetched"),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull().default(now),
  updatedAt: text("updated_at").notNull().default(now),
});

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  feedId: text("feed_id").notNull().references(() => feeds.id, { onDelete: "cascade" }),
  guid: text("guid").notNull(),
  title: text("title").notNull(),
  link: text("link"),
  author: text("author"),
  summary: text("summary"),
  content: text("content"),
  imageUrl: text("image_url"),
  publishedAt: text("published_at"),
  fetchedAt: text("fetched_at").notNull().default(now),
  readerContent: text("reader_content"),
  readerError: text("reader_error"),
});

export const articleStates = sqliteTable("article_states", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  articleId: text("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  isStarred: integer("is_starred", { mode: "boolean" }).notNull().default(false),
  isReadLater: integer("is_read_later", { mode: "boolean" }).notNull().default(false),
  readLaterAddedAt: text("read_later_added_at"),
  readAt: text("read_at"),
  starredAt: text("starred_at"),
  createdAt: text("created_at").notNull().default(now),
  updatedAt: text("updated_at").notNull().default(now),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6B7280"),
  createdAt: text("created_at").notNull().default(now),
});

export const articleTags = sqliteTable("article_tags", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  articleStateId: text("article_state_id").notNull().references(() => articleStates.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().default(now),
});

export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("system"),
  themeMode: text("theme_mode").notNull().default("system"),
  activeThemeId: text("active_theme_id").notNull().default("default"),
  customThemes: text("custom_themes").notNull().default("[]"),
  fontSize: text("font_size").notNull().default("medium"),
  markAsReadOnSelect: integer("mark_as_read_on_select", { mode: "boolean" }).notNull().default(true),
  defaultRefreshInterval: integer("default_refresh_interval").notNull().default(30),
  maxArticlesPerFeed: integer("max_articles_per_feed").notNull().default(50),
  compactMode: integer("compact_mode", { mode: "boolean" }).notNull().default(false),
  swipeEnabled: integer("swipe_enabled", { mode: "boolean" }).notNull().default(true),
  swipeLeftAction: text("swipe_left_action").notNull().default("readLater"),
  swipeRightAction: text("swipe_right_action").notNull().default("markRead"),
  uiSidebarWidth: integer("ui_sidebar_width").notNull().default(250),
  uiArticleListWidth: integer("ui_article_list_width").notNull().default(350),
  uiArticleLayout: text("ui_article_layout").notNull().default("list"),
  uiReaderModeEnabled: integer("ui_reader_mode_enabled", { mode: "boolean" }).notNull().default(false),
});

export const readingStats = sqliteTable("reading_stats", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  articlesRead: integer("articles_read").notNull().default(0),
  feedsCompleted: integer("feeds_completed").notNull().default(0),
});

export const userMilestones = sqliteTable("user_milestones", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  milestoneType: text("milestone_type").notNull(),
  milestoneValue: integer("milestone_value").notNull(),
  celebrated: integer("celebrated", { mode: "boolean" }).notNull().default(false),
  achievedAt: text("achieved_at").notNull().default(now),
});
