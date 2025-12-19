"use client";

import { cn } from "@/utils/cn";

type IconCategory =
  | "arrows"
  | "interface"
  | "misc"
  | "objects"
  | "emojis";

interface DoodleIconProps {
  name: string;
  category?: IconCategory;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  strokeWidth?: number;
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

/**
 * DoodleIcon component for rendering hand-drawn style icons
 * Uses CSS mask to apply currentColor for proper theming
 */
export function DoodleIcon({
  name,
  category = "interface",
  size = "md",
  className,
}: DoodleIconProps) {
  const src = `/doodle-icons/SVG/${category}/${name}.svg`;

  return (
    <span
      className={cn(
        sizeClasses[size],
        "inline-flex items-center justify-center flex-shrink-0",
        className
      )}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        backgroundColor: "currentColor",
      }}
      aria-hidden="true"
    />
  );
}

// Icon name mapping for common Lucide icon replacements
export const ICON_MAP = {
  // Navigation & Arrows
  "arrow-left": { name: "arrow-left", category: "arrows" as IconCategory },
  "arrow-right": { name: "arrow-right", category: "arrows" as IconCategory },
  "arrow-up": { name: "arrow-up", category: "arrows" as IconCategory },
  "arrow-down": { name: "arrow-down", category: "arrows" as IconCategory },
  "chevron-left": { name: "chevrons-left", category: "arrows" as IconCategory },
  "chevron-right": { name: "chevrons-right", category: "arrows" as IconCategory },
  "chevron-up": { name: "chevrons-up", category: "arrows" as IconCategory },
  "chevron-down": { name: "chevrons-down", category: "arrows" as IconCategory },

  // Interface - Common
  "home": { name: "home", category: "interface" as IconCategory },
  "star": { name: "star", category: "interface" as IconCategory },
  "heart": { name: "heart", category: "interface" as IconCategory },
  "clock": { name: "clock", category: "interface" as IconCategory },
  "bookmark": { name: "bookmark", category: "interface" as IconCategory },
  "rss": { name: "rss", category: "interface" as IconCategory },
  "search": { name: "search", category: "interface" as IconCategory },
  "settings": { name: "setting", category: "interface" as IconCategory },
  "menu": { name: "menu", category: "interface" as IconCategory },
  "x": { name: "cross", category: "interface" as IconCategory },
  "close": { name: "cross", category: "interface" as IconCategory },
  "cross": { name: "cross", category: "interface" as IconCategory },
  "check": { name: "tick", category: "interface" as IconCategory },
  "tick": { name: "tick", category: "interface" as IconCategory },

  // Folder & Files
  "folder": { name: "folder", category: "interface" as IconCategory },
  "folder-plus": { name: "folder-add", category: "interface" as IconCategory },
  "folder-open": { name: "folder-empty", category: "interface" as IconCategory },
  "file": { name: "doc", category: "interface" as IconCategory },
  "file-plus": { name: "doc-add", category: "interface" as IconCategory },

  // Mail & Communication
  "mail": { name: "mail", category: "interface" as IconCategory },
  "mail-open": { name: "mail-open", category: "interface" as IconCategory },
  "send": { name: "send", category: "interface" as IconCategory },
  "message": { name: "message", category: "interface" as IconCategory },

  // Actions
  "plus": { name: "doc-add", category: "interface" as IconCategory },
  "minus": { name: "doc-remove", category: "interface" as IconCategory },
  "edit": { name: "pencil", category: "interface" as IconCategory },
  "pencil": { name: "pencil", category: "interface" as IconCategory },
  "trash": { name: "delete", category: "interface" as IconCategory },
  "delete": { name: "delete", category: "interface" as IconCategory },
  "copy": { name: "copy", category: "interface" as IconCategory },
  "refresh-cw": { name: "sync", category: "interface" as IconCategory },
  "sync": { name: "sync", category: "interface" as IconCategory },
  "download": { name: "download", category: "interface" as IconCategory },
  "upload": { name: "upload", category: "interface" as IconCategory },
  "external-link": { name: "arrow", category: "interface" as IconCategory },
  "link": { name: "link", category: "interface" as IconCategory },
  "unlink": { name: "unlink", category: "interface" as IconCategory },

  // View & Visibility
  "eye": { name: "unhide", category: "interface" as IconCategory },
  "eye-off": { name: "hide", category: "interface" as IconCategory },
  "grid": { name: "grid", category: "interface" as IconCategory },
  "list": { name: "list", category: "interface" as IconCategory },
  "filter": { name: "filter", category: "interface" as IconCategory },
  "maximize": { name: "maximize", category: "interface" as IconCategory },
  "minimize": { name: "minimize", category: "interface" as IconCategory },

  // Status & Alerts
  "bell": { name: "bell", category: "interface" as IconCategory },
  "info": { name: "Info", category: "interface" as IconCategory },
  "alert-circle": { name: "caution", category: "interface" as IconCategory },
  "alert-triangle": { name: "caution", category: "interface" as IconCategory },
  "check-circle": { name: "tick-2", category: "interface" as IconCategory },
  "question": { name: "question", category: "interface" as IconCategory },
  "help-circle": { name: "question-2", category: "interface" as IconCategory },

  // User
  "user": { name: "user", category: "interface" as IconCategory },
  "user-plus": { name: "user-add", category: "interface" as IconCategory },
  "users": { name: "user", category: "interface" as IconCategory },

  // Media & Content
  "play": { name: "play", category: "interface" as IconCategory },
  "pause": { name: "pause", category: "interface" as IconCategory },
  "volume": { name: "volume-up", category: "interface" as IconCategory },
  "volume-2": { name: "volume-up", category: "interface" as IconCategory },
  "mute": { name: "mute", category: "interface" as IconCategory },
  "image": { name: "photo", category: "interface" as IconCategory },
  "camera": { name: "camera", category: "interface" as IconCategory },
  "video": { name: "video-camera", category: "interface" as IconCategory },
  "mic": { name: "mic", category: "interface" as IconCategory },

  // Misc Interface
  "globe": { name: "globe", category: "interface" as IconCategory },
  "compass": { name: "navigation", category: "interface" as IconCategory },
  "map": { name: "map", category: "interface" as IconCategory },
  "pin": { name: "pin", category: "interface" as IconCategory },
  "flag": { name: "flag", category: "interface" as IconCategory },
  "tag": { name: "flag", category: "interface" as IconCategory },
  "layers": { name: "layer", category: "interface" as IconCategory },
  "sparkles": { name: "magic-wand", category: "interface" as IconCategory },
  "wand": { name: "magic-wand", category: "interface" as IconCategory },
  "zap": { name: "zap", category: "interface" as IconCategory },
  "sun": { name: "sun", category: "interface" as IconCategory },
  "moon": { name: "sun-2", category: "interface" as IconCategory },
  "monitor": { name: "tablet", category: "interface" as IconCategory },
  "key": { name: "key", category: "interface" as IconCategory },
  "lock": { name: "lock", category: "interface" as IconCategory },
  "unlock": { name: "lock", category: "interface" as IconCategory },
  "shield": { name: "shield", category: "interface" as IconCategory },
  "calendar": { name: "calendar", category: "interface" as IconCategory },
  "book": { name: "doc", category: "interface" as IconCategory },
  "book-open": { name: "doc", category: "interface" as IconCategory },
  "loader": { name: "sync", category: "interface" as IconCategory },
  "loader-2": { name: "sync", category: "interface" as IconCategory },
  "circle": { name: "record", category: "interface" as IconCategory },
  "more-horizontal": { name: "menu-2", category: "interface" as IconCategory },
  "more-vertical": { name: "menu-2", category: "interface" as IconCategory },

  // Misc category
  "rocket": { name: "rocket", category: "misc" as IconCategory },
  "fire": { name: "fire", category: "misc" as IconCategory },
  "coffee": { name: "coffee-cup-1", category: "misc" as IconCategory },
  "bot": { name: "bot", category: "misc" as IconCategory },
  "bug": { name: "bug", category: "misc" as IconCategory },
  "trophy": { name: "trophy", category: "misc" as IconCategory },

  // Categories for Discover page (using closest matches)
  "code": { name: "dashboard", category: "interface" as IconCategory },
  "film": { name: "video-camera", category: "interface" as IconCategory },
  "newspaper": { name: "doc", category: "interface" as IconCategory },
  "youtube": { name: "play", category: "interface" as IconCategory },
  "brain": { name: "bulb", category: "interface" as IconCategory },
  "palette": { name: "paint-bucket", category: "interface" as IconCategory },
  "gamepad": { name: "dashboard-2", category: "interface" as IconCategory },
  "podcast": { name: "headphone", category: "interface" as IconCategory },
  "pen-tool": { name: "pen-tool", category: "interface" as IconCategory },
  "inbox": { name: "drawer", category: "interface" as IconCategory },
  "trending-up": { name: "analytics", category: "interface" as IconCategory },
} as const;

// Helper function to get icon props from Lucide icon name
export function getIconProps(lucideIconName: string): { name: string; category: IconCategory } {
  const key = lucideIconName.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  return ICON_MAP[key as keyof typeof ICON_MAP] || { name: "question", category: "interface" };
}

// Pre-built icon components for common use cases
export function DoodleHome(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="home" category="interface" {...props} />;
}

export function DoodleStar(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="star" category="interface" {...props} />;
}

export function DoodleHeart(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="heart" category="interface" {...props} />;
}

export function DoodleClock(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="clock" category="interface" {...props} />;
}

export function DoodleBookmark(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="bookmark" category="interface" {...props} />;
}

export function DoodleRss(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="rss" category="interface" {...props} />;
}

export function DoodleSearch(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="search" category="interface" {...props} />;
}

export function DoodleSettings(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="setting" category="interface" {...props} />;
}

export function DoodleMenu(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="menu" category="interface" {...props} />;
}

export function DoodleX(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="cross" category="interface" {...props} />;
}

export function DoodleCheck(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="tick" category="interface" {...props} />;
}

export function DoodleFolder(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="folder" category="interface" {...props} />;
}

export function DoodleFolderPlus(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="folder-add" category="interface" {...props} />;
}

export function DoodleMail(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="mail" category="interface" {...props} />;
}

export function DoodleMailOpen(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="mail-open" category="interface" {...props} />;
}

export function DoodleTrash(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="delete" category="interface" {...props} />;
}

export function DoodleRefresh(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="sync" category="interface" {...props} />;
}

export function DoodleExternalLink(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="arrow" category="interface" {...props} />;
}

export function DoodlePlus(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="doc-add" category="interface" {...props} />;
}

export function DoodleArrowLeft(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="arrow-left" category="arrows" {...props} />;
}

export function DoodleArrowRight(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="arrow-right" category="arrows" {...props} />;
}

export function DoodleChevronLeft(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="chevrons-left" category="arrows" {...props} />;
}

export function DoodleChevronRight(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="chevrons-right" category="arrows" {...props} />;
}

export function DoodleChevronDown(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="chevrons-down" category="arrows" {...props} />;
}

export function DoodleChevronUp(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="chevrons-up" category="arrows" {...props} />;
}

export function DoodlePlay(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="play" category="interface" {...props} />;
}

export function DoodleGlobe(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="globe" category="interface" {...props} />;
}

export function DoodleCompass(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="navigation" category="interface" {...props} />;
}

export function DoodleSparkles(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="magic-wand" category="interface" {...props} />;
}

export function DoodleBell(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="bell" category="interface" {...props} />;
}

export function DoodleUser(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="user" category="interface" {...props} />;
}

export function DoodleFilter(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="filter" category="interface" {...props} />;
}

export function DoodleList(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="list" category="interface" {...props} />;
}

export function DoodleGrid(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="grid" category="interface" {...props} />;
}

export function DoodleLoader(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="sync" category="interface" className={cn("animate-spin", props.className)} {...props} />;
}

export function DoodleInfo(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="Info" category="interface" {...props} />;
}

export function DoodleWarning(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="caution" category="interface" {...props} />;
}

export function DoodleSun(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="sun" category="interface" {...props} />;
}

export function DoodleMoon(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="sun-2" category="interface" {...props} />;
}

export function DoodleMonitor(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="tablet" category="interface" {...props} />;
}

export function DoodleDownload(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="download" category="interface" {...props} />;
}

export function DoodleUpload(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="upload" category="interface" {...props} />;
}

export function DoodleBookOpen(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="doc" category="interface" {...props} />;
}

export function DoodleInbox(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="drawer" category="interface" {...props} />;
}

// Category icons for Discover page
export function DoodleCode(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="dashboard" category="interface" {...props} />;
}

export function DoodleFilm(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="video-camera" category="interface" {...props} />;
}

export function DoodleNewspaper(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="doc" category="interface" {...props} />;
}

export function DoodleYoutube(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="play" category="interface" {...props} />;
}

export function DoodleBrain(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="bulb" category="interface" {...props} />;
}

export function DoodlePalette(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="paint-bucket" category="interface" {...props} />;
}

export function DoodleGamepad(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="dashboard-2" category="interface" {...props} />;
}

export function DoodlePodcast(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="headphone" category="interface" {...props} />;
}

export function DoodlePenTool(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="pen-tool" category="interface" {...props} />;
}

export function DoodleCircle(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="record" category="interface" {...props} />;
}

export function DoodleTrendingUp(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="analytics" category="interface" {...props} />;
}

export function DoodleMoreHorizontal(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="menu-2" category="interface" {...props} />;
}

export function DoodleLink(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="link" category="interface" {...props} />;
}

export function DoodleClose(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="cross" category="interface" {...props} />;
}

export function DoodlePencil(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="pencil" category="interface" {...props} />;
}

export function DoodleFolderOpen(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="folder-empty" category="interface" {...props} />;
}

export function DoodleFolderInput(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="folder-add" category="interface" {...props} />;
}

// Additional icons for IconPicker
export function DoodleFolderHeart(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="heart" category="interface" {...props} />;
}

export function DoodleBriefcase(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="suitcase" category="interface" {...props} />;
}

export function DoodleMusic(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="music" category="interface" {...props} />;
}

export function DoodleCamera(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="camera" category="interface" {...props} />;
}

export function DoodleShoppingBag(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="gift" category="interface" {...props} />;
}

export function DoodleCoffee(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="coffee-cup-1" category="misc" {...props} />;
}

export function DoodleLightbulb(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="bulb" category="interface" {...props} />;
}

export function DoodleZap(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="zap" category="interface" {...props} />;
}

// Additional icons for SwipeableArticleItem
export function DoodleCheckCircle(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="tick-2" category="interface" {...props} />;
}

export function DoodleXCircle(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="cross" category="interface" {...props} />;
}

// Additional icons for Tags
export function DoodleTag(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="flag" category="interface" {...props} />;
}

// Additional icon for ArticleThumbnail
export function DoodleImageOff(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="photo" category="interface" {...props} />;
}

// Alert/Error icons
export function DoodleAlertCircle(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="caution" category="interface" {...props} />;
}

export function DoodleAlertTriangle(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="caution" category="interface" {...props} />;
}

export function DoodleFire(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="fire" category="misc" {...props} />;
}

export function DoodleTrophy(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="trophy" category="misc" {...props} />;
}

export function DoodleTarget(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="target" category="interface" {...props} />;
}

// Layout icons
export function DoodleLayoutList(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="checklist" category="interface" {...props} />;
}

export function DoodleAlignJustify(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="center-align" category="interface" {...props} />;
}

export function DoodleUsers(props: Omit<DoodleIconProps, "name" | "category">) {
  return <DoodleIcon name="user" category="interface" {...props} />;
}
