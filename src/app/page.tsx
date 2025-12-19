"use client";

import { useEffect } from "react";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";
import { AddFeedModal } from "@/components/features/feeds/AddFeedModal";
import { EditFeedModal } from "@/components/features/feeds/EditFeedModal";
import { SettingsModal } from "@/components/features/settings/SettingsModal";
import { GlobalConfirmDialog } from "@/components/ui/GlobalConfirmDialog";
import { CreateSubfolderDialog } from "@/components/features/folders/CreateSubfolderDialog";
import { CreateFolderModal } from "@/components/features/folders/CreateFolderModal";
import { RenameFolderDialog } from "@/components/features/folders/RenameFolderDialog";
import { CreateTagModal } from "@/components/features/tags/CreateTagModal";
import { CelebrationToast } from "@/components/ui/CelebrationToast";
import { StoreInitializer } from "@/components/StoreInitializer";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useFeedRefresh } from "@/hooks/useFeedRefresh";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFaviconBadge } from "@/hooks/useFaviconBadge";

function HomeContent() {
  // Initialize keyboard navigation
  useKeyboardNavigation();

  // Initialize feed refresh
  useFeedRefresh();

  // Update document title and favicon with unread count
  useDocumentTitle();
  useFaviconBadge();

  // Prevent default browser scroll behavior
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden">
      <ThreeColumnLayout />
      <AddFeedModal />
      <EditFeedModal />
      <SettingsModal />
      <CreateSubfolderDialog />
      <CreateFolderModal />
      <RenameFolderDialog />
      <CreateTagModal />
      <GlobalConfirmDialog />
      <CelebrationToast />
    </main>
  );
}

export default function Home() {
  return (
    <StoreInitializer>
      <HomeContent />
    </StoreInitializer>
  );
}
