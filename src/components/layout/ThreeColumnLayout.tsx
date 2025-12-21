"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useFeedStore } from "@/stores/feedStore";
import { useTagStore } from "@/stores/tagStore";
import { Sidebar } from "./Sidebar";
import { ArticleList } from "./ArticleList";
import { ArticleContent } from "./ArticleContent";
import { MobileBottomTabBar } from "./MobileBottomTabBar";
import { MobileArticleActionBar } from "./MobileArticleActionBar";
import { ProfileButton } from "@/components/account/ProfileButton";
import { cn } from "@/utils/cn";
import { DoodleMenu, DoodleChevronLeft, DoodleSettings } from "@/components/ui/DoodleIcon";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function ThreeColumnLayout() {
  const {
    sidebarWidth,
    articleListWidth,
    setSidebarWidth,
    setArticleListWidth,
    mobilePanel,
    setMobilePanel,
    selectedArticleId,
    openSettingsModal,
  } = useUIStore();

  const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
  const [isDraggingList, setIsDraggingList] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle responsive breakpoints
  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      setIsMobile(width < MOBILE_BREAKPOINT);
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
    };

    checkBreakpoint();
    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, []);

  const handleSidebarDrag = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || isTablet) return;
      e.preventDefault();
      setIsDraggingSidebar(true);

      const startX = e.clientX;
      const startWidth = sidebarWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startX;
        const newWidth = Math.max(180, Math.min(400, startWidth + delta));
        setSidebarWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsDraggingSidebar(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [sidebarWidth, setSidebarWidth, isMobile, isTablet]
  );

  const handleListDrag = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile || isTablet) return;
      e.preventDefault();
      setIsDraggingList(true);

      const startX = e.clientX;
      const startWidth = articleListWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startX;
        const newWidth = Math.max(250, Math.min(600, startWidth + delta));
        setArticleListWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsDraggingList(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [articleListWidth, setArticleListWidth, isMobile, isTablet]
  );

  const { feeds, folders } = useFeedStore();
  const { tags } = useTagStore();

  // Get the current view title for mobile header
  const getMobileTitle = () => {
    const { viewType, selectedFeedId, selectedFolderId, selectedTagId } = useUIStore.getState();

    if (mobilePanel === "sidebar") return "Feeds";

    if (viewType === "starred") return "Starred";
    if (viewType === "readLater") return "Read Later";
    if (viewType === "tag" && selectedTagId) {
      const tag = tags[selectedTagId];
      return tag?.name || "Tag";
    }
    if (viewType === "feed" && selectedFeedId) {
      const feed = feeds[selectedFeedId];
      return feed?.title || "Feed";
    }
    if (viewType === "folder" && selectedFolderId) {
      const folder = folders[selectedFolderId];
      return folder?.name || "Folder";
    }
    return "All Articles";
  };

  // Mobile layout - single panel view with bottom tab bar
  if (isMobile) {
    const showTabBar = mobilePanel !== "content";
    const showArticleActionBar = mobilePanel === "content" && selectedArticleId;

    return (
      <div
        ref={containerRef}
        className="flex flex-col h-screen w-screen overflow-hidden bg-background"
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-sidebar-bg safe-area-top">
          {mobilePanel === "content" ? (
            <>
              <button
                onClick={() => setMobilePanel("list")}
                className="p-2 rounded-md hover:bg-muted active:bg-muted transition-colors flex items-center gap-1 -ml-2 min-h-[44px]"
                aria-label="Back to list"
              >
                <DoodleChevronLeft size="md" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="flex-1" />
            </>
          ) : (
            <>
              <h1 className="font-semibold text-sm truncate flex-1 min-w-0">
                {getMobileTitle()}
              </h1>
              <div className="flex items-center gap-1 flex-shrink-0">
                <ProfileButton />
                <button
                  onClick={openSettingsModal}
                  className="p-2 rounded-md hover:bg-muted active:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Settings"
                >
                  <DoodleSettings size="sm" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden relative">
          {/* Sidebar Panel */}
          <div
            className={cn(
              "absolute inset-0 bg-sidebar-bg transition-transform duration-300 ease-out z-20",
              mobilePanel === "sidebar"
                ? "translate-x-0"
                : "-translate-x-full"
            )}
          >
            <Sidebar onFeedSelect={() => setMobilePanel("list")} hideHeader />
          </div>

          {/* Article List Panel */}
          <div
            className={cn(
              "absolute inset-0 bg-background transition-transform duration-300 ease-out z-10",
              mobilePanel === "list"
                ? "translate-x-0"
                : mobilePanel === "sidebar"
                ? "translate-x-full"
                : "-translate-x-full"
            )}
          >
            <ArticleList hideHeader />
          </div>

          {/* Article Content Panel */}
          <div
            className={cn(
              "absolute inset-0 bg-background transition-transform duration-300 ease-out z-0",
              mobilePanel === "content"
                ? "translate-x-0"
                : "translate-x-full"
            )}
          >
            <ArticleContent onBack={() => setMobilePanel("list")} hideToolbar />
          </div>
        </div>

        {/* Bottom Tab Bar - hidden when reading article */}
        {showTabBar && <MobileBottomTabBar />}

        {/* Article Action Bar - shown when reading article */}
        {showArticleActionBar && (
          <MobileArticleActionBar articleId={selectedArticleId} />
        )}
      </div>
    );
  }

  // Tablet layout - two panels (list + content)
  if (isTablet) {
    return (
      <div
        ref={containerRef}
        className="flex h-screen w-screen overflow-hidden bg-background"
      >
        {/* Sidebar overlay */}
        {mobilePanel === "sidebar" && (
          <div
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => setMobilePanel("list")}
          />
        )}

        {/* Sidebar drawer */}
        <div
          className={cn(
            "fixed left-0 top-0 h-full w-72 bg-sidebar-bg border-r border-border z-50 transition-transform duration-300 ease-out",
            mobilePanel === "sidebar" ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar onFeedSelect={() => setMobilePanel("list")} />
        </div>

        {/* Article List with menu button */}
        <div className="w-80 flex-shrink-0 border-r border-border overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobilePanel("sidebar")}
                className="p-2 rounded-md hover:bg-muted transition-colors -ml-2"
                aria-label="View feeds"
              >
                <DoodleMenu size="md" />
              </button>
              <h2 className="font-semibold text-sm">Articles</h2>
            </div>
            <button
              onClick={openSettingsModal}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Settings"
            >
              <span className="text-muted-foreground">
                <DoodleSettings size="sm" />
              </span>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ArticleList hideHeader />
          </div>
        </div>

        {/* Article Content */}
        <div className="flex-1 overflow-hidden min-w-0">
          <ArticleContent />
        </div>
      </div>
    );
  }

  // Desktop layout - three columns
  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen overflow-hidden bg-background"
      style={{
        cursor: isDraggingSidebar || isDraggingList ? "col-resize" : undefined,
      }}
    >
      {/* Sidebar */}
      <div
        className="flex-shrink-0 bg-sidebar-bg border-r border-border overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        <Sidebar />
      </div>

      {/* Sidebar resize handle */}
      <div
        className="w-1 flex-shrink-0 cursor-col-resize hover:bg-accent/30 transition-colors"
        onMouseDown={handleSidebarDrag}
      />

      {/* Article List */}
      <div
        className="flex-shrink-0 border-r border-border overflow-hidden"
        style={{ width: articleListWidth }}
      >
        <ArticleList />
      </div>

      {/* Article List resize handle */}
      <div
        className="w-1 flex-shrink-0 cursor-col-resize hover:bg-accent/30 transition-colors"
        onMouseDown={handleListDrag}
      />

      {/* Article Content */}
      <div className="flex-1 overflow-hidden min-w-0">
        <ArticleContent />
      </div>
    </div>
  );
}
