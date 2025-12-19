"use client";

import { useRef, useCallback, useState } from "react";

export interface SwipeState {
  isSwiping: boolean;
  direction: "left" | "right" | null;
  progress: number; // 0 to 1
}

interface SwipeOptions {
  threshold?: number; // minimum distance to trigger swipe (px)
  maxSwipe?: number; // maximum swipe distance (px)
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
}

export function useSwipeGesture(options: SwipeOptions = {}) {
  const {
    threshold = 80,
    maxSwipe = 120,
    onSwipeLeft,
    onSwipeRight,
    enabled = true,
  } = options;

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const currentX = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    progress: 0,
  });

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      currentX.current = 0;
      isHorizontalSwipe.current = null;
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;

      // Determine if this is a horizontal or vertical swipe
      if (isHorizontalSwipe.current === null) {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
        }
      }

      // Only process horizontal swipes
      if (!isHorizontalSwipe.current) return;

      // Prevent vertical scrolling while swiping
      e.preventDefault();

      // Clamp the swipe distance
      const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
      currentX.current = clampedDelta;

      const direction = clampedDelta > 0 ? "right" : clampedDelta < 0 ? "left" : null;
      const progress = Math.abs(clampedDelta) / maxSwipe;

      setSwipeState({
        isSwiping: true,
        direction,
        progress,
      });
    },
    [enabled, maxSwipe]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled) return;

    const delta = currentX.current;

    // Check if swipe exceeded threshold
    if (Math.abs(delta) >= threshold) {
      if (delta > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (delta < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset state
    setSwipeState({
      isSwiping: false,
      direction: null,
      progress: 0,
    });
    currentX.current = 0;
    isHorizontalSwipe.current = null;
  }, [enabled, threshold, onSwipeLeft, onSwipeRight]);

  const getSwipeStyle = useCallback(() => {
    if (!swipeState.isSwiping) return {};

    const translateX = currentX.current;
    return {
      transform: `translateX(${translateX}px)`,
      transition: "none",
    };
  }, [swipeState.isSwiping]);

  return {
    swipeState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    getSwipeStyle,
  };
}
