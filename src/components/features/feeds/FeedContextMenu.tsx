"use client";

import { ReactNode } from "react";
import { useFeedStore, Feed } from "@/stores/feedStore";
import { useUIStore } from "@/stores/uiStore";
import { useArticleStore } from "@/stores/articleStore";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";
import { DoodleFolderInput, DoodlePencil, DoodleTrash, DoodleFolderOpen, DoodleFolder } from "@/components/ui/DoodleIcon";

interface FeedContextMenuProps {
  feed: Feed;
  children: ReactNode;
}

export function FeedContextMenu({ feed, children }: FeedContextMenuProps) {
  const { folders, folderOrder, moveFeedToFolder, removeFeed, getChildFolders } = useFeedStore();
  const { openEditFeedModal, showConfirmDialog, selectedFeedId, selectAllArticles } = useUIStore();
  const { removeArticlesForFeed } = useArticleStore();

  // Get root-level folders
  const rootFolders = folderOrder.filter((id) => {
    const folder = folders[id];
    return folder && !folder.parentFolderId;
  });

  // Recursive function to render folder options
  const renderFolderOptions = (parentId: string | null, depth: number = 0) => {
    const folderIds = parentId === null ? rootFolders : getChildFolders(parentId);

    return folderIds.map((folderId) => {
      const folder = folders[folderId];
      if (!folder) return null;

      const childFolders = getChildFolders(folderId);
      const isCurrentFolder = feed.folderId === folderId;
      const hasChildren = childFolders.length > 0;

      if (hasChildren) {
        return (
          <ContextMenuSub key={folderId}>
            <ContextMenuSubTrigger
              className={isCurrentFolder ? "text-accent" : ""}
            >
              <span className="mr-2"><DoodleFolder size="sm" /></span>
              {folder.name}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem
                onClick={() => moveFeedToFolder(feed.id, folderId)}
                disabled={isCurrentFolder}
              >
                <span className="mr-2"><DoodleFolderInput size="sm" /></span>
                Move here
              </ContextMenuItem>
              <ContextMenuSeparator />
              {renderFolderOptions(folderId, depth + 1)}
            </ContextMenuSubContent>
          </ContextMenuSub>
        );
      }

      return (
        <ContextMenuItem
          key={folderId}
          onClick={() => moveFeedToFolder(feed.id, folderId)}
          disabled={isCurrentFolder}
          className={isCurrentFolder ? "text-accent" : ""}
        >
          <span className="mr-2"><DoodleFolder size="sm" /></span>
          {folder.name}
        </ContextMenuItem>
      );
    });
  };

  const handleUnsubscribe = () => {
    showConfirmDialog({
      title: "Unsubscribe from feed?",
      description: `This will remove "${feed.title}" and all its articles. This action cannot be undone.`,
      confirmText: "Unsubscribe",
      variant: "danger",
      onConfirm: () => {
        // If this feed is currently selected, go back to all articles
        if (selectedFeedId === feed.id) {
          selectAllArticles();
        }
        removeArticlesForFeed(feed.id);
        removeFeed(feed.id);
      },
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {/* Move to Folder */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <span className="mr-2"><DoodleFolderInput size="sm" /></span>
            Move to Folder
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem
              onClick={() => moveFeedToFolder(feed.id, null)}
              disabled={feed.folderId === null}
              className={feed.folderId === null ? "text-accent" : ""}
            >
              <span className="mr-2"><DoodleFolderOpen size="sm" /></span>
              No Folder (Root)
            </ContextMenuItem>
            {rootFolders.length > 0 && <ContextMenuSeparator />}
            {renderFolderOptions(null)}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Edit Feed */}
        <ContextMenuItem onClick={() => openEditFeedModal(feed.id)}>
          <span className="mr-2"><DoodlePencil size="sm" /></span>
          Edit Feed
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Unsubscribe */}
        <ContextMenuItem variant="danger" onClick={handleUnsubscribe}>
          <span className="mr-2"><DoodleTrash size="sm" /></span>
          Unsubscribe
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
