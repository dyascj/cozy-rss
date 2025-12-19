import { create } from "zustand";

export type DragItemType = "feed" | "folder";

export interface DragState {
  isDragging: boolean;
  dragType: DragItemType | null;
  dragId: string | null;
  dropTargetId: string | null; // folder id or "root"
}

interface DragActions {
  startDrag: (type: DragItemType, id: string) => void;
  setDropTarget: (targetId: string | null) => void;
  endDrag: () => void;
}

export const useDragStore = create<DragState & DragActions>((set) => ({
  isDragging: false,
  dragType: null,
  dragId: null,
  dropTargetId: null,

  startDrag: (type, id) =>
    set({
      isDragging: true,
      dragType: type,
      dragId: id,
    }),

  setDropTarget: (targetId) => set({ dropTargetId: targetId }),

  endDrag: () =>
    set({
      isDragging: false,
      dragType: null,
      dragId: null,
      dropTargetId: null,
    }),
}));

// Helper to create drag handlers for feed items
export function createFeedDragHandlers(feedId: string) {
  const { startDrag, endDrag } = useDragStore.getState();

  return {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify({ type: "feed", id: feedId }));
      startDrag("feed", feedId);

      // Add a delay to prevent flickering
      requestAnimationFrame(() => {
        (e.target as HTMLElement).style.opacity = "0.5";
      });
    },
    onDragEnd: (e: React.DragEvent) => {
      (e.target as HTMLElement).style.opacity = "1";
      endDrag();
    },
  };
}

// Helper to create drag handlers for folder items
export function createFolderDragHandlers(folderId: string) {
  const { startDrag, endDrag } = useDragStore.getState();

  return {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify({ type: "folder", id: folderId }));
      startDrag("folder", folderId);

      requestAnimationFrame(() => {
        (e.target as HTMLElement).style.opacity = "0.5";
      });
    },
    onDragEnd: (e: React.DragEvent) => {
      (e.target as HTMLElement).style.opacity = "1";
      endDrag();
    },
  };
}

// Helper to create drop zone handlers
export function createDropZoneHandlers(
  targetFolderId: string | null, // null means root
  onDrop: (type: DragItemType, itemId: string, targetFolderId: string | null) => void,
  canAcceptFolder?: (draggedFolderId: string) => boolean
) {
  const { setDropTarget, dragType, dragId } = useDragStore.getState();
  const targetId = targetFolderId || "root";

  return {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      const state = useDragStore.getState();

      // Prevent dropping folder onto itself or its children
      if (state.dragType === "folder" && state.dragId === targetFolderId) {
        return;
      }

      // Check if we can accept this folder
      if (state.dragType === "folder" && state.dragId && canAcceptFolder && !canAcceptFolder(state.dragId)) {
        return;
      }

      e.dataTransfer.dropEffect = "move";
      setDropTarget(targetId);
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      const state = useDragStore.getState();

      if (state.dragType === "folder" && state.dragId === targetFolderId) {
        return;
      }

      if (state.dragType === "folder" && state.dragId && canAcceptFolder && !canAcceptFolder(state.dragId)) {
        return;
      }

      setDropTarget(targetId);
    },
    onDragLeave: (e: React.DragEvent) => {
      // Only clear if leaving the element entirely
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        const state = useDragStore.getState();
        if (state.dropTargetId === targetId) {
          setDropTarget(null);
        }
      }
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const state = useDragStore.getState();

      try {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        if (data.type && data.id) {
          // Prevent dropping folder onto itself
          if (data.type === "folder" && data.id === targetFolderId) {
            return;
          }

          // Check if we can accept this folder
          if (data.type === "folder" && canAcceptFolder && !canAcceptFolder(data.id)) {
            return;
          }

          onDrop(data.type, data.id, targetFolderId);
        }
      } catch {
        // Invalid data, ignore
      }

      setDropTarget(null);
    },
  };
}
