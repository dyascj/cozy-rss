"use client";

import { useMemo } from "react";
import { useFeedStore } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/utils/cn";
import {
  DoodleInbox,
  DoodleStar,
  DoodleClock,
  DoodlePlus,
  DoodleSettings,
  DoodleFolderPlus,
  DoodleCompass,
} from "@/components/ui/DoodleIcon";
import Link from "next/link";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { FeedIcon } from "@/components/ui/FeedIcon";
import { FolderTreeItem } from "@/components/features/folders/FolderTreeItem";
import { FeedContextMenu } from "@/components/features/feeds/FeedContextMenu";
import { useTagStore, TAG_COLORS } from "@/stores/tagStore";
import { TagContextMenu } from "@/components/features/tags/TagContextMenu";
import { useDragStore, createFeedDragHandlers, createDropZoneHandlers, DragItemType } from "@/hooks/useDragAndDrop";
import { ProfileButton } from "@/components/account/ProfileButton";
import { Tooltip } from "@/components/ui/Tooltip";

interface SidebarProps {
  onFeedSelect?: () => void;
  hideHeader?: boolean;
}

export function Sidebar({ onFeedSelect, hideHeader }: SidebarProps = {}) {
  const { feeds, folders, folderOrder, feedOrder, moveFeedToFolder, moveFolderToParent } = useFeedStore();
  const { articles, articlesByFeed } = useArticleStore();
  const {
    viewType,
    selectedFeedId,
    selectedFolderId,
    selectedTagId,
    selectFeed,
    selectFolder,
    selectAllArticles,
    selectStarred,
    selectReadLater,
    selectTag,
    openAddFeedModal,
    openSettingsModal,
    openCreateFolderModal,
  } = useUIStore();
  const { toggleFolderExpanded } = useFeedStore();
  const { tags, articleTags } = useTagStore();
  const { dropTargetId } = useDragStore();

  const handleDrop = (type: DragItemType, itemId: string, targetFolderId: string | null) => {
    if (type === "feed") {
      moveFeedToFolder(itemId, targetFolderId);
    } else if (type === "folder") {
      moveFolderToParent(itemId, targetFolderId);
    }
  };

  const rootDropHandlers = createDropZoneHandlers(null, handleDrop);

  const totalUnreadCount = useMemo(() => {
    let count = 0;
    for (const feedId in articlesByFeed) {
      const articleIds = articlesByFeed[feedId] || [];
      count += articleIds.filter((id) => !articles[id]?.isRead).length;
    }
    return count;
  }, [articlesByFeed, articles]);

  const starredCount = useMemo(() => {
    return Object.values(articles).filter((a) => a.isStarred).length;
  }, [articles]);

  const readLaterCount = useMemo(() => {
    return Object.values(articles).filter((a) => a.isReadLater).length;
  }, [articles]);

  const getTagArticleCount = (tagId: string) => {
    return Object.entries(articleTags).filter(([_, tagIds]) => tagIds.includes(tagId)).length;
  };

  const allTags = Object.values(tags);

  const getUnreadCountForFeed = (feedId: string) => {
    const articleIds = articlesByFeed[feedId] || [];
    return articleIds.filter((id) => !articles[id]?.isRead).length;
  };

  const getUnreadCountForFolder = (folderId: string) => {
    const feedIds = feedOrder[folderId] || [];
    return feedIds.reduce((sum, feedId) => sum + getUnreadCountForFeed(feedId), 0);
  };

  const rootFeeds = feedOrder.root || [];

  return (
    <div className="flex flex-col h-full bg-sidebar-bg">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60">
          <h1 className="font-semibold text-sm tracking-tight text-foreground truncate">CozyRSS</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ProfileButton />
            <Tooltip
              title="Settings"
              content="Customize your reading experience, theme, and preferences."
            >
              <button
                onClick={openSettingsModal}
                className="p-1.5 rounded-md hover:bg-muted/80 transition-colors flex-shrink-0"
                aria-label="Settings"
              >
                <DoodleSettings size="sm" />
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Content */}
      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="h-full w-full">
          <div className="p-2 space-y-0.5">
            {/* All Articles */}
            <button
              onClick={() => {
                selectAllArticles();
                onFeedSelect?.();
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                viewType === "all" && !selectedFeedId && !selectedFolderId
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <DoodleInbox size="sm" className="flex-shrink-0" />
              <span className="flex-1 text-left truncate">All Articles</span>
              {totalUnreadCount > 0 && (
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                  viewType === "all" && !selectedFeedId && !selectedFolderId
                    ? "bg-accent-foreground/20"
                    : "bg-accent/15 text-accent"
                )}>
                  {totalUnreadCount}
                </span>
              )}
            </button>

            {/* Starred */}
            <button
              onClick={() => {
                selectStarred();
                onFeedSelect?.();
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                viewType === "starred"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <DoodleStar size="sm" className="flex-shrink-0" />
              <span className="flex-1 text-left truncate">Starred</span>
              {starredCount > 0 && (
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                  viewType === "starred"
                    ? "bg-accent-foreground/20"
                    : "bg-muted text-muted-foreground"
                )}>
                  {starredCount}
                </span>
              )}
            </button>

            {/* Read Later */}
            <button
              onClick={() => {
                selectReadLater();
                onFeedSelect?.();
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                viewType === "readLater"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <DoodleClock size="sm" className="flex-shrink-0" />
              <span className="flex-1 text-left truncate">Read Later</span>
              {readLaterCount > 0 && (
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                  viewType === "readLater"
                    ? "bg-accent-foreground/20"
                    : "bg-muted text-muted-foreground"
                )}>
                  {readLaterCount}
                </span>
              )}
            </button>

            {/* Discover */}
            <Link
              href="/discover"
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <DoodleCompass size="sm" className="flex-shrink-0" />
              <span className="flex-1 text-left truncate">Discover</span>
            </Link>

            {/* Tags - Always visible */}
            <div className="h-px bg-border/50 my-3 mx-1" />
            <div className="flex items-center justify-between px-3 py-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tags</p>
              <Tooltip
                title="Create Tag"
                content="Create a new tag to organize and categorize your articles."
              >
                <button
                  onClick={() => useUIStore.getState().openCreateTagModal()}
                  className="p-1.5 rounded hover:bg-muted/80 transition-colors flex-shrink-0"
                  aria-label="Create tag"
                >
                  <DoodlePlus size="sm" />
                </button>
              </Tooltip>
            </div>
            {allTags.length > 0 ? (
              allTags.map((tag) => {
                const colorConfig = TAG_COLORS.find((c) => c.name === tag.color) || TAG_COLORS[0];
                const count = getTagArticleCount(tag.id);

                return (
                  <TagContextMenu key={tag.id} tag={tag}>
                    <button
                      onClick={() => {
                        selectTag(tag.id);
                        onFeedSelect?.();
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        viewType === "tag" && selectedTagId === tag.id
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <span className={cn("w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-sidebar-bg flex-shrink-0", colorConfig.bg)} />
                      <span className="flex-1 text-left truncate">{tag.name}</span>
                      {count > 0 && (
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                          viewType === "tag" && selectedTagId === tag.id
                            ? "bg-accent-foreground/20"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  </TagContextMenu>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground/70 px-3 py-2 italic">
                No tags yet
              </p>
            )}

            {/* Divider */}
            <div className="h-px bg-border/50 my-3 mx-1" />

            {/* Feeds Section Header */}
            <div className="flex items-center justify-between px-3 py-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Feeds</p>
              <Tooltip
                title="Create Folder"
                content="Create a new folder to group and organize your feeds."
              >
                <button
                  onClick={openCreateFolderModal}
                  className="p-1.5 rounded hover:bg-muted/80 transition-colors flex-shrink-0"
                  aria-label="Create folder"
                >
                  <DoodleFolderPlus size="sm" />
                </button>
              </Tooltip>
            </div>

            {/* Folders (only root-level) */}
            {folderOrder
              .filter((folderId) => {
                const folder = folders[folderId];
                return folder && !folder.parentFolderId;
              })
              .map((folderId) => {
                const folder = folders[folderId];
                if (!folder) return null;

                return (
                  <FolderTreeItem
                    key={folderId}
                    folder={folder}
                    depth={0}
                    onFeedSelect={onFeedSelect}
                  />
                );
              })}

            {/* Root feeds (no folder) - also acts as drop zone */}
            <div
              {...rootDropHandlers}
              className={cn(
                "min-h-[40px] rounded-lg transition-colors",
                dropTargetId === "root" && "bg-accent/20 ring-2 ring-accent ring-inset"
              )}
            >
              {rootFeeds.map((feedId) => {
                const feed = feeds[feedId];
                if (!feed) return null;

                const unread = getUnreadCountForFeed(feedId);
                const dragHandlers = createFeedDragHandlers(feedId);

                return (
                  <FeedContextMenu key={feedId} feed={feed}>
                    <button
                      {...dragHandlers}
                      onClick={() => {
                        selectFeed(feedId);
                        onFeedSelect?.();
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-grab active:cursor-grabbing",
                        selectedFeedId === feedId
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <FeedIcon
                        iconUrl={feed.iconUrl}
                        siteUrl={feed.siteUrl}
                        title={feed.title}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <span className="flex-1 text-left truncate">{feed.title}</span>
                      {unread > 0 && (
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                          selectedFeedId === feedId
                            ? "bg-accent-foreground/20"
                            : "bg-accent/15 text-accent"
                        )}>
                          {unread}
                        </span>
                      )}
                    </button>
                  </FeedContextMenu>
                );
              })}
              {rootFeeds.length === 0 && Object.keys(folders).length > 0 && (
                <p className="text-xs text-muted-foreground/70 px-3 py-2 italic">
                  Drop feeds here to remove from folder
                </p>
              )}
            </div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex select-none touch-none p-0.5 bg-transparent transition-colors duration-150 ease-out data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-muted-foreground/20 hover:bg-muted-foreground/30 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* Add Feed Button */}
      <div className="p-3 border-t border-border/60">
        <button
          onClick={openAddFeedModal}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98] transition-all shadow-sm"
        >
          <DoodlePlus size="sm" />
          Add Feed
        </button>
      </div>
    </div>
  );
}
