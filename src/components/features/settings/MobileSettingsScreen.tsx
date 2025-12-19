"use client";

import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { DoodleChevronLeft } from "@/components/ui/DoodleIcon";
import { SettingsContent } from "./SettingsContent";

export function MobileSettingsScreen() {
  const { isMobileSettingsOpen, closeMobileSettings } = useUIStore();
  const { user, signOut } = useAuthStore();

  if (!isMobileSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar-bg safe-area-top">
        <button
          onClick={closeMobileSettings}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] -ml-2 px-2"
          aria-label="Go back"
        >
          <DoodleChevronLeft size="sm" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-semibold flex-1">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-8">
          <SettingsContent showKeyboardShortcuts={false} />

          {/* Account Section */}
          <div className="mt-6 pt-6 border-t border-border">
            <label className="block text-sm font-medium mb-3">Account</label>

            {user && (
              <div className="bg-cream-100 dark:bg-charcoal-800 rounded-xl p-4 border border-cream-200 dark:border-charcoal-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-sage-200 dark:bg-sage-800 flex items-center justify-center text-sage-700 dark:text-sage-300 font-medium">
                    {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.displayName || user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    signOut();
                    closeMobileSettings();
                  }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-cream-200 dark:bg-charcoal-700 hover:bg-cream-300 dark:hover:bg-charcoal-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safe area bottom */}
      <div className="safe-area-bottom" />
    </div>
  );
}
