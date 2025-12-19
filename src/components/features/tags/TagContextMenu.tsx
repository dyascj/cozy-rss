"use client";

import { ReactNode } from "react";
import { Tag, useTagStore } from "@/stores/tagStore";
import { useUIStore } from "@/stores/uiStore";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/ContextMenu";
import { DoodleTrash } from "@/components/ui/DoodleIcon";

interface TagContextMenuProps {
  tag: Tag;
  children: ReactNode;
}

export function TagContextMenu({ tag, children }: TagContextMenuProps) {
  const { deleteTag } = useTagStore();
  const { showConfirmDialog, selectedTagId, selectAllArticles } = useUIStore();

  const handleDelete = () => {
    showConfirmDialog({
      title: "Delete tag?",
      description: `This will delete the "${tag.name}" tag. Articles will not be deleted, but the tag will be removed from all articles.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: () => {
        // If this tag is currently selected, go back to all articles
        if (selectedTagId === tag.id) {
          selectAllArticles();
        }
        deleteTag(tag.id);
      },
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem variant="danger" onClick={handleDelete}>
          <span className="mr-2"><DoodleTrash size="sm" /></span>
          Delete Tag
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
