"use client";

import { useState } from "react";
import { useTagStore, TAG_COLORS, Tag } from "@/stores/tagStore";
import { cn } from "@/utils/cn";
import { DoodlePlus, DoodleTag } from "@/components/ui/DoodleIcon";
import * as Popover from "@radix-ui/react-popover";
import { TagBadge } from "./TagBadge";

interface TagSelectorProps {
  articleId: string;
  className?: string;
}

export function TagSelector({ articleId, className }: TagSelectorProps) {
  const { tags, articleTags, createTag, addTagToArticle, removeTagFromArticle } = useTagStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].name);

  const currentTagIds = articleTags[articleId] || [];
  const allTags = Object.values(tags);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    const tagId = await createTag(newTagName.trim(), selectedColor);
    if (tagId) {
      await addTagToArticle(articleId, tagId);
    }
    setNewTagName("");
    setIsCreating(false);
  };

  const handleToggleTag = async (tag: Tag) => {
    if (currentTagIds.includes(tag.id)) {
      await removeTagFromArticle(articleId, tag.id);
    } else {
      await addTagToArticle(articleId, tag.id);
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors",
            className
          )}
          aria-label="Manage tags"
          title="Manage tags"
        >
          <DoodleTag size="sm" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-64 bg-background border border-border rounded-lg shadow-lg p-3 z-50"
          sideOffset={5}
          align="start"
        >
          <div className="space-y-3">
            {/* Current tags */}
            {currentTagIds.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Current tags</p>
                <div className="flex flex-wrap gap-1">
                  {currentTagIds.map((tagId) => {
                    const tag = tags[tagId];
                    if (!tag) return null;
                    return (
                      <TagBadge
                        key={tagId}
                        tag={tag}
                        size="md"
                        onRemove={() => removeTagFromArticle(articleId, tagId)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add existing tag */}
            {allTags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Add tag</p>
                <div className="flex flex-wrap gap-1">
                  {allTags
                    .filter((tag) => !currentTagIds.includes(tag.id))
                    .map((tag) => (
                      <TagBadge
                        key={tag.id}
                        tag={tag}
                        size="md"
                        onClick={() => handleToggleTag(tag)}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Create new tag */}
            {isCreating ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  className="w-full px-2 py-1.5 text-sm bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateTag();
                    if (e.key === "Escape") setIsCreating(false);
                  }}
                />
                <div className="flex flex-wrap gap-1">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={cn(
                        "w-6 h-6 rounded-full transition-all",
                        color.bg,
                        selectedColor === color.name && "ring-2 ring-offset-2 ring-offset-background ring-foreground"
                      )}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                    className="flex-1 px-2 py-1.5 text-sm bg-accent text-accent-foreground rounded-md hover:bg-accent/90 disabled:opacity-50 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewTagName("");
                    }}
                    className="px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors"
              >
                <DoodlePlus size="sm" />
                Create new tag
              </button>
            )}
          </div>
          <Popover.Arrow className="fill-background" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
