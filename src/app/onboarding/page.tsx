"use client";

import { useState, useMemo, useEffect } from "react";
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
import { SystemThemeProvider } from "@/components/SystemThemeProvider";

function OnboardingContent() {
  const router = useRouter();
  const [selectedFeeds, setSelectedFeeds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Override global overflow: hidden for this page
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    const originalHtmlHeight = html.style.height;
    const originalBodyHeight = body.style.height;

    html.style.overflow = "auto";
    body.style.overflow = "auto";
    html.style.height = "auto";
    body.style.height = "auto";

    return () => {
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
      html.style.height = originalHtmlHeight;
      body.style.height = originalBodyHeight;
    };
  }, []);

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
    if (selectedFeeds.size === 0) {
      router.push("/");
      return;
    }

    setIsSubmitting(true);

    try {
      // Subscribe to each selected feed
      const feedsToAdd = suggestedFeeds.filter((f) => selectedFeeds.has(f.id));

      for (const feed of feedsToAdd) {
        await fetch("/api/feeds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: feed.feedUrl,
            title: feed.name,
            siteUrl: feed.siteUrl,
            iconUrl: feed.iconUrl,
            folderId: null,
          }),
        });
      }

      router.push("/");
    } catch (error) {
      console.error("Error subscribing to feeds:", error);
      // Still navigate even if some feeds failed
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-muted rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
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
          <div className="flex items-center gap-2">
            <span className="text-accent">
              <DoodleRss size="md" />
            </span>
            <span className="font-semibold text-foreground tracking-tight text-lg">
              CozyRSS
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border shadow-sm mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <span className="text-accent">
                <DoodleSparkles size="xs" />
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Let&apos;s get started
              </span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-3">
              Welcome! Build your feed
            </h1>
            <p className="text-muted-foreground text-lg">
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
              className="group flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground rounded-xl font-medium text-lg hover:opacity-90 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {selectedFeeds.size > 0 ? (
                <>
                  Continue with {selectedFeeds.size} feed
                  {selectedFeeds.size !== 1 ? "s" : ""}
                </>
              ) : (
                <>Continue to CozyRSS</>
              )}
              <DoodleChevronRight
                size="sm"
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <p className="text-sm text-muted-foreground">
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
      className={`relative p-4 rounded-2xl border text-left transition-all ${
        isSelected
          ? "bg-card border-accent/30 shadow-xl shadow-foreground/5"
          : "bg-card/60 border-border hover:bg-card hover:border-border hover:shadow-lg hover:shadow-foreground/5"
      }`}
    >
      {/* Selection indicator */}
      <div
        className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          isSelected
            ? "bg-accent border-accent text-accent-foreground"
            : "border-border bg-card"
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
          <h3 className="font-semibold text-foreground truncate">{feed.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {feed.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default function OnboardingPage() {
  return (
    <SystemThemeProvider>
      <OnboardingContent />
    </SystemThemeProvider>
  );
}
