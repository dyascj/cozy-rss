-- CozyRSS Database Schema for Supabase
-- Uses gen_random_uuid() which is built into PostgreSQL 13+

-- Profiles table (linked to Supabase Auth users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Folders table (supports nesting)
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_expanded BOOLEAN DEFAULT TRUE,
  parent_folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_folders_user_id ON public.folders(user_id);
CREATE INDEX idx_folders_parent ON public.folders(parent_folder_id);

-- Feeds table
CREATE TABLE public.feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  site_url TEXT,
  icon_url TEXT,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  fetch_interval INTEGER DEFAULT 30,
  last_fetched TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, url)
);

CREATE INDEX idx_feeds_user_id ON public.feeds(user_id);
CREATE INDEX idx_feeds_folder_id ON public.feeds(folder_id);

-- Articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID NOT NULL REFERENCES public.feeds(id) ON DELETE CASCADE,
  guid TEXT NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  author TEXT,
  summary TEXT,
  content TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL,
  reader_content TEXT,
  reader_error TEXT,
  UNIQUE(feed_id, guid)
);

CREATE INDEX idx_articles_feed_id ON public.articles(feed_id);
CREATE INDEX idx_articles_published ON public.articles(published_at DESC);
CREATE INDEX idx_articles_feed_guid ON public.articles(feed_id, guid);

-- Article states (per-user article state)
CREATE TABLE public.article_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  is_read_later BOOLEAN DEFAULT FALSE,
  read_later_added_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  starred_at TIMESTAMPTZ,
  UNIQUE(user_id, article_id)
);

CREATE INDEX idx_article_states_user ON public.article_states(user_id);
CREATE INDEX idx_article_states_starred ON public.article_states(user_id, is_starred);
CREATE INDEX idx_article_states_read_later ON public.article_states(user_id, is_read_later);

-- Tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user ON public.tags(user_id);

-- Article tags junction table
CREATE TABLE public.article_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_state_id UUID NOT NULL REFERENCES public.article_states(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_state_id, tag_id)
);

CREATE INDEX idx_article_tags_state ON public.article_tags(article_state_id);
CREATE INDEX idx_article_tags_tag ON public.article_tags(tag_id);

-- User settings table
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  font_size TEXT DEFAULT 'medium',
  mark_as_read_on_select BOOLEAN DEFAULT TRUE,
  default_refresh_interval INTEGER DEFAULT 30,
  max_articles_per_feed INTEGER DEFAULT 50,
  compact_mode BOOLEAN DEFAULT FALSE,
  swipe_enabled BOOLEAN DEFAULT TRUE,
  swipe_left_action TEXT DEFAULT 'readLater',
  swipe_right_action TEXT DEFAULT 'markRead',
  ui_sidebar_width INTEGER DEFAULT 250,
  ui_article_list_width INTEGER DEFAULT 350,
  ui_article_layout TEXT DEFAULT 'list',
  ui_reader_mode_enabled BOOLEAN DEFAULT FALSE
);

-- Function to handle new user signup
-- Automatically creates profile and default settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile from OAuth metadata
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'user_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create default settings
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
