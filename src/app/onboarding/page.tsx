"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  DoodleRss,
  DoodleCheck,
  DoodleChevronRight,
  DoodleSparkles,
} from "@/components/ui/DoodleIcon";
import { FeedIcon } from "@/components/ui/FeedIcon";
import { getAllCuratedFeeds } from "@/lib/discover/curatedFeeds";
import { DiscoverFeed } from "@/types/discover";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedFeeds, setSelectedFeeds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get popular feeds for onboarding
  const suggestedFeeds = useMemo(() => {
    const allFeeds = getAllCuratedFeeds();
    return allFeeds
      .filter((f) => (f.popularity || 0) >= 80)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 12);
  }, []);

  const toggleFeed = (feedId: string) => {
    setSelectedFeeds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(feedId)) {
        newSet.delete(feedId);
      } else {
        newSet.add(feedId);
      }
      return newSet;
    });
  };

  const handleSkip = () => {
    router.push("/");
  };

  const handleContinue = async () => {
    setIsSubmitting(true);

    // TODO: In the future, subscribe to selected feeds via API
    // For now, just redirect to the main app

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100/50 to-amber-50/30 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-sage-100/40 to-sage-200/20 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-amber-100/30 to-stone-200/20 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between px-6 sm:px-10 py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center text-white shadow-md shadow-sage-500/20">
              <DoodleRss size="sm" />
            </div>
            <span className="text-xl font-semibold text-stone-900 tracking-tight">
              Reader
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            Skip for now
          </button>
        </motion.header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center px-6 py-8 sm:py-12">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-500 text-white shadow-xl shadow-sage-500/25 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <DoodleSparkles size="lg" />
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-3">
              Welcome! Let&apos;s build your feed
            </h1>
            <p className="text-stone-500 text-lg">
              Choose some sources to get started. You can always add more later.
            </p>
          </motion.div>

          {/* Feed grid */}
          <motion.div
            className="w-full max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedFeeds.map((feed, index) => (
                <FeedCard
                  key={feed.id}
                  feed={feed}
                  isSelected={selectedFeeds.has(feed.id)}
                  onToggle={() => toggleFeed(feed.id)}
                  index={index}
                />
              ))}
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="mt-10 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-sage-500 to-sage-600 text-white rounded-xl font-semibold text-lg shadow-xl shadow-sage-500/25 hover:shadow-2xl hover:shadow-sage-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
            >
              {selectedFeeds.size > 0 ? (
                <>
                  Continue with {selectedFeeds.size} feed
                  {selectedFeeds.size !== 1 ? "s" : ""}
                </>
              ) : (
                <>Continue to Reader</>
              )}
              <DoodleChevronRight
                size="sm"
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <p className="text-sm text-stone-400">
              {selectedFeeds.size === 0
                ? "You can explore feeds in the Discover section"
                : "Great choices! You can discover more feeds anytime."}
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

interface FeedCardProps {
  feed: DiscoverFeed;
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}

function FeedCard({ feed, isSelected, onToggle, index }: FeedCardProps) {
  return (
    <motion.button
      onClick={onToggle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.3 + index * 0.05,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-4 rounded-xl border text-left transition-all ${
        isSelected
          ? "bg-sage-50 border-sage-300 shadow-md shadow-sage-500/10"
          : "bg-white/60 backdrop-blur-sm border-stone-200/50 hover:bg-white hover:border-stone-300 hover:shadow-lg hover:shadow-stone-900/5"
      }`}
    >
      {/* Selection indicator */}
      <div
        className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          isSelected
            ? "bg-sage-500 border-sage-500 text-white"
            : "border-stone-300 bg-white"
        }`}
      >
        {isSelected && <DoodleCheck size="xs" />}
      </div>

      <div className="flex items-start gap-3 pr-6">
        <FeedIcon
          iconUrl={feed.iconUrl}
          siteUrl={feed.siteUrl}
          title={feed.name}
          size="lg"
          className="rounded-lg"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 truncate">{feed.name}</h3>
          <p className="text-sm text-stone-500 line-clamp-2 mt-0.5">
            {feed.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
