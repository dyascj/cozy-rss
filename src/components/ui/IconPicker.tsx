"use client";

import { cn } from "@/utils/cn";
import {
  DoodleFolder,
  DoodleFolderHeart,
  DoodleBriefcase,
  DoodleCode,
  DoodleGamepad,
  DoodleNewspaper,
  DoodleBookOpen,
  DoodleMusic,
  DoodleFilm,
  DoodleCamera,
  DoodleShoppingBag,
  DoodleHeart,
  DoodleStar,
  DoodleBookmark,
  DoodleCoffee,
  DoodleHome,
  DoodleGlobe,
  DoodleLightbulb,
  DoodleZap,
  DoodleSparkles,
} from "@/components/ui/DoodleIcon";

type DoodleIconComponent = React.ComponentType<{ size?: "xs" | "sm" | "md" | "lg" | "xl" }>;

export const FOLDER_ICONS: Record<string, DoodleIconComponent> = {
  Folder: DoodleFolder,
  FolderHeart: DoodleFolderHeart,
  Briefcase: DoodleBriefcase,
  Code: DoodleCode,
  Gamepad2: DoodleGamepad,
  Newspaper: DoodleNewspaper,
  BookOpen: DoodleBookOpen,
  Music: DoodleMusic,
  Film: DoodleFilm,
  Camera: DoodleCamera,
  ShoppingBag: DoodleShoppingBag,
  Heart: DoodleHeart,
  Star: DoodleStar,
  Bookmark: DoodleBookmark,
  Coffee: DoodleCoffee,
  Home: DoodleHome,
  Globe: DoodleGlobe,
  Lightbulb: DoodleLightbulb,
  Zap: DoodleZap,
  Sparkles: DoodleSparkles,
};

interface IconPickerProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
}

export function IconPicker({ selectedIcon, onSelect }: IconPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Object.entries(FOLDER_ICONS).map(([name, Icon]) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect(name)}
          className={cn(
            "p-2.5 rounded-lg border transition-all flex items-center justify-center",
            selectedIcon === name
              ? "border-accent bg-accent/10 text-accent"
              : "border-border hover:border-muted-foreground/50 hover:bg-muted"
          )}
          title={name}
        >
          <Icon size="md" />
        </button>
      ))}
    </div>
  );
}

export function getFolderIcon(iconName?: string): DoodleIconComponent {
  if (!iconName || !FOLDER_ICONS[iconName]) {
    return DoodleFolder;
  }
  return FOLDER_ICONS[iconName];
}
