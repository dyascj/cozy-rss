"use client";

import { ReactNode } from "react";
import { Folder, useFeedStore } from "@/stores/feedStore";
import { useUIStore } from "@/stores/uiStore";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/ContextMenu";
import { DoodleFolderPlus, DoodlePencil, DoodleTrash } from "@/components/ui/DoodleIcon";

interface FolderContextMenuProps {
  folder: Folder;
  children: ReactNode;
}

export function FolderContextMenu({ folder, children }: FolderContextMenuProps) {
  const { getFolderDepth, feedOrder } = useFeedStore();
  const { openRenameFolderModal, openCreateSubfolderDialog, showConfirmDialog } = useUIStore();
  const { removeFolder } = useFeedStore();

  const currentDepth = getFolderDepth(folder.id);
  const canCreateSubfolder = currentDepth < 2; // Max 3 levels (0, 1, 2)

  const feedCount = feedOrder[folder.id]?.length || 0;

  const handleDelete = () => {
    const hasFeeds = feedCount > 0;
    const description = hasFeeds
      ? `This will delete "${folder.name}" and move its ${feedCount} feed${feedCount > 1 ? 's' : ''} to the root level.`
      : `Are you sure you want to delete "${folder.name}"?`;

    showConfirmDialog({
      title: "Delete Folder",
      description,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: () => removeFolder(folder.id),
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {canCreateSubfolder && (
          <ContextMenuItem onClick={() => openCreateSubfolderDialog(folder.id)}>
            <span className="mr-2"><DoodleFolderPlus size="sm" /></span>
            Create Subfolder
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={() => openRenameFolderModal(folder.id)}>
          <span className="mr-2"><DoodlePencil size="sm" /></span>
          Rename Folder
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger" onClick={handleDelete}>
          <span className="mr-2"><DoodleTrash size="sm" /></span>
          Delete Folder
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
