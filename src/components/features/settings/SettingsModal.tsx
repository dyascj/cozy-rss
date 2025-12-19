"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useUIStore } from "@/stores/uiStore";
import { DoodleClose } from "@/components/ui/DoodleIcon";
import { SettingsContent } from "./SettingsContent";

export function SettingsModal() {
  const { isSettingsModalOpen, closeSettingsModal } = useUIStore();

  return (
    <Dialog.Root open={isSettingsModalOpen} onOpenChange={closeSettingsModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-cream-300 dark:border-charcoal-700 rounded-2xl shadow-warm p-6 max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Title className="text-lg font-semibold mb-6">
            Settings
          </Dialog.Title>

          <SettingsContent showKeyboardShortcuts={true} />

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
