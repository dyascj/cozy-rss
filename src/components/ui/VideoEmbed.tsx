"use client";

import { useState } from "react";
import { VideoEmbed as VideoEmbedType, buildEmbedUrl } from "@/utils/video";
import { DoodlePlay } from "@/components/ui/DoodleIcon";
import { cn } from "@/utils/cn";

interface VideoEmbedProps {
  video: VideoEmbedType;
  className?: string;
}

export function VideoEmbed({ video, className }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const embedUrl = buildEmbedUrl(video);

  return (
    <div className={cn("relative aspect-video rounded-lg overflow-hidden bg-muted", className)}>
      {isPlaying ? (
        <iframe
          src={`${embedUrl}?autoplay=1`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={`${video.type} video`}
        />
      ) : (
        <button
          onClick={() => setIsPlaying(true)}
          className="absolute inset-0 w-full h-full group"
        >
          {/* Thumbnail */}
          <img
            src={video.thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a gradient background if thumbnail fails
              e.currentTarget.style.display = "none";
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg transition-all group-hover:scale-110">
              <span className="text-gray-900 ml-1">
                <DoodlePlay size="xl" />
              </span>
            </div>
          </div>

          {/* Video type badge */}
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 rounded text-xs text-white font-medium capitalize">
            {video.type}
          </div>
        </button>
      )}
    </div>
  );
}
