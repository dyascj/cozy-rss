"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DoodleSearch, DoodleLoader, DoodleCheckCircle, DoodleAlertCircle, DoodleRss, DoodleExternalLink } from "@/components/ui/DoodleIcon";
import { DiscoverFeed } from "@/types/discover";

interface DiscoveredFeed {
  url: string;
  type: "rss" | "atom" | "json";
  title?: string;
}

interface FeedDiscoveryInputProps {
  onFeedDiscovered: (feed: Partial<DiscoverFeed> & { feedUrl: string }) => void;
}

export function FeedDiscoveryInput({ onFeedDiscovered }: FeedDiscoveryInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    feeds?: DiscoveredFeed[];
    error?: string;
    suggestion?: string;
  } | null>(null);

  const handleDiscover = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      const response = await fetch(
        `/api/discover/find-feed?url=${encodeURIComponent(normalizedUrl)}`
      );
      const data = await response.json();

      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: "Failed to connect. Please check the URL and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleDiscover();
    }
  };

  const handleSubscribe = (feed: DiscoveredFeed) => {
    onFeedDiscovered({
      feedUrl: feed.url,
      name: feed.title || new URL(feed.url).hostname,
      siteUrl: url.startsWith("http") ? url : `https://${url}`,
    });
    // Reset after subscribing
    setUrl("");
    setResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative mb-8"
    >
      {/* Background card */}
      <div className="relative overflow-hidden rounded-xl bg-card border border-border p-6">
        {/* Subtle decorative pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="discovery-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#discovery-grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-sage-100 dark:bg-sage-900/30 rounded-lg">
              <span className="text-sage-600 dark:text-sage-400">
                <DoodleSearch size="sm" />
              </span>
            </div>
            <h3 className="font-semibold text-foreground">
              Find RSS Feed
            </h3>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Enter any website URL and we&apos;ll try to find its RSS feed automatically.
          </p>

          {/* Input area */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com or just example.com"
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                disabled={isLoading}
              />
              {url && !isLoading && (
                <button
                  onClick={() => {
                    setUrl("");
                    setResult(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDiscover}
              disabled={isLoading || !url.trim()}
              className="px-6 py-3 rounded-lg bg-accent hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground text-accent-foreground font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">
                    <DoodleLoader size="sm" />
                  </span>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <DoodleRss size="sm" />
                  <span>Find Feed</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 overflow-hidden"
              >
                {result.success && result.feeds && result.feeds.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-success">
                      <DoodleCheckCircle size="sm" />
                      <span className="text-sm font-medium">
                        Found {result.feeds.length} feed{result.feeds.length > 1 ? "s" : ""}!
                      </span>
                    </div>
                    {result.feeds.map((feed, index) => (
                      <motion.div
                        key={feed.url}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">
                              {feed.title || "RSS Feed"}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-medium uppercase bg-muted text-muted-foreground rounded">
                              {feed.type}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {feed.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={feed.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <DoodleExternalLink size="sm" />
                          </a>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSubscribe(feed)}
                            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-medium transition-colors"
                          >
                            Subscribe
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <span className="text-warning flex-shrink-0 mt-0.5">
                      <DoodleAlertCircle size="md" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {result.error || "No RSS feed found"}
                      </p>
                      {result.suggestion && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
