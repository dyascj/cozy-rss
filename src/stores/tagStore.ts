import { create } from "zustand";

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

// Warm, Anthropic-inspired tag colors
export const TAG_COLORS = [
  { name: "sage", bg: "bg-sage-500", text: "text-sage-500", bgLight: "bg-sage-100 dark:bg-sage-900/30" },
  { name: "emerald", bg: "bg-emerald-600", text: "text-emerald-600", bgLight: "bg-emerald-100 dark:bg-emerald-900/30" },
  { name: "slate", bg: "bg-taupe-500", text: "text-taupe-500", bgLight: "bg-taupe-100 dark:bg-taupe-900/30" },
  { name: "amber", bg: "bg-amber-500", text: "text-amber-500", bgLight: "bg-amber-100 dark:bg-amber-900/30" },
  { name: "rose", bg: "bg-rose-500", text: "text-rose-500", bgLight: "bg-rose-100 dark:bg-rose-900/30" },
  { name: "indigo", bg: "bg-indigo-500", text: "text-indigo-500", bgLight: "bg-indigo-100 dark:bg-indigo-900/30" },
  { name: "teal", bg: "bg-teal-500", text: "text-teal-500", bgLight: "bg-teal-100 dark:bg-teal-900/30" },
  { name: "stone", bg: "bg-stone-500", text: "text-stone-500", bgLight: "bg-stone-100 dark:bg-stone-900/30" },
];

interface TagState {
  tags: Record<string, Tag>;
  articleTags: Record<string, string[]>; // articleId -> tagIds
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface TagActions {
  initialize: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<string | null>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  addTagToArticle: (articleId: string, tagId: string) => Promise<void>;
  removeTagFromArticle: (articleId: string, tagId: string) => Promise<void>;
  setArticleTags: (articleId: string, tagIds: string[]) => Promise<void>;
  getArticleTags: (articleId: string) => Tag[];
  getArticlesByTag: (tagId: string) => string[];
  reset: () => void;
}

const initialState: TagState = {
  tags: {},
  articleTags: {},
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const useTagStore = create<TagState & TagActions>()((set, get) => ({
  ...initialState,

  initialize: async () => {
    if (get().isInitialized || get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const res = await fetch("/api/tags");
      if (!res.ok) throw new Error("Failed to fetch tags");

      const data = await res.json();

      // Convert tags map and process articleTags
      const tags: Record<string, Tag> = {};
      for (const [id, tag] of Object.entries(data.tags || {})) {
        const t = tag as { id: string; name: string; color: string; createdAt?: string };
        tags[id] = {
          ...t,
          createdAt: t.createdAt ? new Date(t.createdAt).getTime() : Date.now(),
        };
      }

      set({
        tags,
        articleTags: data.articleTags || {},
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Failed to initialize tag store:", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load tags",
      });
    }
  },

  createTag: async (name, color) => {
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          // Tag already exists, return existing tag id
          return data.tag?.id || null;
        }
        throw new Error(data.error || "Failed to create tag");
      }

      const { tag } = await res.json();

      set((state) => ({
        tags: {
          ...state.tags,
          [tag.id]: {
            ...tag,
            createdAt: tag.createdAt
              ? new Date(tag.createdAt).getTime()
              : Date.now(),
          },
        },
      }));

      return tag.id;
    } catch (error) {
      console.error("Failed to create tag:", error);
      return null;
    }
  },

  updateTag: async (id, updates) => {
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update tag");

      set((state) => ({
        tags: {
          ...state.tags,
          [id]: { ...state.tags[id], ...updates },
        },
      }));
    } catch (error) {
      console.error("Failed to update tag:", error);
    }
  },

  deleteTag: async (id) => {
    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete tag");

      set((state) => {
        const { [id]: removed, ...remainingTags } = state.tags;

        // Remove tag from all articles
        const newArticleTags: Record<string, string[]> = {};
        for (const [articleId, tagIds] of Object.entries(state.articleTags)) {
          const filtered = tagIds.filter((tid) => tid !== id);
          if (filtered.length > 0) {
            newArticleTags[articleId] = filtered;
          }
        }

        return {
          tags: remainingTags,
          articleTags: newArticleTags,
        };
      });
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  },

  addTagToArticle: async (articleId, tagId) => {
    const currentTags = get().articleTags[articleId] || [];
    if (currentTags.includes(tagId)) return;

    const newTagIds = [...currentTags, tagId];

    // Optimistic update
    set((state) => ({
      articleTags: {
        ...state.articleTags,
        [articleId]: newTagIds,
      },
    }));

    try {
      const res = await fetch(`/api/articles/${articleId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: newTagIds }),
      });

      if (!res.ok) throw new Error("Failed to add tag to article");
    } catch (error) {
      console.error("Failed to add tag to article:", error);
      // Revert
      set((state) => ({
        articleTags: {
          ...state.articleTags,
          [articleId]: currentTags,
        },
      }));
    }
  },

  removeTagFromArticle: async (articleId, tagId) => {
    const currentTags = get().articleTags[articleId] || [];
    const newTags = currentTags.filter((id) => id !== tagId);

    // Optimistic update
    set((state) => {
      if (newTags.length === 0) {
        const { [articleId]: removed, ...remaining } = state.articleTags;
        return { articleTags: remaining };
      }
      return {
        articleTags: {
          ...state.articleTags,
          [articleId]: newTags,
        },
      };
    });

    try {
      const res = await fetch(`/api/articles/${articleId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: newTags }),
      });

      if (!res.ok) throw new Error("Failed to remove tag from article");
    } catch (error) {
      console.error("Failed to remove tag from article:", error);
      // Revert
      set((state) => ({
        articleTags: {
          ...state.articleTags,
          [articleId]: currentTags,
        },
      }));
    }
  },

  setArticleTags: async (articleId, tagIds) => {
    const currentTags = get().articleTags[articleId] || [];

    // Optimistic update
    set((state) => ({
      articleTags: {
        ...state.articleTags,
        [articleId]: tagIds,
      },
    }));

    try {
      const res = await fetch(`/api/articles/${articleId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds }),
      });

      if (!res.ok) throw new Error("Failed to set article tags");
    } catch (error) {
      console.error("Failed to set article tags:", error);
      // Revert
      set((state) => ({
        articleTags: {
          ...state.articleTags,
          [articleId]: currentTags,
        },
      }));
    }
  },

  getArticleTags: (articleId) => {
    const state = get();
    const tagIds = state.articleTags[articleId] || [];
    return tagIds.map((id) => state.tags[id]).filter(Boolean);
  },

  getArticlesByTag: (tagId) => {
    const state = get();
    return Object.entries(state.articleTags)
      .filter(([, tagIds]) => tagIds.includes(tagId))
      .map(([articleId]) => articleId);
  },

  reset: () => {
    set(initialState);
  },
}));
