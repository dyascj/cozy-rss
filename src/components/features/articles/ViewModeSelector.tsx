"use client";

import { useUIStore, ArticleListLayout } from "@/stores/uiStore";
import { cn } from "@/utils/cn";
import { DoodleList, DoodleGrid, DoodleLayoutList, DoodleAlignJustify } from "@/components/ui/DoodleIcon";
import * as Tooltip from "@radix-ui/react-tooltip";

const viewModes: { value: ArticleListLayout; icon: React.ComponentType<{ size?: "xs" | "sm" | "md" | "lg" | "xl" }>; label: string }[] = [
  { value: "list", icon: DoodleList, label: "List view" },
  { value: "card", icon: DoodleGrid, label: "Card view" },
  { value: "magazine", icon: DoodleLayoutList, label: "Magazine view" },
  { value: "title-only", icon: DoodleAlignJustify, label: "Title only" },
];

export function ViewModeSelector() {
  const { articleListLayout, setArticleListLayout } = useUIStore();

  return (
    <Tooltip.Provider delayDuration={300}>
      <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
        {viewModes.map(({ value, icon: Icon, label }) => (
          <Tooltip.Root key={value}>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => setArticleListLayout(value)}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  articleListLayout === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={label}
              >
                <Icon size="xs" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-foreground text-background px-2 py-1 rounded text-xs"
                sideOffset={5}
              >
                {label}
                <Tooltip.Arrow className="fill-foreground" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ))}
      </div>
    </Tooltip.Provider>
  );
}
