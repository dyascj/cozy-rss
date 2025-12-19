"use client";

import { motion } from "framer-motion";
import { DiscoverCategoryMeta, DiscoverFeed } from "@/types/discover";
import {
  DoodleCode,
  DoodleFilm,
  DoodleNewspaper,
  DoodleHeart,
  DoodleChevronRight,
  DoodleYoutube,
  DoodleUsers,
  DoodleBrain,
  DoodlePalette,
  DoodleGamepad,
  DoodlePodcast,
  DoodlePenTool,
  DoodleSparkles,
} from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";
import { FeedIcon } from "@/components/ui/FeedIcon";

interface CategoryCardProps {
  category: DiscoverCategoryMeta;
  onClick: () => void;
  feedCount?: number;
  previewFeeds?: DiscoverFeed[];
}

const ICONS: Record<string, React.ComponentType<{ size?: "xs" | "sm" | "md" | "lg" | "xl" }>> = {
  Code: DoodleCode,
  Film: DoodleFilm,
  Newspaper: DoodleNewspaper,
  Heart: DoodleHeart,
  Youtube: DoodleYoutube,
  Users: DoodleUsers,
  Brain: DoodleBrain,
  Palette: DoodlePalette,
  Gamepad2: DoodleGamepad,
  Podcast: DoodlePodcast,
  PenTool: DoodlePenTool,
  Sparkles: DoodleSparkles,
};

// Warm Anthropic-inspired gradient mappings
const GRADIENTS: Record<string, string> = {
  "bg-blue-500": "from-blue-500/90 to-blue-600/90",
  "bg-violet-500": "from-violet-500/90 to-violet-600/90",
  "bg-red-600": "from-red-500/90 to-red-600/90",
  "bg-sky-500": "from-sky-500/90 to-sky-600/90",
  "bg-pink-500": "from-pink-500/90 to-pink-600/90",
  "bg-orange-500": "from-sage-400/90 to-sage-500/90",
  "bg-purple-500": "from-purple-500/90 to-purple-600/90",
  "bg-amber-500": "from-amber-500/90 to-amber-600/90",
  "bg-rose-500": "from-rose-500/90 to-rose-600/90",
  "bg-teal-500": "from-teal-500/90 to-teal-600/90",
  "bg-green-500": "from-emerald-500/90 to-emerald-600/90",
};

export function CategoryCard({ category, onClick, feedCount, previewFeeds }: CategoryCardProps) {
  const Icon = ICONS[category.icon] || DoodleCode;
  const gradient = GRADIENTS[category.color] || "from-taupe-500/90 to-taupe-600/90";

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl",
        "bg-card border border-border",
        "text-left shadow-soft hover:shadow-soft-lg transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      )}
      aria-label={`Browse ${category.name} feeds`}
    >
      {/* Gradient header */}
      <div className={cn("relative h-16 bg-gradient-to-br", gradient)}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-${category.id}`} width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#pattern-${category.id})`} />
          </svg>
        </div>

        {/* Icon container */}
        <div className="absolute -bottom-5 left-4 p-2.5 bg-card rounded-lg shadow-soft border-2 border-card">
          <span className={cn(category.textColor)}>
            <Icon size="md" />
          </span>
        </div>

        {/* Feed count badge */}
        {feedCount !== undefined && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
            {feedCount} feeds
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-7 pb-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {category.description}
            </p>
          </div>
          <span className="text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all mt-0.5">
            <DoodleChevronRight size="sm" />
          </span>
        </div>

        {/* Preview feed icons */}
        {previewFeeds && previewFeeds.length > 0 && (
          <div className="mt-3 flex items-center">
            <div className="flex -space-x-2">
              {previewFeeds.slice(0, 4).map((feed, index) => (
                <motion.div
                  key={feed.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative rounded-full ring-2 ring-card"
                  style={{ zIndex: 4 - index }}
                >
                  <FeedIcon
                    siteUrl={feed.siteUrl}
                    title={feed.name}
                    iconUrl={feed.iconUrl}
                    size="sm"
                  />
                </motion.div>
              ))}
              {previewFeeds.length > 4 && (
                <div className="relative w-7 h-7 rounded-full bg-muted ring-2 ring-card flex items-center justify-center">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    +{previewFeeds.length - 4}
                  </span>
                </div>
              )}
            </div>
            <span className="ml-2.5 text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">
              Popular
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
