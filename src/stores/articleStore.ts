import { create } from "zustand";
import { useStatsStore } from "./statsStore";

export interface ReaderContent {
  content: string;
  excerpt: string | null;
  byline: string | null;
  fetchedAt: number;
}

export interface Article {
  id: string;
  feedId: string;
  guid: string;
  title: string;
  link: string;
  author?: string;
  summary?: string;
  content?: string;
  publishedAt: number;
  fetchedAt: number;
  isRead: boolean;
  isStarred: boolean;
  isReadLater: boolean;
  readLaterAddedAt?: number;
  imageUrl?: string;
  readerContent?: ReaderContent | null;
  readerError?: string;
}

interface ArticleState {
  articles: Record<string, Article>;
  articlesByFeed: Record<string, string[]>;
  starredArticles: string[];
  readLaterArticles: string[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface ArticleActions {
  initialize: () => Promise<void>;
  fetchArticlesForFeed: (feedId: string) => Promise<void>;
  addArticles: (feedId: string, articles: Omit<Article, "id">[]) => void;
  markAsRead: (articleId: string) => Promise<void>;
  markAsUnread: (articleId: string) => Promise<void>;
  markAllAsRead: (feedId?: string) => Promise<void>;
  toggleStarred: (articleId: string) => Promise<void>;
  toggleReadLater: (articleId: string) => Promise<void>;
  removeArticlesForFeed: (feedId: string) => void;
  pruneArticles: (feedId: string, maxCount: number) => void;
  getUnreadCount: (feedId: string) => number;
  setReaderContent: (articleId: string, content: ReaderContent) => void;
  setReaderError: (articleId: string, error: string) => void;
  reset: () => void;
}

function generateArticleId(): string {
  // Generate a proper UUID for database compatibility
  return crypto.randomUUID();
}

const initialState: ArticleState = {
  articles: {},
  articlesByFeed: {},
  starredArticles: [],
  readLaterArticles: [],
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const useArticleStore = create<ArticleState & ArticleActions>()(
  (set, get) => ({
    ...initialState,

    initialize: async () => {
      if (get().isInitialized || get().isLoading) return;

      set({ isLoading: true, error: null });

      try {
        const res = await fetch("/api/articles");
        if (!res.ok) throw new Error("Failed to fetch articles");

        const data = await res.json();

        // API returns pre-formatted data as objects
        const articles: Record<string, Article> = {};

        // Transform articles from the map
        for (const [id, article] of Object.entries(data.articles || {})) {
          const a = article as Record<string, unknown>;
          articles[id] = {
            id: a.id as string,
            feedId: a.feedId as string,
            guid: a.guid as string,
            title: a.title as string,
            link: a.link as string,
            content: (a.content as string) || undefined,
            summary: (a.summary as string) || undefined,
            author: (a.author as string) || undefined,
            imageUrl: (a.imageUrl as string) || undefined,
            publishedAt: a.publishedAt
              ? new Date(a.publishedAt as string).getTime()
              : Date.now(),
            fetchedAt: a.fetchedAt
              ? new Date(a.fetchedAt as string).getTime()
              : Date.now(),
            isRead: (a.isRead as boolean) || false,
            isStarred: (a.isStarred as boolean) || false,
            isReadLater: (a.isReadLater as boolean) || false,
          };
        }

        // Use pre-computed arrays and maps from API
        const articlesByFeed = data.articlesByFeed || {};
        const starredArticles = data.starredArticles || [];
        const readLaterArticles = data.readLaterArticles || [];

        // Sort articles by date within each feed
        for (const feedId in articlesByFeed) {
          articlesByFeed[feedId].sort(
            (a: string, b: string) =>
              (articles[b]?.publishedAt || 0) - (articles[a]?.publishedAt || 0)
          );
        }

        set({
          articles,
          articlesByFeed,
          starredArticles,
          readLaterArticles,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        console.error("Failed to initialize article store:", error);
        set({
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to load articles",
        });
      }
    },

    fetchArticlesForFeed: async (feedId: string) => {
      try {
        const res = await fetch(`/api/articles?feedId=${feedId}`);
        if (!res.ok) throw new Error("Failed to fetch articles");

        const data = await res.json();

        set((state) => {
          const newArticles = { ...state.articles };
          const feedArticleIds: string[] = [];
          const newStarred = [...state.starredArticles];
          const newReadLater = [...state.readLaterArticles];

          for (const article of data.articles || []) {
            const mappedArticle: Article = {
              ...article,
              publishedAt: article.publishedAt
                ? new Date(article.publishedAt).getTime()
                : Date.now(),
              fetchedAt: article.fetchedAt
                ? new Date(article.fetchedAt).getTime()
                : Date.now(),
              isRead: article.isRead || false,
              isStarred: article.isStarred || false,
              isReadLater: article.isReadLater || false,
            };

            newArticles[article.id] = mappedArticle;
            feedArticleIds.push(article.id);

            if (mappedArticle.isStarred && !newStarred.includes(article.id)) {
              newStarred.push(article.id);
            }
            if (
              mappedArticle.isReadLater &&
              !newReadLater.includes(article.id)
            ) {
              newReadLater.push(article.id);
            }
          }

          feedArticleIds.sort(
            (a, b) =>
              (newArticles[b]?.publishedAt || 0) -
              (newArticles[a]?.publishedAt || 0)
          );

          return {
            articles: newArticles,
            articlesByFeed: {
              ...state.articlesByFeed,
              [feedId]: feedArticleIds,
            },
            starredArticles: newStarred,
            readLaterArticles: newReadLater,
          };
        });
      } catch (error) {
        console.error("Failed to fetch articles for feed:", error);
      }
    },

    addArticles: (feedId, newArticles) => {
      set((state) => {
        const updatedArticles = { ...state.articles };
        const feedArticleIds = [...(state.articlesByFeed[feedId] || [])];
        let addedCount = 0;

        for (const article of newArticles) {
          // Check if article already exists by guid
          const existingId = Object.keys(updatedArticles).find(
            (id) => updatedArticles[id].feedId === feedId && updatedArticles[id].guid === article.guid
          );
          const id = existingId || generateArticleId();

          if (!updatedArticles[id]) {
            updatedArticles[id] = {
              ...article,
              id,
              isReadLater: article.isReadLater ?? false,
            };
            feedArticleIds.push(id);
            addedCount++;
          }
        }

        if (addedCount === 0) {
          return state;
        }

        feedArticleIds.sort(
          (a, b) =>
            (updatedArticles[b]?.publishedAt || 0) -
            (updatedArticles[a]?.publishedAt || 0)
        );

        return {
          articles: updatedArticles,
          articlesByFeed: {
            ...state.articlesByFeed,
            [feedId]: feedArticleIds,
          },
        };
      });
    },

    markAsRead: async (articleId) => {
      const article = get().articles[articleId];
      if (!article || article.isRead) return;

      // Optimistic update
      set((state) => ({
        articles: {
          ...state.articles,
          [articleId]: { ...article, isRead: true },
        },
      }));

      try {
        const res = await fetch(`/api/articles/${articleId}/state`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isRead: true,
            article: {
              feedId: article.feedId,
              guid: article.guid,
              title: article.title,
              link: article.link,
              content: article.content,
              summary: article.summary,
              author: article.author,
              imageUrl: article.imageUrl,
              publishedAt: article.publishedAt,
            },
          }),
        });

        if (!res.ok) throw new Error("Failed to mark as read");

        // Record article read in stats (fire and forget)
        useStatsStore.getState().recordArticleRead();
      } catch (error) {
        // Revert on error
        console.error("Failed to mark as read:", error);
        set((state) => ({
          articles: {
            ...state.articles,
            [articleId]: { ...article, isRead: false },
          },
        }));
      }
    },

    markAsUnread: async (articleId) => {
      const article = get().articles[articleId];
      if (!article || !article.isRead) return;

      set((state) => ({
        articles: {
          ...state.articles,
          [articleId]: { ...article, isRead: false },
        },
      }));

      try {
        const res = await fetch(`/api/articles/${articleId}/state`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isRead: false,
            article: {
              feedId: article.feedId,
              guid: article.guid,
              title: article.title,
              link: article.link,
              content: article.content,
              summary: article.summary,
              author: article.author,
              imageUrl: article.imageUrl,
              publishedAt: article.publishedAt,
            },
          }),
        });

        if (!res.ok) throw new Error("Failed to mark as unread");
      } catch (error) {
        console.error("Failed to mark as unread:", error);
        set((state) => ({
          articles: {
            ...state.articles,
            [articleId]: { ...article, isRead: true },
          },
        }));
      }
    },

    markAllAsRead: async (feedId) => {
      const currentState = get();
      const articleIds = feedId
        ? currentState.articlesByFeed[feedId] || []
        : Object.keys(currentState.articles);

      const articlesToUpdate = articleIds.filter(
        (id) => currentState.articles[id] && !currentState.articles[id].isRead
      );

      if (articlesToUpdate.length === 0) return;

      // Optimistic update
      set((state) => {
        const updatedArticles = { ...state.articles };
        for (const id of articlesToUpdate) {
          if (updatedArticles[id]) {
            updatedArticles[id] = { ...updatedArticles[id], isRead: true };
          }
        }
        return { articles: updatedArticles };
      });

      // Use batch endpoint for better performance
      try {
        const res = await fetch("/api/articles", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleIds: articlesToUpdate,
            isRead: true,
          }),
        });

        if (!res.ok) throw new Error("Failed to mark all as read");
      } catch (error) {
        console.error("Failed to mark all as read:", error);
        // Revert on error
        set((state) => {
          const revertedArticles = { ...state.articles };
          for (const id of articlesToUpdate) {
            if (revertedArticles[id]) {
              revertedArticles[id] = { ...revertedArticles[id], isRead: false };
            }
          }
          return { articles: revertedArticles };
        });
      }
    },

    toggleStarred: async (articleId) => {
      const article = get().articles[articleId];
      if (!article) return;

      const newStarred = !article.isStarred;

      // Optimistic update
      set((state) => ({
        articles: {
          ...state.articles,
          [articleId]: { ...article, isStarred: newStarred },
        },
        starredArticles: newStarred
          ? [...state.starredArticles, articleId]
          : state.starredArticles.filter((id) => id !== articleId),
      }));

      try {
        const res = await fetch(`/api/articles/${articleId}/state`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isStarred: newStarred,
            article: {
              feedId: article.feedId,
              guid: article.guid,
              title: article.title,
              link: article.link,
              content: article.content,
              summary: article.summary,
              author: article.author,
              imageUrl: article.imageUrl,
              publishedAt: article.publishedAt,
            },
          }),
        });

        if (!res.ok) throw new Error("Failed to toggle starred");
      } catch (error) {
        console.error("Failed to toggle starred:", error);
        // Revert
        set((state) => ({
          articles: {
            ...state.articles,
            [articleId]: { ...article, isStarred: !newStarred },
          },
          starredArticles: !newStarred
            ? [...state.starredArticles, articleId]
            : state.starredArticles.filter((id) => id !== articleId),
        }));
      }
    },

    toggleReadLater: async (articleId) => {
      const article = get().articles[articleId];
      if (!article) return;

      const newReadLater = !article.isReadLater;

      set((state) => ({
        articles: {
          ...state.articles,
          [articleId]: {
            ...article,
            isReadLater: newReadLater,
            readLaterAddedAt: newReadLater ? Date.now() : undefined,
          },
        },
        readLaterArticles: newReadLater
          ? [...state.readLaterArticles, articleId]
          : state.readLaterArticles.filter((id) => id !== articleId),
      }));

      try {
        const res = await fetch(`/api/articles/${articleId}/state`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isReadLater: newReadLater,
            article: {
              feedId: article.feedId,
              guid: article.guid,
              title: article.title,
              link: article.link,
              content: article.content,
              summary: article.summary,
              author: article.author,
              imageUrl: article.imageUrl,
              publishedAt: article.publishedAt,
            },
          }),
        });

        if (!res.ok) throw new Error("Failed to toggle read later");
      } catch (error) {
        console.error("Failed to toggle read later:", error);
        set((state) => ({
          articles: {
            ...state.articles,
            [articleId]: {
              ...article,
              isReadLater: !newReadLater,
              readLaterAddedAt: !newReadLater ? Date.now() : undefined,
            },
          },
          readLaterArticles: !newReadLater
            ? [...state.readLaterArticles, articleId]
            : state.readLaterArticles.filter((id) => id !== articleId),
        }));
      }
    },

    removeArticlesForFeed: (feedId) => {
      set((state) => {
        const articleIds = state.articlesByFeed[feedId] || [];
        const updatedArticles = { ...state.articles };

        for (const id of articleIds) {
          delete updatedArticles[id];
        }

        const { [feedId]: removed, ...remainingByFeed } = state.articlesByFeed;

        return {
          articles: updatedArticles,
          articlesByFeed: remainingByFeed,
          starredArticles: state.starredArticles.filter(
            (id) => !articleIds.includes(id)
          ),
          readLaterArticles: state.readLaterArticles.filter(
            (id) => !articleIds.includes(id)
          ),
        };
      });
    },

    pruneArticles: (feedId, maxCount) => {
      set((state) => {
        const articleIds = state.articlesByFeed[feedId] || [];
        if (articleIds.length <= maxCount) return state;

        const keepIds = articleIds.slice(0, maxCount);
        const removeIds = articleIds.slice(maxCount);

        const updatedArticles = { ...state.articles };
        for (const id of removeIds) {
          if (!updatedArticles[id]?.isStarred) {
            delete updatedArticles[id];
          }
        }

        return {
          articles: updatedArticles,
          articlesByFeed: {
            ...state.articlesByFeed,
            [feedId]: keepIds.filter((id) => updatedArticles[id]),
          },
        };
      });
    },

    getUnreadCount: (feedId) => {
      const state = get();
      const articleIds = state.articlesByFeed[feedId] || [];
      return articleIds.filter((id) => !state.articles[id]?.isRead).length;
    },

    setReaderContent: (articleId, content) => {
      set((state) => {
        const article = state.articles[articleId];
        if (!article) return state;

        return {
          articles: {
            ...state.articles,
            [articleId]: {
              ...article,
              readerContent: content,
              readerError: undefined,
            },
          },
        };
      });
    },

    setReaderError: (articleId, error) => {
      set((state) => {
        const article = state.articles[articleId];
        if (!article) return state;

        return {
          articles: {
            ...state.articles,
            [articleId]: {
              ...article,
              readerError: error,
            },
          },
        };
      });
    },

    reset: () => {
      set(initialState);
    },
  })
);
