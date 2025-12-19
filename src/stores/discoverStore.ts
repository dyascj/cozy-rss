import { create } from "zustand";
import {
  DiscoverCategory,
  DiscoverFeed,
  FeedPreview,
} from "@/types/discover";

interface DiscoverState {
  // Navigation
  selectedCategory: DiscoverCategory | null;

  // Feeds by category (cached)
  feeds: Record<DiscoverCategory, DiscoverFeed[]>;
  loadingCategory: DiscoverCategory | null;
  categoryError: string | null;

  // Feed previews (cached with TTL)
  feedPreviews: Record<string, FeedPreview>;
  loadingPreview: string | null;
  previewError: string | null;

  // Search
  searchQuery: string;
  searchResults: DiscoverFeed[];
  isSearching: boolean;
}

interface DiscoverActions {
  // Navigation
  setCategory: (category: DiscoverCategory | null) => void;

  // Feeds
  setFeeds: (category: DiscoverCategory, feeds: DiscoverFeed[]) => void;
  setLoadingCategory: (category: DiscoverCategory | null) => void;
  setCategoryError: (error: string | null) => void;

  // Previews
  setFeedPreview: (feedUrl: string, preview: FeedPreview) => void;
  setLoadingPreview: (feedUrl: string | null) => void;
  setPreviewError: (error: string | null) => void;
  clearPreview: (feedUrl: string) => void;
  getPreview: (feedUrl: string) => FeedPreview | null;

  // Search
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: DiscoverFeed[]) => void;
  setIsSearching: (searching: boolean) => void;
  clearSearch: () => void;

  // Reset
  reset: () => void;
}

const PREVIEW_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const initialState: DiscoverState = {
  selectedCategory: null,
  feeds: {
    "tech-programming": [],
    "ai-ml": [],
    "youtube": [],
    "social-media": [],
    "design-creative": [],
    "gaming": [],
    "entertainment-media": [],
    "news-current-events": [],
    "podcasts-newsletters": [],
    "indie-blogs": [],
    "lifestyle-other": [],
  },
  loadingCategory: null,
  categoryError: null,
  feedPreviews: {},
  loadingPreview: null,
  previewError: null,
  searchQuery: "",
  searchResults: [],
  isSearching: false,
};

export const useDiscoverStore = create<DiscoverState & DiscoverActions>()(
  (set, get) => ({
    ...initialState,

    setCategory: (category) => set({ selectedCategory: category }),

    setFeeds: (category, feeds) =>
      set((state) => ({
        feeds: { ...state.feeds, [category]: feeds },
        categoryError: null,
      })),

    setLoadingCategory: (category) => set({ loadingCategory: category }),

    setCategoryError: (error) => set({ categoryError: error }),

    setFeedPreview: (feedUrl, preview) =>
      set((state) => ({
        feedPreviews: { ...state.feedPreviews, [feedUrl]: preview },
        previewError: null,
      })),

    setLoadingPreview: (feedUrl) => set({ loadingPreview: feedUrl }),

    setPreviewError: (error) => set({ previewError: error }),

    clearPreview: (feedUrl) =>
      set((state) => {
        const { [feedUrl]: _, ...rest } = state.feedPreviews;
        return { feedPreviews: rest };
      }),

    getPreview: (feedUrl) => {
      const preview = get().feedPreviews[feedUrl];
      if (!preview) return null;

      // Check if cache is still valid
      if (Date.now() - preview.fetchedAt > PREVIEW_CACHE_TTL) {
        return null;
      }

      return preview;
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    setSearchResults: (results) => set({ searchResults: results }),

    setIsSearching: (searching) => set({ isSearching: searching }),

    clearSearch: () =>
      set({
        searchQuery: "",
        searchResults: [],
        isSearching: false,
      }),

    reset: () => set(initialState),
  })
);
