"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { DoodleClose, DoodleAlertTriangle } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "danger";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background border border-border rounded-xl shadow-xl p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50">
          <div className="flex items-start gap-4">
            {variant === "danger" && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-red-500">
                  <DoodleAlertTriangle size="md" />
                </span>
              </div>
            )}
            <div className="flex-1">
              <Dialog.Title className="text-base font-semibold">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                {description}
              </Dialog.Description>
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-end">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm rounded-lg bg-muted hover:bg-muted-foreground/20 transition-colors">
                {cancelText}
              </button>
            </Dialog.Close>
            <button
              onClick={handleConfirm}
              className={cn(
                "px-4 py-2 text-sm rounded-lg transition-colors",
                variant === "danger"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-accent text-accent-foreground hover:bg-accent/90"
              )}
            >
              {confirmText}
            </button>
          </div>

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
