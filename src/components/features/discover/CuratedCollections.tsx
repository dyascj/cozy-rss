"use client";

import { motion } from "framer-motion";
import { DoodleChevronRight, DoodleSparkles, DoodleBookOpen, DoodleYoutube, DoodlePenTool, DoodleBrain, DoodleGamepad } from "@/components/ui/DoodleIcon";
import { getAllCuratedFeeds } from "@/lib/discover/curatedFeeds";
import { DiscoverFeed, DiscoverCategory } from "@/types/discover";
import { useMemo } from "react";
import { FeedIcon } from "@/components/ui/FeedIcon";
import { useDiscoverStore } from "@/stores/discoverStore";

interface Collection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  filter: (feed: DiscoverFeed) => boolean;
  linkedCategory?: DiscoverCategory;
}

const COLLECTIONS: Collection[] = [
  {
    id: "starter-pack",
    title: "Starter Pack",
    subtitle: "Essential feeds for staying informed",
    icon: <DoodleSparkles size="md" />,
    gradient: "from-sage-400 to-sage-500",
    filter: (feed) =>
      (feed.popularity || 0) >= 90 &&
      ["tech-programming", "news-current-events", "social-media"].includes(feed.category),
    linkedCategory: "tech-programming",
  },
  {
    id: "deep-dives",
    title: "Deep Dives",
    subtitle: "Long-form analysis & thoughtful writing",
    icon: <DoodleBookOpen size="md" />,
    gradient: "from-violet-500 to-violet-600",
    filter: (feed) =>
      feed.category === "indie-blogs" ||
      (feed.tags?.some((t) => ["longform", "analysis", "essays", "thoughts"].includes(t.toLowerCase())) ?? false),
    linkedCategory: "indie-blogs",
  },
  {
    id: "visual-learners",
    title: "Visual Learners",
    subtitle: "YouTube channels & video content",
    icon: <DoodleYoutube size="md" />,
    gradient: "from-red-500 to-red-600",
    filter: (feed) => feed.isYouTube === true,
    linkedCategory: "youtube",
  },
  {
    id: "indie-gems",
    title: "Indie Gems",
    subtitle: "Personal blogs worth following",
    icon: <DoodlePenTool size="md" />,
    gradient: "from-teal-500 to-teal-600",
    filter: (feed) => feed.category === "indie-blogs",
    linkedCategory: "indie-blogs",
  },
  {
    id: "ai-frontier",
    title: "AI Frontier",
    subtitle: "Stay ahead of the AI revolution",
    icon: <DoodleBrain size="md" />,
    gradient: "from-indigo-500 to-indigo-600",
    filter: (feed) => feed.category === "ai-ml",
    linkedCategory: "ai-ml",
  },
  {
    id: "gaming-hub",
    title: "Gaming Hub",
    subtitle: "News, reviews & gaming culture",
    icon: <DoodleGamepad size="md" />,
    gradient: "from-orange-500 to-orange-600",
    filter: (feed) => feed.category === "gaming",
    linkedCategory: "gaming",
  },
];

interface CollectionCardProps {
  feed: DiscoverFeed;
  index: number;
  onClick: (feed: DiscoverFeed) => void;
}

function CollectionFeedCard({ feed, index, onClick }: CollectionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={() => onClick(feed)}
      className="group flex-shrink-0 w-[160px] p-3 rounded-lg bg-card border border-border text-left hover:border-accent/40 hover:shadow-soft transition-all"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <FeedIcon
          siteUrl={feed.siteUrl}
          title={feed.name}
          iconUrl={feed.iconUrl}
          size="sm"
        />
        <h4 className="font-medium text-sm text-foreground truncate flex-1 group-hover:text-accent transition-colors">
          {feed.name}
        </h4>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {feed.description}
      </p>
    </motion.button>
  );
}

interface CollectionRowProps {
  collection: Collection;
  feeds: DiscoverFeed[];
  onSelectFeed: (feed: DiscoverFeed) => void;
  onViewAll?: (category: DiscoverCategory) => void;
  index: number;
}

function CollectionRow({ collection, feeds, onSelectFeed, onViewAll, index }: CollectionRowProps) {
  if (feeds.length === 0) return null;

  const handleViewAll = () => {
    if (collection.linkedCategory && onViewAll) {
      onViewAll(collection.linkedCategory);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
      className="mb-6"
    >
      {/* Collection header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${collection.gradient} text-white shadow-soft`}>
            {collection.icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {collection.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {collection.subtitle}
            </p>
          </div>
        </div>
        {collection.linkedCategory && (
          <button
            onClick={handleViewAll}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>View all</span>
            <DoodleChevronRight size="sm" />
          </button>
        )}
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {feeds.slice(0, 8).map((feed, feedIndex) => (
          <CollectionFeedCard
            key={feed.id}
            feed={feed}
            index={feedIndex}
            onClick={onSelectFeed}
          />
        ))}
      </div>
    </motion.div>
  );
}

interface CuratedCollectionsProps {
  onSelectFeed: (feed: DiscoverFeed) => void;
  onViewCategory?: (category: DiscoverCategory) => void;
}

export function CuratedCollections({ onSelectFeed, onViewCategory }: CuratedCollectionsProps) {
  const { setCategory } = useDiscoverStore();

  const collectionData = useMemo(() => {
    const allFeeds = getAllCuratedFeeds();

    return COLLECTIONS.map((collection) => ({
      collection,
      feeds: allFeeds
        .filter(collection.filter)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0)),
    })).filter((c) => c.feeds.length >= 3); // Only show collections with 3+ feeds
  }, []);

  const handleViewAll = (category: DiscoverCategory) => {
    if (onViewCategory) {
      onViewCategory(category);
    } else {
      setCategory(category);
    }
  };

  return (
    <section className="mb-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-xl font-semibold text-foreground mb-1 tracking-tight">
          Curated Collections
        </h2>
        <p className="text-sm text-muted-foreground">
          Hand-picked feeds organized by theme
        </p>
      </motion.div>

      {collectionData.map(({ collection, feeds }, index) => (
        <CollectionRow
          key={collection.id}
          collection={collection}
          feeds={feeds}
          onSelectFeed={onSelectFeed}
          onViewAll={handleViewAll}
          index={index}
        />
      ))}
    </section>
  );
}
