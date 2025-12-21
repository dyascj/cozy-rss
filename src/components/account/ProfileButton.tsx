"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { DoodleArrowRight, DoodleLoader } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

export function ProfileButton() {
  const { user, isAuthenticated, isLoading, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Session checking is handled by StoreInitializer

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="p-1.5 text-muted-foreground">
        <span className="animate-spin inline-block">
          <DoodleLoader size="sm" />
        </span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all",
          "bg-sage-100 text-sage-700 hover:bg-sage-200",
          isOpen && "ring-2 ring-sage-300"
        )}
        title={user.username}
      >
        {initial}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User info */}
          <div className="px-3 py-2 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center text-sage-700 font-semibold">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {user.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.isAdmin ? "Administrator" : "Reader"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <DoodleArrowRight size="sm" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
