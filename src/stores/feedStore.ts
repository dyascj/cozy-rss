import { create } from "zustand";

export interface Feed {
  id: string;
  url: string;
  title: string;
  description?: string;
  siteUrl?: string;
  iconUrl?: string;
  folderId: string | null;
  lastFetched: number | null;
  lastError?: string;
  fetchInterval: number;
  createdAt: number;
  unreadCount: number;
}

export interface Folder {
  id: string;
  name: string;
  icon?: string;
  order: number;
  isExpanded: boolean;
  createdAt: number;
  parentFolderId: string | null;
}

interface FeedState {
  feeds: Record<string, Feed>;
  folders: Record<string, Folder>;
  folderOrder: string[];
  feedOrder: Record<string, string[]>;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface FeedActions {
  initialize: () => Promise<void>;
  addFeed: (
    feed: Omit<Feed, "id" | "createdAt" | "unreadCount" | "fetchInterval">
  ) => Promise<string | null>;
  removeFeed: (id: string) => Promise<void>;
  updateFeed: (id: string, updates: Partial<Feed>) => Promise<void>;
  addFolder: (name: string, parentFolderId?: string | null, icon?: string) => Promise<string | null>;
  removeFolder: (id: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Pick<Folder, "name" | "icon">>) => Promise<void>;
  moveFeedToFolder: (feedId: string, folderId: string | null) => Promise<void>;
  moveFolderToParent: (folderId: string, parentFolderId: string | null) => Promise<void>;
  toggleFolderExpanded: (id: string) => void;
  updateUnreadCount: (feedId: string, count: number) => void;
  reorderFeeds: (folderId: string | null, feedIds: string[]) => void;
  getFolderDepth: (folderId: string) => number;
  getChildFolders: (parentFolderId: string | null) => string[];
  reset: () => void;
}

const initialState: FeedState = {
  feeds: {},
  folders: {},
  folderOrder: [],
  feedOrder: { root: [] },
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const useFeedStore = create<FeedState & FeedActions>()((set, get) => ({
  ...initialState,

  initialize: async () => {
    if (get().isInitialized || get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      // The /api/feeds endpoint returns all data pre-formatted
      const res = await fetch("/api/feeds");

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await res.json();

      // Transform feeds to ensure correct types
      const feeds: Record<string, Feed> = {};
      for (const [id, feed] of Object.entries(data.feeds || {})) {
        const f = feed as Record<string, unknown>;
        feeds[id] = {
          id: f.id as string,
          url: f.url as string,
          title: f.title as string,
          description: (f.description as string) || undefined,
          siteUrl: (f.siteUrl as string) || undefined,
          iconUrl: (f.iconUrl as string) || undefined,
          folderId: (f.folderId as string) || null,
          createdAt: f.createdAt ? new Date(f.createdAt as string).getTime() : Date.now(),
          lastFetched: f.lastFetched ? new Date(f.lastFetched as string).getTime() : null,
          unreadCount: (f.unreadCount as number) || 0,
          fetchInterval: (f.fetchInterval as number) || 30,
        };
      }

      // Transform folders to ensure correct types
      const folders: Record<string, Folder> = {};
      for (const [id, folder] of Object.entries(data.folders || {})) {
        const f = folder as Record<string, unknown>;
        folders[id] = {
          id: f.id as string,
          name: f.name as string,
          parentFolderId: (f.parentFolderId as string) || null,
          createdAt: f.createdAt ? new Date(f.createdAt as string).getTime() : Date.now(),
          order: (f.orderIndex as number) || 0,
          isExpanded: true,
        };
      }

      set({
        feeds,
        folders,
        folderOrder: data.folderOrder || [],
        feedOrder: data.feedOrder || { root: [] },
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Failed to initialize feed store:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load feeds",
      });
    }
  },

  addFeed: async (feedData) => {
    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add feed");
      }

      const { feed } = await res.json();

      set((state) => {
        const folderKey = feed.folderId || "root";
        return {
          feeds: {
            ...state.feeds,
            [feed.id]: {
              ...feed,
              createdAt: feed.createdAt ? new Date(feed.createdAt).getTime() : Date.now(),
              lastFetched: null,
              unreadCount: 0,
              fetchInterval: 30,
            },
          },
          feedOrder: {
            ...state.feedOrder,
            [folderKey]: [...(state.feedOrder[folderKey] || []), feed.id],
          },
        };
      });

      return feed.id;
    } catch (error) {
      console.error("Failed to add feed:", error);
      return null;
    }
  },

  removeFeed: async (id) => {
    try {
      const res = await fetch(`/api/feeds/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete feed");

      set((state) => {
        const { [id]: removed, ...remainingFeeds } = state.feeds;
        const newFeedOrder = { ...state.feedOrder };
        for (const folderId in newFeedOrder) {
          newFeedOrder[folderId] = newFeedOrder[folderId].filter(
            (fid) => fid !== id
          );
        }
        return { feeds: remainingFeeds, feedOrder: newFeedOrder };
      });
    } catch (error) {
      console.error("Failed to remove feed:", error);
    }
  },

  updateFeed: async (id, updates) => {
    try {
      const res = await fetch(`/api/feeds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update feed");

      set((state) => ({
        feeds: {
          ...state.feeds,
          [id]: { ...state.feeds[id], ...updates },
        },
      }));
    } catch (error) {
      console.error("Failed to update feed:", error);
    }
  },

  addFolder: async (name, parentFolderId = null, icon) => {
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentFolderId, icon }),
      });

      if (!res.ok) throw new Error("Failed to create folder");

      const { folder } = await res.json();

      set((state) => ({
        folders: {
          ...state.folders,
          [folder.id]: {
            ...folder,
            createdAt: folder.createdAt ? new Date(folder.createdAt).getTime() : Date.now(),
            isExpanded: true,
          },
        },
        folderOrder: [...state.folderOrder, folder.id],
        feedOrder: { ...state.feedOrder, [folder.id]: [] },
      }));

      return folder.id;
    } catch (error) {
      console.error("Failed to add folder:", error);
      return null;
    }
  },

  removeFolder: async (id) => {
    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete folder");

      set((state) => {
        const { [id]: removed, ...remainingFolders } = state.folders;
        const folderFeeds = state.feedOrder[id] || [];
        const { [id]: removedOrder, ...remainingFeedOrder } = state.feedOrder;

        return {
          folders: remainingFolders,
          folderOrder: state.folderOrder.filter((fid) => fid !== id),
          feedOrder: {
            ...remainingFeedOrder,
            root: [...(state.feedOrder.root || []), ...folderFeeds],
          },
          feeds: Object.fromEntries(
            Object.entries(state.feeds).map(([feedId, feed]) => [
              feedId,
              feed.folderId === id ? { ...feed, folderId: null } : feed,
            ])
          ),
        };
      });
    } catch (error) {
      console.error("Failed to remove folder:", error);
    }
  },

  renameFolder: async (id, name) => {
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to rename folder");

      set((state) => ({
        folders: {
          ...state.folders,
          [id]: { ...state.folders[id], name },
        },
      }));
    } catch (error) {
      console.error("Failed to rename folder:", error);
    }
  },

  updateFolder: async (id, updates) => {
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update folder");

      set((state) => ({
        folders: {
          ...state.folders,
          [id]: { ...state.folders[id], ...updates },
        },
      }));
    } catch (error) {
      console.error("Failed to update folder:", error);
    }
  },

  moveFeedToFolder: async (feedId, folderId) => {
    const state = get();
    const feed = state.feeds[feedId];
    if (!feed) return;

    try {
      const res = await fetch(`/api/feeds/${feedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderId }),
      });

      if (!res.ok) throw new Error("Failed to move feed");

      set((state) => {
        const oldFolderKey = feed.folderId || "root";
        const newFolderKey = folderId || "root";

        const newFeedOrder = { ...state.feedOrder };
        newFeedOrder[oldFolderKey] = (newFeedOrder[oldFolderKey] || []).filter(
          (id) => id !== feedId
        );
        newFeedOrder[newFolderKey] = [
          ...(newFeedOrder[newFolderKey] || []),
          feedId,
        ];

        return {
          feeds: {
            ...state.feeds,
            [feedId]: { ...feed, folderId },
          },
          feedOrder: newFeedOrder,
        };
      });
    } catch (error) {
      console.error("Failed to move feed:", error);
    }
  },

  moveFolderToParent: async (folderId, parentFolderId) => {
    const state = get();
    const folder = state.folders[folderId];
    if (!folder) return;

    // Prevent moving folder into itself or its descendants
    if (parentFolderId) {
      let currentId: string | null = parentFolderId;
      while (currentId) {
        if (currentId === folderId) return;
        const parentFolder: Folder | undefined = state.folders[currentId];
        currentId = parentFolder?.parentFolderId ?? null;
      }
    }

    // Check max depth (3 levels)
    const getDepth = (id: string | null): number => {
      if (!id) return 0;
      const f = state.folders[id];
      return f ? 1 + getDepth(f.parentFolderId) : 0;
    };

    const parentDepth = getDepth(parentFolderId);
    if (parentDepth >= 3) return;

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentFolderId }),
      });

      if (!res.ok) throw new Error("Failed to move folder");

      set((state) => ({
        folders: {
          ...state.folders,
          [folderId]: { ...state.folders[folderId], parentFolderId },
        },
      }));
    } catch (error) {
      console.error("Failed to move folder:", error);
    }
  },

  // Local-only operations (UI state)
  toggleFolderExpanded: (id) => {
    set((state) => ({
      folders: {
        ...state.folders,
        [id]: {
          ...state.folders[id],
          isExpanded: !state.folders[id].isExpanded,
        },
      },
    }));
  },

  updateUnreadCount: (feedId, count) => {
    set((state) => ({
      feeds: {
        ...state.feeds,
        [feedId]: { ...state.feeds[feedId], unreadCount: count },
      },
    }));
  },

  reorderFeeds: (folderId, feedIds) => {
    const folderKey = folderId || "root";
    set((state) => ({
      feedOrder: {
        ...state.feedOrder,
        [folderKey]: feedIds,
      },
    }));
  },

  getFolderDepth: (folderId) => {
    const state = get();
    let depth = 0;
    let currentId: string | null = folderId;

    while (currentId) {
      const folder: Folder | undefined = state.folders[currentId];
      if (!folder?.parentFolderId) break;
      currentId = folder.parentFolderId;
      depth++;
    }

    return depth;
  },

  getChildFolders: (parentFolderId) => {
    const state = get();
    return state.folderOrder.filter((id) => {
      const folder = state.folders[id];
      return folder?.parentFolderId === parentFolderId;
    });
  },

  reset: () => {
    set(initialState);
  },
}));
