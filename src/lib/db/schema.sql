-- RSS Reader Database Schema
-- Designed for SQLite with Supabase/PostgreSQL compatibility

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_login_at INTEGER,
  is_admin INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Folders table (supports nesting)
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_expanded INTEGER DEFAULT 1,
  parent_folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_folder_id);

-- Feeds table
CREATE TABLE IF NOT EXISTS feeds (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  site_url TEXT,
  icon_url TEXT,
  folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  fetch_interval INTEGER DEFAULT 30,
  last_fetched INTEGER,
  last_error TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, url)
);

CREATE INDEX IF NOT EXISTS idx_feeds_user_id ON feeds(user_id);
CREATE INDEX IF NOT EXISTS idx_feeds_folder_id ON feeds(folder_id);
CREATE INDEX IF NOT EXISTS idx_feeds_user_url ON feeds(user_id, url);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  feed_id TEXT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  guid TEXT NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  author TEXT,
  summary TEXT,
  content TEXT,
  image_url TEXT,
  published_at INTEGER NOT NULL,
  fetched_at INTEGER NOT NULL,
  reader_content TEXT,
  reader_error TEXT,
  UNIQUE(feed_id, guid)
);

CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles(feed_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_feed_guid ON articles(feed_id, guid);

-- Article states (per-user article state)
CREATE TABLE IF NOT EXISTS article_states (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  is_read INTEGER DEFAULT 0,
  is_starred INTEGER DEFAULT 0,
  is_read_later INTEGER DEFAULT 0,
  read_later_added_at INTEGER,
  read_at INTEGER,
  starred_at INTEGER,
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_article_states_user ON article_states(user_id);
CREATE INDEX IF NOT EXISTS idx_article_states_starred ON article_states(user_id, is_starred);
CREATE INDEX IF NOT EXISTS idx_article_states_read_later ON article_states(user_id, is_read_later);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);

-- Article tags junction table
CREATE TABLE IF NOT EXISTS article_tags (
  id TEXT PRIMARY KEY,
  article_state_id TEXT NOT NULL REFERENCES article_states(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  UNIQUE(article_state_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_article_tags_state ON article_tags(article_state_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  font_size TEXT DEFAULT 'medium',
  mark_as_read_on_select INTEGER DEFAULT 1,
  default_refresh_interval INTEGER DEFAULT 30,
  max_articles_per_feed INTEGER DEFAULT 50,
  compact_mode INTEGER DEFAULT 0,
  swipe_enabled INTEGER DEFAULT 1,
  swipe_left_action TEXT DEFAULT 'readLater',
  swipe_right_action TEXT DEFAULT 'markRead',
  ui_sidebar_width INTEGER DEFAULT 250,
  ui_article_list_width INTEGER DEFAULT 350,
  ui_article_layout TEXT DEFAULT 'list',
  ui_reader_mode_enabled INTEGER DEFAULT 0
);

-- OPML imports tracking
CREATE TABLE IF NOT EXISTS opml_imports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT,
  feed_count INTEGER,
  folder_count INTEGER,
  imported_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_opml_imports_user ON opml_imports(user_id);
