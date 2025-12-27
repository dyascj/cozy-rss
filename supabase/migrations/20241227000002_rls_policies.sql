-- Row Level Security (RLS) Policies for CozyRSS
-- Run this in the Supabase SQL Editor after 001_schema.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only view and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Folders: Users can CRUD their own folders
CREATE POLICY "Users can view own folders"
  ON public.folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders"
  ON public.folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON public.folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON public.folders FOR DELETE
  USING (auth.uid() = user_id);

-- Feeds: Users can CRUD their own feeds
CREATE POLICY "Users can view own feeds"
  ON public.feeds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own feeds"
  ON public.feeds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feeds"
  ON public.feeds FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feeds"
  ON public.feeds FOR DELETE
  USING (auth.uid() = user_id);

-- Articles: Users can view/create articles from their own feeds
-- (Updates/deletes handled via cascade from feeds)
CREATE POLICY "Users can view articles from own feeds"
  ON public.articles FOR SELECT
  USING (
    feed_id IN (SELECT id FROM public.feeds WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create articles for own feeds"
  ON public.articles FOR INSERT
  WITH CHECK (
    feed_id IN (SELECT id FROM public.feeds WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update articles from own feeds"
  ON public.articles FOR UPDATE
  USING (
    feed_id IN (SELECT id FROM public.feeds WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete articles from own feeds"
  ON public.articles FOR DELETE
  USING (
    feed_id IN (SELECT id FROM public.feeds WHERE user_id = auth.uid())
  );

-- Article states: Users can CRUD their own article states
CREATE POLICY "Users can view own article states"
  ON public.article_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own article states"
  ON public.article_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own article states"
  ON public.article_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own article states"
  ON public.article_states FOR DELETE
  USING (auth.uid() = user_id);

-- Tags: Users can CRUD their own tags
CREATE POLICY "Users can view own tags"
  ON public.tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON public.tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON public.tags FOR DELETE
  USING (auth.uid() = user_id);

-- Article tags: Users can CRUD tags on their own article states
CREATE POLICY "Users can view own article tags"
  ON public.article_tags FOR SELECT
  USING (
    article_state_id IN (SELECT id FROM public.article_states WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create own article tags"
  ON public.article_tags FOR INSERT
  WITH CHECK (
    article_state_id IN (SELECT id FROM public.article_states WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own article tags"
  ON public.article_tags FOR DELETE
  USING (
    article_state_id IN (SELECT id FROM public.article_states WHERE user_id = auth.uid())
  );

-- User settings: Users can CRUD their own settings
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);
