"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useUIStore } from "@/stores/uiStore";
import { Sidebar } from "./Sidebar";
import { DoodleClose } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

export function MobileHamburgerDrawer() {
  const { isMobileDrawerOpen, closeMobileDrawer } = useUIStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number | null>(null);
  const currentXRef = useRef<number>(0);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileDrawerOpen) {
        closeMobileDrawer();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileDrawerOpen, closeMobileDrawer]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  // Handle swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;

    const currentX = e.touches[0].clientX;
    const diff = startXRef.current - currentX;

    // Only track leftward swipes (to close)
    if (diff > 0) {
      currentXRef.current = diff;
      if (drawerRef.current) {
        drawerRef.current.style.transform = `translateX(-${Math.min(diff, 300)}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (currentXRef.current > 80) {
      closeMobileDrawer();
    } else if (drawerRef.current) {
      drawerRef.current.style.transform = "";
    }
    startXRef.current = null;
    currentXRef.current = 0;
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          isMobileDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobileDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-sidebar-bg border-r border-border shadow-xl transition-transform duration-300 ease-out flex flex-col",
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border safe-area-top">
          <h2 className="font-semibold text-base">Menu</h2>
          <button
            onClick={closeMobileDrawer}
            className="p-2 -mr-2 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <DoodleClose size="sm" />
          </button>
        </div>

        {/* Drawer Content - Sidebar */}
        <div className="flex-1 overflow-hidden">
          <Sidebar hideHeader onFeedSelect={closeMobileDrawer} />
        </div>

        {/* Safe area bottom */}
        <div className="safe-area-bottom" />
      </div>
    </>,
    document.body
  );
}
