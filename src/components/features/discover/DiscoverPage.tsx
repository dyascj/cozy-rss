"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CategoryGrid } from "./CategoryGrid";
import { FeedGrid } from "./FeedGrid";
import { DiscoverSearchBar } from "./DiscoverSearchBar";
import { HeroSection } from "./HeroSection";
import { FeedDiscoveryInput } from "./FeedDiscoveryInput";
import { CuratedCollections } from "./CuratedCollections";
import { FeedPreviewModal } from "./FeedPreviewModal";
import { useDiscoverStore } from "@/stores/discoverStore";
import { DoodleArrowLeft, DoodleCompass, DoodleChevronRight } from "@/components/ui/DoodleIcon";
import Link from "next/link";
import { getCategoryMeta } from "@/lib/discover/categories";
import { DiscoverFeed, FeedPreview } from "@/types/discover";

export function DiscoverPage() {
  const {
    selectedCategory,
    setCategory,
    searchQuery,
    searchResults,
    clearSearch,
    feedPreviews,
    setFeedPreview,
    loadingPreview,
    setLoadingPreview,
  } = useDiscoverStore();

  const mainRef = useRef<HTMLElement>(null);

  // Preview modal state
  const [selectedFeed, setSelectedFeed] = useState<DiscoverFeed | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Reset scroll when category changes
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [selectedCategory]);

  // Cleanup search state on unmount
  useEffect(() => {
    return () => {
      clearSearch();
    };
  }, [clearSearch]);

  const categoryMeta = selectedCategory ? getCategoryMeta(selectedCategory) : null;
  const isSearchActive = searchQuery.length >= 2;

  // Handle back navigation
  const handleBack = () => {
    if (isSearchActive) {
      clearSearch();
    } else if (selectedCategory) {
      setCategory(null);
    }
  };

  // Handle feed selection for preview
  const handleSelectFeed = useCallback(async (feed: DiscoverFeed) => {
    setSelectedFeed(feed);
    setIsPreviewOpen(true);

    // Fetch preview if not cached
    const cachedPreview = feedPreviews[feed.feedUrl];
    if (!cachedPreview || Date.now() - cachedPreview.fetchedAt > 5 * 60 * 1000) {
      setLoadingPreview(feed.feedUrl);
      try {
        const response = await fetch(`/api/discover/preview?url=${encodeURIComponent(feed.feedUrl)}`);
        if (response.ok) {
          const preview: FeedPreview = await response.json();
          setFeedPreview(feed.feedUrl, preview);
        }
      } catch (error) {
        console.error("Failed to fetch preview:", error);
      } finally {
        setLoadingPreview(null);
      }
    }
  }, [feedPreviews, setFeedPreview, setLoadingPreview]);

  // Handle discovered feed from URL input
  const handleFeedDiscovered = useCallback((feedData: Partial<DiscoverFeed> & { feedUrl: string }) => {
    const feed: DiscoverFeed = {
      id: `discovered-${Date.now()}`,
      name: feedData.name || "Discovered Feed",
      description: feedData.description || "",
      feedUrl: feedData.feedUrl,
      siteUrl: feedData.siteUrl || feedData.feedUrl,
      category: feedData.category || "lifestyle-other",
      source: feedData.source || "curated",
      iconUrl: feedData.iconUrl,
      tags: feedData.tags,
      popularity: feedData.popularity,
      isYouTube: feedData.isYouTube,
      isPodcast: feedData.isPodcast,
      isNewsletter: feedData.isNewsletter,
    };
    handleSelectFeed(feed);
  }, [handleSelectFeed]);

  const shouldNavigateHome = !selectedCategory && !isSearchActive;
  const currentPreview = selectedFeed ? feedPreviews[selectedFeed.feedUrl] : null;

  return (
    <div className="h-screen overflow-y-auto bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            {shouldNavigateHome ? (
              <Link
                href="/"
                className="p-2 -ml-2 rounded-lg hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Back to reader"
              >
                <span className="text-foreground/70">
                  <DoodleArrowLeft size="md" />
                </span>
              </Link>
            ) : (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={isSearchActive ? "Clear search" : "Back to categories"}
              >
                <span className="text-foreground/70">
                  <DoodleArrowLeft size="md" />
                </span>
              </button>
            )}

            {/* Breadcrumb navigation */}
            <nav className="flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
              <button
                onClick={() => {
                  setCategory(null);
                  clearSearch();
                }}
                className={`flex items-center gap-1.5 ${
                  selectedCategory || isSearchActive
                    ? "text-muted-foreground hover:text-foreground cursor-pointer"
                    : "text-foreground font-semibold cursor-default"
                } transition-colors`}
                disabled={!selectedCategory && !isSearchActive}
              >
                <span className="flex-shrink-0">
                  <DoodleCompass size="sm" />
                </span>
                <span className="truncate">Discover</span>
              </button>

              {selectedCategory && categoryMeta && (
                <>
                  <span className="text-muted-foreground/60 flex-shrink-0">
                    <DoodleChevronRight size="sm" />
                  </span>
                  <span className="font-semibold text-foreground truncate">
                    {categoryMeta.name}
                  </span>
                </>
              )}

              {isSearchActive && (
                <>
                  <span className="text-muted-foreground/60 flex-shrink-0">
                    <DoodleChevronRight size="sm" />
                  </span>
                  <span className="font-semibold text-foreground truncate">
                    Search
                  </span>
                </>
              )}
            </nav>
          </div>
          <DiscoverSearchBar />
        </div>
      </header>

      {/* Content */}
      <main ref={mainRef} className="max-w-5xl mx-auto px-4 py-6">
        {isSearchActive ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FeedGrid
              feeds={searchResults}
              title={`Search results for "${searchQuery}"`}
              emptyMessage="No feeds found matching your search"
            />
          </motion.div>
        ) : selectedCategory ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FeedGrid category={selectedCategory} />
          </motion.div>
        ) : (
          <>
            {/* Hero Section */}
            <HeroSection onSelectFeed={handleSelectFeed} />

            {/* Feed Discovery Input */}
            <FeedDiscoveryInput onFeedDiscovered={handleFeedDiscovered} />

            {/* Curated Collections */}
            <CuratedCollections onSelectFeed={handleSelectFeed} />

            {/* Category Grid */}
            <CategoryGrid
              onSelectCategory={(category) => {
                setCategory(category);
                clearSearch();
              }}
            />
          </>
        )}
      </main>

      {/* Feed Preview Modal */}
      {selectedFeed && (
        <FeedPreviewModal
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          feed={selectedFeed}
          preview={currentPreview || null}
          isLoading={loadingPreview === selectedFeed.feedUrl}
        />
      )}
    </div>
  );
}
