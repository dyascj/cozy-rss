CREATE TABLE `article_states` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`article_id` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`is_starred` integer DEFAULT false NOT NULL,
	`is_read_later` integer DEFAULT false NOT NULL,
	`read_later_added_at` text,
	`read_at` text,
	`starred_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `article_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`article_state_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`article_state_id`) REFERENCES `article_states`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`feed_id` text NOT NULL,
	`guid` text NOT NULL,
	`title` text NOT NULL,
	`link` text,
	`author` text,
	`summary` text,
	`content` text,
	`image_url` text,
	`published_at` text,
	`fetched_at` text DEFAULT (datetime('now')) NOT NULL,
	`reader_content` text,
	`reader_error` text,
	FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `feeds` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`site_url` text,
	`icon_url` text,
	`folder_id` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	`fetch_interval` integer DEFAULT 30 NOT NULL,
	`last_fetched` text,
	`last_error` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	`is_expanded` integer DEFAULT true NOT NULL,
	`parent_folder_id` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `reading_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`articles_read` integer DEFAULT 0 NOT NULL,
	`feeds_completed` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#6B7280' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`milestone_type` text NOT NULL,
	`milestone_value` integer NOT NULL,
	`celebrated` integer DEFAULT false NOT NULL,
	`achieved_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`theme_mode` text DEFAULT 'system' NOT NULL,
	`active_theme_id` text DEFAULT 'default' NOT NULL,
	`custom_themes` text DEFAULT '[]' NOT NULL,
	`font_size` text DEFAULT 'medium' NOT NULL,
	`mark_as_read_on_select` integer DEFAULT true NOT NULL,
	`default_refresh_interval` integer DEFAULT 30 NOT NULL,
	`max_articles_per_feed` integer DEFAULT 50 NOT NULL,
	`compact_mode` integer DEFAULT false NOT NULL,
	`swipe_enabled` integer DEFAULT true NOT NULL,
	`swipe_left_action` text DEFAULT 'readLater' NOT NULL,
	`swipe_right_action` text DEFAULT 'markRead' NOT NULL,
	`ui_sidebar_width` integer DEFAULT 250 NOT NULL,
	`ui_article_list_width` integer DEFAULT 350 NOT NULL,
	`ui_article_layout` text DEFAULT 'list' NOT NULL,
	`ui_reader_mode_enabled` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text,
	`avatar_url` text,
	`is_admin` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);