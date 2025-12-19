"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUIStore } from "@/stores/uiStore";
import { useTagStore, TAG_COLORS } from "@/stores/tagStore";
import { DoodleClose, DoodleTag } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

export function CreateTagModal() {
  const { isCreateTagModalOpen, closeCreateTagModal } = useUIStore();
  const { createTag } = useTagStore();

  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].name);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isCreateTagModalOpen) {
      setName("");
      setSelectedColor(TAG_COLORS[0].name);
    }
  }, [isCreateTagModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    createTag(name.trim(), selectedColor);
    closeCreateTagModal();
  };

  return (
    <Dialog.Root open={isCreateTagModalOpen} onOpenChange={(open) => !open && closeCreateTagModal()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-cream-300 dark:border-charcoal-700 rounded-2xl shadow-warm p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50">
          <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DoodleTag size="md" />
            Create Tag
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="tag-name"
                className="block text-sm font-medium mb-1.5"
              >
                Tag Name
              </label>
              <input
                id="tag-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tag name"
                className="w-full px-3 py-2 text-sm bg-cream-100 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/50"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tag Color
              </label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      color.bg,
                      selectedColor === color.name && "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                    )}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            {name.trim() && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Preview
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                      TAG_COLORS.find(c => c.name === selectedColor)?.bgLight,
                      TAG_COLORS.find(c => c.name === selectedColor)?.text
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", TAG_COLORS.find(c => c.name === selectedColor)?.bg)} />
                    {name.trim()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-xl bg-cream-200 dark:bg-charcoal-700 hover:bg-cream-300 dark:hover:bg-charcoal-600 transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 text-sm rounded-xl bg-sage-500 text-cream-50 hover:bg-sage-600 shadow-soft transition-all disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-cream-200 dark:hover:bg-charcoal-700 transition-colors"
              aria-label="Close"
            >
              <DoodleClose size="sm" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
