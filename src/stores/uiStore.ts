import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ViewMode = "all" | "unread" | "starred";
export type ViewType = "feed" | "folder" | "all" | "starred" | "readLater" | "tag";
export type MobilePanel = "sidebar" | "list" | "content";
export type ArticleListLayout = "list" | "card" | "magazine" | "title-only";

export interface ConfirmDialogConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
}

interface UIState {
  selectedFeedId: string | null;
  selectedFolderId: string | null;
  selectedArticleId: string | null;
  selectedTagId: string | null;
  viewType: ViewType;
  viewMode: ViewMode;
  articleListLayout: ArticleListLayout;
  sidebarWidth: number;
  articleListWidth: number;
  isAddFeedModalOpen: boolean;
  isSettingsModalOpen: boolean;
  searchQuery: string;
  isRefreshing: boolean;
  readerModeEnabled: boolean;
  loadingReaderContent: Record<string, boolean>;
  mobilePanel: MobilePanel;
  // Feed/Folder management modals
  editFeedModalFeedId: string | null;
  renameFolderModalFolderId: string | null;
  createSubfolderParentId: string | null;
  isCreateFolderModalOpen: boolean;
  isCreateTagModalOpen: boolean;
  confirmDialog: ConfirmDialogConfig | null;
}

interface UIActions {
  selectFeed: (feedId: string) => void;
  selectFolder: (folderId: string) => void;
  selectAllArticles: () => void;
  selectStarred: () => void;
  selectReadLater: () => void;
  selectTag: (tagId: string) => void;
  selectArticle: (articleId: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setArticleListLayout: (layout: ArticleListLayout) => void;
  setSidebarWidth: (width: number) => void;
  setArticleListWidth: (width: number) => void;
  openAddFeedModal: () => void;
  closeAddFeedModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  setSearchQuery: (query: string) => void;
  setIsRefreshing: (isRefreshing: boolean) => void;
  toggleReaderMode: () => void;
  setLoadingReaderContent: (articleId: string, loading: boolean) => void;
  setMobilePanel: (panel: MobilePanel) => void;
  // Feed/Folder management modals
  openEditFeedModal: (feedId: string) => void;
  closeEditFeedModal: () => void;
  openRenameFolderModal: (folderId: string) => void;
  closeRenameFolderModal: () => void;
  openCreateSubfolderDialog: (parentFolderId: string) => void;
  closeCreateSubfolderDialog: () => void;
  openCreateFolderModal: () => void;
  closeCreateFolderModal: () => void;
  openCreateTagModal: () => void;
  closeCreateTagModal: () => void;
  showConfirmDialog: (config: ConfirmDialogConfig) => void;
  closeConfirmDialog: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      selectedFeedId: null,
      selectedFolderId: null,
      selectedArticleId: null,
      selectedTagId: null,
      viewType: "all",
      viewMode: "all",
      articleListLayout: "list",
      sidebarWidth: 250,
      articleListWidth: 350,
      isAddFeedModalOpen: false,
      isSettingsModalOpen: false,
      searchQuery: "",
      isRefreshing: false,
      readerModeEnabled: false,
      loadingReaderContent: {},
      mobilePanel: "list",
      editFeedModalFeedId: null,
      renameFolderModalFolderId: null,
      createSubfolderParentId: null,
      isCreateFolderModalOpen: false,
      isCreateTagModalOpen: false,
      confirmDialog: null,

      selectFeed: (feedId) =>
        set({
          selectedFeedId: feedId,
          selectedFolderId: null,
          selectedArticleId: null,
          selectedTagId: null,
          viewType: "feed",
          mobilePanel: "list",
        }),

      selectFolder: (folderId) =>
        set({
          selectedFeedId: null,
          selectedFolderId: folderId,
          selectedArticleId: null,
          selectedTagId: null,
          viewType: "folder",
          mobilePanel: "list",
        }),

      selectAllArticles: () =>
        set({
          selectedFeedId: null,
          selectedFolderId: null,
          selectedArticleId: null,
          selectedTagId: null,
          viewType: "all",
          mobilePanel: "list",
        }),

      selectStarred: () =>
        set({
          selectedFeedId: null,
          selectedFolderId: null,
          selectedArticleId: null,
          selectedTagId: null,
          viewType: "starred",
          mobilePanel: "list",
        }),

      selectReadLater: () =>
        set({
          selectedFeedId: null,
          selectedFolderId: null,
          selectedArticleId: null,
          selectedTagId: null,
          viewType: "readLater",
          mobilePanel: "list",
        }),

      selectTag: (tagId) =>
        set({
          selectedFeedId: null,
          selectedFolderId: null,
          selectedArticleId: null,
          selectedTagId: tagId,
          viewType: "tag",
          mobilePanel: "list",
        }),

      selectArticle: (articleId) =>
        set({
          selectedArticleId: articleId,
          mobilePanel: articleId ? "content" : "list",
        }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setArticleListLayout: (layout) => set({ articleListLayout: layout }),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      setArticleListWidth: (width) => set({ articleListWidth: width }),

      openAddFeedModal: () => set({ isAddFeedModalOpen: true }),

      closeAddFeedModal: () => set({ isAddFeedModalOpen: false }),

      openSettingsModal: () => set({ isSettingsModalOpen: true }),

      closeSettingsModal: () => set({ isSettingsModalOpen: false }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setIsRefreshing: (isRefreshing) => set({ isRefreshing }),

      toggleReaderMode: () =>
        set((state) => ({ readerModeEnabled: !state.readerModeEnabled })),

      setLoadingReaderContent: (articleId, loading) =>
        set((state) => ({
          loadingReaderContent: {
            ...state.loadingReaderContent,
            [articleId]: loading,
          },
        })),

      setMobilePanel: (panel) => set({ mobilePanel: panel }),

      openEditFeedModal: (feedId) => set({ editFeedModalFeedId: feedId }),
      closeEditFeedModal: () => set({ editFeedModalFeedId: null }),

      openRenameFolderModal: (folderId) => set({ renameFolderModalFolderId: folderId }),
      closeRenameFolderModal: () => set({ renameFolderModalFolderId: null }),

      openCreateSubfolderDialog: (parentFolderId) => set({ createSubfolderParentId: parentFolderId }),
      closeCreateSubfolderDialog: () => set({ createSubfolderParentId: null }),

      openCreateFolderModal: () => set({ isCreateFolderModalOpen: true }),
      closeCreateFolderModal: () => set({ isCreateFolderModalOpen: false }),

      openCreateTagModal: () => set({ isCreateTagModalOpen: true }),
      closeCreateTagModal: () => set({ isCreateTagModalOpen: false }),

      showConfirmDialog: (config) => set({ confirmDialog: config }),
      closeConfirmDialog: () => set({ confirmDialog: null }),
    }),
    {
      name: "rss-reader-ui",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        sidebarWidth: state.sidebarWidth,
        articleListWidth: state.articleListWidth,
        viewMode: state.viewMode,
        articleListLayout: state.articleListLayout,
        readerModeEnabled: state.readerModeEnabled,
      }),
    }
  )
);
