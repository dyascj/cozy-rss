"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";

interface ArticleThumbnailProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  aspectRatio?: "square" | "video" | "wide";
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-full h-40",
};

// Width-only classes for when aspectRatio is used
const sizeWidthClasses = {
  sm: "w-16",
  md: "w-24",
  lg: "w-full",
};

const aspectClasses = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[2/1]",
};

export function ArticleThumbnail({
  src,
  alt,
  size = "md",
  aspectRatio,
  className,
}: ArticleThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  // Don't render anything if there's no image source
  if (!src) {
    return null;
  }

  // If image failed to load, don't show anything
  if (hasError) {
    return null;
  }

  const sizeClass = aspectRatio ? sizeWidthClasses[size] : sizeClasses[size];
  const aspectClass = aspectRatio ? aspectClasses[aspectRatio] : "";

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden rounded-md flex-shrink-0 bg-muted",
        sizeClass,
        aspectClass,
        className
      )}
    >
      {isVisible ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={src}
            alt={alt}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
    </div>
  );
}
