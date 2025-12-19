"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUIStore } from "@/stores/uiStore";
import { useFeedStore } from "@/stores/feedStore";
import { DoodleClose, DoodleFolderPlus } from "@/components/ui/DoodleIcon";
import { IconPicker } from "@/components/ui/IconPicker";

export function CreateFolderModal() {
  const { isCreateFolderModalOpen, closeCreateFolderModal } = useUIStore();
  const { addFolder } = useFeedStore();

  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Folder");

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isCreateFolderModalOpen) {
      setName("");
      setSelectedIcon("Folder");
    }
  }, [isCreateFolderModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    addFolder(name.trim(), null, selectedIcon);
    closeCreateFolderModal();
  };

  return (
    <Dialog.Root open={isCreateFolderModalOpen} onOpenChange={(open) => !open && closeCreateFolderModal()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-cream-300 dark:border-charcoal-700 rounded-2xl shadow-warm p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50">
          <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DoodleFolderPlus size="md" />
            Create Folder
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="folder-name"
                className="block text-sm font-medium mb-1.5"
              >
                Folder Name
              </label>
              <input
                id="folder-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-3 py-2 text-sm bg-cream-100 dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500/50"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Folder Icon
              </label>
              <IconPicker
                selectedIcon={selectedIcon}
                onSelect={setSelectedIcon}
              />
            </div>

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
