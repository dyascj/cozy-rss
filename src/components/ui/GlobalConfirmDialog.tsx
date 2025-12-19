"use client";

import { useUIStore } from "@/stores/uiStore";
import { ConfirmDialog } from "./ConfirmDialog";

export function GlobalConfirmDialog() {
  const { confirmDialog, closeConfirmDialog } = useUIStore();

  if (!confirmDialog) return null;

  return (
    <ConfirmDialog
      open={true}
      onOpenChange={(open) => !open && closeConfirmDialog()}
      title={confirmDialog.title}
      description={confirmDialog.description}
      confirmText={confirmDialog.confirmText}
      cancelText={confirmDialog.cancelText}
      variant={confirmDialog.variant}
      onConfirm={confirmDialog.onConfirm}
    />
  );
}
