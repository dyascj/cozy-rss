"use client";

import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/utils/cn";
import { DoodleInbox, DoodleStar, DoodleClock, DoodleTrendingUp, DoodleSettings } from "@/components/ui/DoodleIcon";

type TabId = "all" | "starred" | "later" | "stats" | "settings";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: "xs" | "sm" | "md" | "lg" | "xl" }>;
}

const tabs: Tab[] = [
  { id: "all", label: "All", icon: DoodleInbox },
  { id: "starred", label: "Starred", icon: DoodleStar },
  { id: "later", label: "Later", icon: DoodleClock },
  { id: "stats", label: "Stats", icon: DoodleTrendingUp },
  { id: "settings", label: "Settings", icon: DoodleSettings },
];

interface MobileBottomTabBarProps {
  onTabChange?: () => void;
}

export function MobileBottomTabBar({ onTabChange }: MobileBottomTabBarProps) {
  const {
    viewType,
    isMobileSettingsOpen,
    selectAllArticles,
    selectStarred,
    selectReadLater,
    selectStats,
    openMobileSettings,
    closeMobileSettings,
  } = useUIStore();

  const getActiveTab = (): TabId => {
    if (isMobileSettingsOpen) return "settings";
    if (viewType === "stats") return "stats";
    if (viewType === "starred") return "starred";
    if (viewType === "readLater") return "later";
    return "all";
  };

  const activeTab = getActiveTab();

  const handleTabPress = (tabId: TabId) => {
    // Close settings when switching to other tabs
    if (tabId !== "settings" && isMobileSettingsOpen) {
      closeMobileSettings();
    }

    switch (tabId) {
      case "all":
        selectAllArticles();
        break;
      case "starred":
        selectStarred();
        break;
      case "later":
        selectReadLater();
        break;
      case "stats":
        selectStats();
        break;
      case "settings":
        openMobileSettings();
        break;
    }
    onTabChange?.();
  };

  return (
    <div className="bg-sidebar-bg border-t border-border safe-area-bottom">
      <nav className="flex items-stretch h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-h-[48px]",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground active:bg-muted/50"
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={cn("transition-transform", isActive && "scale-110")}>
                <Icon size="md" />
              </span>
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
