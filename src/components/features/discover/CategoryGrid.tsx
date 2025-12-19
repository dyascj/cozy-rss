"use client";

import { motion } from "framer-motion";
import { DISCOVER_CATEGORIES } from "@/lib/discover/categories";
import { getCuratedFeedsForCategory } from "@/lib/discover/curatedFeeds";
import { DiscoverCategory } from "@/types/discover";
import { CategoryCard } from "./CategoryCard";
import { useMemo } from "react";

interface CategoryGridProps {
  onSelectCategory: (category: DiscoverCategory) => void;
}

export function CategoryGrid({ onSelectCategory }: CategoryGridProps) {
  // Get feed counts and preview feeds for each category
  const categoryData = useMemo(() => {
    return DISCOVER_CATEGORIES.map((category) => {
      const feeds = getCuratedFeedsForCategory(category.id);
      const topFeeds = feeds
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 6);
      return {
        category,
        feedCount: feeds.length,
        previewFeeds: topFeeds,
      };
    });
  }, []);

  return (
    <section className="mb-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2
          className="text-xl font-bold text-gray-900 dark:text-white mb-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Browse by Category
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Explore feeds organized by topic
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryData.map(({ category, feedCount, previewFeeds }, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <CategoryCard
              category={category}
              onClick={() => onSelectCategory(category.id)}
              feedCount={feedCount}
              previewFeeds={previewFeeds}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
