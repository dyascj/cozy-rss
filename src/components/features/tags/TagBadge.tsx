"use client";

import { Tag, TAG_COLORS } from "@/stores/tagStore";
import { cn } from "@/utils/cn";
import { DoodleX } from "@/components/ui/DoodleIcon";

interface TagBadgeProps {
  tag: Tag;
  size?: "sm" | "md";
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export function TagBadge({ tag, size = "sm", onRemove, onClick, className }: TagBadgeProps) {
  const colorConfig = TAG_COLORS.find((c) => c.name === tag.color) || TAG_COLORS[0];

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
  };

  const Component = onClick ? "button" : "span";

  return (
    <Component
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        colorConfig.bgLight,
        colorConfig.text,
        sizeClasses[size],
        onClick && "hover:opacity-80 transition-opacity cursor-pointer",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", colorConfig.bg)} />
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70 transition-opacity"
        >
          <DoodleX size="xs" />
        </button>
      )}
    </Component>
  );
}
