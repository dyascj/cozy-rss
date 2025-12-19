"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUIStore } from "@/stores/uiStore";
import { useFeedStore } from "@/stores/feedStore";
import { DoodleClose } from "@/components/ui/DoodleIcon";

export function EditFeedModal() {
  const { editFeedModalFeedId, closeEditFeedModal } = useUIStore();
  const { feeds, updateFeed } = useFeedStore();

  const feed = editFeedModalFeedId ? feeds[editFeedModalFeedId] : null;
  const [title, setTitle] = useState("");

  // Reset form when feed changes
  useEffect(() => {
    if (feed) {
      setTitle(feed.title);
    }
  }, [feed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editFeedModalFeedId || !title.trim()) return;

    updateFeed(editFeedModalFeedId, { title: title.trim() });
    closeEditFeedModal();
  };

  const isOpen = editFeedModalFeedId !== null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeEditFeedModal()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-cream-300 dark:border-charcoal-700 rounded-2xl shadow-warm p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Edit Feed
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="feed-title"
                className="block text-sm font-medium mb-1.5"
              >
                Title
              </label>
              <input
                id="feed-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Feed title"
                className="w-full px-3 py-2 text-sm bg-cream-100 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/50"
                autoFocus
              />
            </div>

            {feed && (
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">
                  URL
                </label>
                <p className="text-sm text-muted-foreground truncate bg-cream-100 dark:bg-charcoal-800/50 px-3 py-2 rounded-xl border border-cream-200 dark:border-charcoal-700">
                  {feed.url}
                </p>
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
                disabled={!title.trim()}
                className="px-4 py-2 text-sm rounded-xl bg-sage-500 text-cream-50 hover:bg-sage-600 shadow-soft transition-all disabled:opacity-50"
              >
                Save
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
