"use client";

import { motion } from "framer-motion";
import { DoodleSparkles, DoodleRss, DoodleTrendingUp } from "@/components/ui/DoodleIcon";
import { getAllCuratedFeeds } from "@/lib/discover/curatedFeeds";
import { DiscoverFeed } from "@/types/discover";
import { useMemo } from "react";
import { FeedIcon } from "@/components/ui/FeedIcon";

interface FeaturedFeedCardProps {
  feed: DiscoverFeed;
  index: number;
  onClick: (feed: DiscoverFeed) => void;
}

function FeaturedFeedCard({ feed, index, onClick }: FeaturedFeedCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onClick(feed)}
      className="group relative flex-shrink-0 w-[200px] p-4 rounded-xl bg-cream-50 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 text-left hover:border-sage-300 dark:hover:border-sage-500/50 hover:shadow-warm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <FeedIcon
            siteUrl={feed.siteUrl}
            title={feed.name}
            iconUrl={feed.iconUrl}
            size="md"
          />
          {feed.isYouTube && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white">
              <DoodleTrendingUp size="xs" />
            </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-charcoal-900 dark:text-cream-100 truncate group-hover:text-sage-600 dark:group-hover:text-sage-400 transition-colors">
            {feed.name}
          </h4>
          <p className="text-xs text-taupe-500 dark:text-taupe-400 mt-0.5 line-clamp-2">
            {feed.description}
          </p>
        </div>
      </div>
      {feed.tags && feed.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {feed.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] font-medium bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}

interface HeroSectionProps {
  onSelectFeed: (feed: DiscoverFeed) => void;
}

export function HeroSection({ onSelectFeed }: HeroSectionProps) {
  // Get top-rated feeds from different categories for variety
  const featuredFeeds = useMemo(() => {
    const allFeeds = getAllCuratedFeeds();
    const topFeeds = allFeeds
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 20);

    // Pick diverse feeds from different categories
    const selected: DiscoverFeed[] = [];
    const usedCategories = new Set<string>();

    for (const feed of topFeeds) {
      if (selected.length >= 6) break;
      if (!usedCategories.has(feed.category)) {
        selected.push(feed);
        usedCategories.add(feed.category);
      }
    }

    // Fill remaining slots
    for (const feed of topFeeds) {
      if (selected.length >= 6) break;
      if (!selected.includes(feed)) {
        selected.push(feed);
      }
    }

    return selected;
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl mb-8">
      {/* Background - sage green gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage-400 via-sage-500 to-sage-600 dark:from-sage-600 dark:via-sage-700 dark:to-sage-800" />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cream-100/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sage-300/20 rounded-full blur-3xl" />
        <svg
          className="absolute bottom-0 left-0 w-full h-24 text-background"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".15"
            fill="currentColor"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".3"
            fill="currentColor"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-[1] px-6 pt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-3"
        >
          <div className="p-1.5 bg-cream-50/20 rounded-lg backdrop-blur-sm">
            <span className="text-cream-50">
              <DoodleSparkles size="sm" />
            </span>
          </div>
          <span className="text-sm font-medium text-cream-50/90">Featured This Week</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl md:text-3xl font-bold text-cream-50 mb-2 tracking-tight"
        >
          Discover Amazing Feeds
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-cream-100/80 text-sm md:text-base mb-6 max-w-lg"
        >
          Hand-picked sources we think you&apos;ll love. Quality content from across the web.
        </motion.p>

        {/* Featured feeds horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
          {featuredFeeds.map((feed, index) => (
            <FeaturedFeedCard
              key={feed.id}
              feed={feed}
              index={index}
              onClick={onSelectFeed}
            />
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-6 mt-4"
        >
          <div className="flex items-center gap-2 text-cream-100/70">
            <DoodleRss size="sm" />
            <span className="text-sm">120+ curated feeds</span>
          </div>
          <div className="flex items-center gap-2 text-cream-100/70">
            <DoodleSparkles size="sm" />
            <span className="text-sm">11 categories</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
