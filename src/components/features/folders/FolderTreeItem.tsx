"use client";

import { useMemo } from "react";
import { useFeedStore, Folder, Feed } from "@/stores/feedStore";
import { useArticleStore } from "@/stores/articleStore";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/utils/cn";
import { DoodleChevronRight, DoodleFolderOpen, DoodleFolder } from "@/components/ui/DoodleIcon";
import { FeedIcon } from "@/components/ui/FeedIcon";
import { getFolderIcon } from "@/components/ui/IconPicker";
import { FeedContextMenu } from "@/components/features/feeds/FeedContextMenu";
import { FolderContextMenu } from "@/components/features/folders/FolderContextMenu";
import {
  useDragStore,
  createFeedDragHandlers,
  createFolderDragHandlers,
  createDropZoneHandlers,
  DragItemType,
} from "@/hooks/useDragAndDrop";

interface FolderTreeItemProps {
  folder: Folder;
  depth?: number;
  onFeedSelect?: () => void;
}

export function FolderTreeItem({
  folder,
  depth = 0,
  onFeedSelect,
}: FolderTreeItemProps) {
  const { feeds, folders, feedOrder, folderOrder, toggleFolderExpanded, getChildFolders, moveFeedToFolder, moveFolderToParent, getFolderDepth } = useFeedStore();
  const { articles, articlesByFeed } = useArticleStore();
  const { viewType, selectedFeedId, selectedFolderId, selectFeed, selectFolder } = useUIStore();
  const { dropTargetId, dragId, dragType } = useDragStore();

  const folderFeedIds = feedOrder[folder.id] || [];
  const childFolderIds = useMemo(() => getChildFolders(folder.id), [folder.id, getChildFolders, folderOrder, folders]);

  // Drag and drop handlers
  const handleDrop = (type: DragItemType, itemId: string, targetFolderId: string | null) => {
    if (type === "feed") {
      moveFeedToFolder(itemId, targetFolderId);
    } else if (type === "folder") {
      moveFolderToParent(itemId, targetFolderId);
    }
  };

  // Check if a folder can be dropped here (prevent circular nesting and max depth)
  const canAcceptFolder = (draggedFolderId: string): boolean => {
    // Can't drop folder into itself
    if (draggedFolderId === folder.id) return false;

    // Can't drop into a descendant
    let currentId: string | null = folder.id;
    while (currentId) {
      if (currentId === draggedFolderId) return false;
      const f: Folder | undefined = folders[currentId];
      currentId = f?.parentFolderId ?? null;
    }

    // Check max depth (parent depth + 1 should be < 3)
    const targetDepth = getFolderDepth(folder.id);
    if (targetDepth >= 2) return false;

    return true;
  };

  const folderDropHandlers = createDropZoneHandlers(folder.id, handleDrop, canAcceptFolder);
  const folderDragHandlers = createFolderDragHandlers(folder.id);
  const isDropTarget = dropTargetId === folder.id;
  const isDraggingSelf = dragType === "folder" && dragId === folder.id;

  const getUnreadCountForFeed = (feedId: string) => {
    const articleIds = articlesByFeed[feedId] || [];
    return articleIds.filter((id) => !articles[id]?.isRead).length;
  };

  const getUnreadCountRecursive = (folderId: string): number => {
    const feedIds = feedOrder[folderId] || [];
    let count = feedIds.reduce((sum, feedId) => sum + getUnreadCountForFeed(feedId), 0);

    const children = getChildFolders(folderId);
    for (const childId of children) {
      count += getUnreadCountRecursive(childId);
    }

    return count;
  };

  const unreadCount = useMemo(() => getUnreadCountRecursive(folder.id), [folder.id, feedOrder, articles, articlesByFeed, folders]);

  const maxDepth = 3;
  const indentPx = depth * 16;

  return (
    <div className="mb-0.5">
      {/* Folder header - acts as both drag source and drop target */}
      <FolderContextMenu folder={folder}>
        <button
          {...folderDragHandlers}
          {...folderDropHandlers}
          onClick={() => toggleFolderExpanded(folder.id)}
          onDoubleClick={() => {
            selectFolder(folder.id);
            onFeedSelect?.();
          }}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-grab active:cursor-grabbing",
            viewType === "folder" && selectedFolderId === folder.id
              ? "bg-accent text-accent-foreground"
              : "hover:bg-muted",
            isDropTarget && !isDraggingSelf && "bg-accent/20 ring-2 ring-accent ring-inset"
          )}
          style={{ paddingLeft: `${12 + indentPx}px` }}
        >
          <span
            className={cn(
              "transition-transform flex-shrink-0",
              folder.isExpanded && "rotate-90"
            )}
          >
            <DoodleChevronRight size="sm" />
          </span>
          {(() => {
            const CustomIcon = folder.icon ? getFolderIcon(folder.icon) : null;
            if (CustomIcon && folder.icon !== "Folder") {
              return <span className="flex-shrink-0"><CustomIcon size="sm" /></span>;
            }
            return folder.isExpanded ? (
              <span className="flex-shrink-0"><DoodleFolderOpen size="sm" /></span>
            ) : (
              <span className="flex-shrink-0"><DoodleFolder size="sm" /></span>
            );
          })()}
          <span className="flex-1 text-left truncate">{folder.name}</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
              {unreadCount}
            </span>
          )}
        </button>
      </FolderContextMenu>

      {/* Expanded content: child folders and feeds */}
      {folder.isExpanded && (
        <div className="mt-0.5">
          {/* Child folders (recursive) */}
          {childFolderIds.map((childFolderId) => {
            const childFolder = folders[childFolderId];
            if (!childFolder) return null;

            return (
              <FolderTreeItem
                key={childFolderId}
                folder={childFolder}
                depth={Math.min(depth + 1, maxDepth)}
                onFeedSelect={onFeedSelect}
              />
            );
          })}

          {/* Feeds in this folder */}
          {folderFeedIds.map((feedId) => {
            const feed = feeds[feedId];
            if (!feed) return null;

            const unread = getUnreadCountForFeed(feedId);
            const feedDragHandlers = createFeedDragHandlers(feedId);

            return (
              <FeedContextMenu key={feedId} feed={feed}>
                <button
                  {...feedDragHandlers}
                  onClick={() => {
                    selectFeed(feedId);
                    onFeedSelect?.();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-grab active:cursor-grabbing",
                    selectedFeedId === feedId
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  )}
                  style={{ paddingLeft: `${28 + indentPx}px` }}
                >
                  <FeedIcon
                    iconUrl={feed.iconUrl}
                    siteUrl={feed.siteUrl}
                    title={feed.title}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <span className="flex-1 text-left truncate">{feed.title}</span>
                  {unread > 0 && (
                    <span className="text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {unread}
                    </span>
                  )}
                </button>
              </FeedContextMenu>
            );
          })}
        </div>
      )}
    </div>
  );
}
