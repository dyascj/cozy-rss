"use client";

import { useCallback, useRef, useState } from "react";

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number; // ms to trigger long press
  cancelOnMove?: boolean;
}

export function useLongPress({
  onLongPress,
  onClick,
  threshold = 500,
  cancelOnMove = true,
}: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      isLongPress.current = false;

      // Store initial position for move detection
      if ("touches" in event) {
        startPos.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }

      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        onLongPress();
        // Prevent context menu on mobile
        if ("vibrate" in navigator) {
          navigator.vibrate(50);
        }
      }, threshold);
    },
    [onLongPress, threshold]
  );

  const clear = useCallback(
    (event: React.TouchEvent | React.MouseEvent, triggerClick = true) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Only trigger click if it wasn't a long press and we should trigger click
      if (triggerClick && !isLongPress.current && onClick) {
        onClick();
      }

      // Prevent default if it was a long press
      if (isLongPress.current) {
        event.preventDefault();
      }
    },
    [onClick]
  );

  const move = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (!cancelOnMove) return;

      // Check if moved too far (10px threshold)
      if ("touches" in event) {
        const touch = event.touches[0];
        const deltaX = Math.abs(touch.clientX - startPos.current.x);
        const deltaY = Math.abs(touch.clientY - startPos.current.y);

        if (deltaX > 10 || deltaY > 10) {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      }
    },
    [cancelOnMove]
  );

  return {
    onTouchStart: start,
    onTouchEnd: (e: React.TouchEvent) => clear(e, true),
    onTouchMove: move,
    onTouchCancel: (e: React.TouchEvent) => clear(e, false),
    onMouseDown: start,
    onMouseUp: (e: React.MouseEvent) => clear(e, true),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onContextMenu: (e: React.MouseEvent) => {
      if (isLongPress.current) {
        e.preventDefault();
      }
    },
  };
}
