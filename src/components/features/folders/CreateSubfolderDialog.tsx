"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUIStore } from "@/stores/uiStore";
import { useFeedStore } from "@/stores/feedStore";
import { DoodleClose, DoodleFolderPlus } from "@/components/ui/DoodleIcon";

export function CreateSubfolderDialog() {
  const { createSubfolderParentId, closeCreateSubfolderDialog } = useUIStore();
  const { folders, addFolder } = useFeedStore();

  const [name, setName] = useState("");

  const parentFolder = createSubfolderParentId ? folders[createSubfolderParentId] : null;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (createSubfolderParentId) {
      setName("");
    }
  }, [createSubfolderParentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!createSubfolderParentId || !name.trim()) return;

    addFolder(name.trim(), createSubfolderParentId);
    closeCreateSubfolderDialog();
  };

  const isOpen = createSubfolderParentId !== null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeCreateSubfolderDialog()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-border rounded-xl shadow-xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50">
          <Dialog.Title className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DoodleFolderPlus size="md" />
            Create Subfolder
          </Dialog.Title>

          {parentFolder && (
            <p className="text-sm text-muted-foreground mb-4">
              Creating subfolder inside <strong>{parentFolder.name}</strong>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="subfolder-name"
                className="block text-sm font-medium mb-1.5"
              >
                Folder Name
              </label>
              <input
                id="subfolder-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-sm rounded-lg bg-muted hover:bg-muted-foreground/20 transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted transition-colors"
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
