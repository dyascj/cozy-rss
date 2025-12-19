import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database | null = null;

/**
 * Get the database instance, initializing it if necessary
 */
export function getDb(): Database.Database {
  if (!db) {
    const dbPath =
      process.env.DATABASE_PATH ||
      path.join(process.cwd(), "data", "rss-reader.db");

    // Ensure the data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(dbPath);

    // Enable WAL mode for better performance
    db.pragma("journal_mode = WAL");

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    // Run migrations on first connection
    runMigrations(db);
  }

  return db;
}

/**
 * Close the database connection
 */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Run database migrations
 */
function runMigrations(database: Database.Database): void {
  // Read and execute the schema file
  let schemaContent: string;

  // Try multiple paths to find the schema file
  const possiblePaths = [
    path.join(__dirname, "schema.sql"),
    path.join(process.cwd(), "src", "lib", "db", "schema.sql"),
  ];

  for (const schemaPath of possiblePaths) {
    try {
      schemaContent = fs.readFileSync(schemaPath, "utf-8");
      break;
    } catch {
      // Try next path
    }
  }

  if (!schemaContent!) {
    throw new Error("Could not find schema.sql file");
  }

  // Execute the entire schema at once
  // better-sqlite3 handles multiple statements with exec()
  try {
    database.exec(schemaContent);
  } catch (error) {
    const errorMessage = (error as Error).message;
    // Only throw if it's not an "already exists" error
    if (
      !errorMessage.includes("already exists") &&
      !errorMessage.includes("duplicate column")
    ) {
      throw error;
    }
  }
}

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Get current timestamp in milliseconds
 */
export function now(): number {
  return Date.now();
}

// Type definitions for database rows
export interface UserRow {
  id: string;
  username: string;
  email: string | null;
  password_hash: string;
  created_at: number;
  updated_at: number;
  last_login_at: number | null;
  is_admin: number;
}

export interface SessionRow {
  id: string;
  user_id: string;
  created_at: number;
  expires_at: number;
  ip_address: string | null;
  user_agent: string | null;
}

export interface FolderRow {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  order_index: number;
  is_expanded: number;
  parent_folder_id: string | null;
  created_at: number;
}

export interface FeedRow {
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
  last_fetched: number | null;
  last_error: string | null;
  created_at: number;
}

export interface ArticleRow {
  id: string;
  feed_id: string;
  guid: string;
  title: string;
  link: string;
  author: string | null;
  summary: string | null;
  content: string | null;
  image_url: string | null;
  published_at: number;
  fetched_at: number;
  reader_content: string | null;
  reader_error: string | null;
}

export interface ArticleStateRow {
  id: string;
  user_id: string;
  article_id: string;
  is_read: number;
  is_starred: number;
  is_read_later: number;
  read_later_added_at: number | null;
  read_at: number | null;
  starred_at: number | null;
}

export interface TagRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: number;
}

export interface ArticleTagRow {
  id: string;
  article_state_id: string;
  tag_id: string;
  created_at: number;
}

export interface UserSettingsRow {
  user_id: string;
  theme: string;
  font_size: string;
  mark_as_read_on_select: number;
  default_refresh_interval: number;
  max_articles_per_feed: number;
  compact_mode: number;
  swipe_enabled: number;
  swipe_left_action: string;
  swipe_right_action: string;
  ui_sidebar_width: number;
  ui_article_list_width: number;
  ui_article_layout: string;
  ui_reader_mode_enabled: number;
}

export interface OpmlImportRow {
  id: string;
  user_id: string;
  filename: string | null;
  feed_count: number | null;
  folder_count: number | null;
  imported_at: number;
}
