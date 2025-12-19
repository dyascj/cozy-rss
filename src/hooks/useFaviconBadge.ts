"use client";

import { useEffect, useRef } from "react";
import { useArticleStore } from "@/stores/articleStore";

const BADGE_SIZE = 9;
const BADGE_FONT_SIZE = 8;
const ICON_SIZE = 32;

export function useFaviconBadge() {
  const { articles, articlesByFeed } = useArticleStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalFaviconRef = useRef<string | null>(null);

  useEffect(() => {
    // Calculate total unread count
    let totalUnread = 0;
    for (const feedId in articlesByFeed) {
      const articleIds = articlesByFeed[feedId] || [];
      totalUnread += articleIds.filter((id) => !articles[id]?.isRead).length;
    }

    // Get or create canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = ICON_SIZE;
      canvasRef.current.height = ICON_SIZE;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get the favicon link element
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    // Store original favicon on first run
    if (originalFaviconRef.current === null) {
      originalFaviconRef.current = link.href || "/favicon.ico";
    }

    // Clear canvas
    ctx.clearRect(0, 0, ICON_SIZE, ICON_SIZE);

    // Load and draw original favicon
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, ICON_SIZE, ICON_SIZE);

      // Draw badge if there are unread articles
      if (totalUnread > 0) {
        const badgeText = totalUnread > 99 ? "99+" : totalUnread.toString();
        const badgeWidth = Math.max(BADGE_SIZE, ctx.measureText(badgeText).width + 4);

        // Position badge in top-right corner
        const badgeX = ICON_SIZE - badgeWidth;
        const badgeY = 0;

        // Draw badge background (red circle/pill)
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        if (badgeText.length === 1) {
          // Circle for single digit
          ctx.arc(
            ICON_SIZE - BADGE_SIZE / 2,
            BADGE_SIZE / 2,
            BADGE_SIZE / 2,
            0,
            2 * Math.PI
          );
        } else {
          // Rounded rectangle for multiple digits
          const radius = BADGE_SIZE / 2;
          ctx.roundRect(badgeX, badgeY, badgeWidth, BADGE_SIZE, radius);
        }
        ctx.fill();

        // Draw badge text
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${BADGE_FONT_SIZE}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          badgeText,
          badgeText.length === 1 ? ICON_SIZE - BADGE_SIZE / 2 : badgeX + badgeWidth / 2,
          BADGE_SIZE / 2
        );
      }

      // Update favicon
      link!.href = canvas.toDataURL("image/png");
    };

    img.onerror = () => {
      // If original favicon fails to load, draw a simple RSS icon
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(0, 0, ICON_SIZE, ICON_SIZE);

      // Draw RSS symbol
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(6, ICON_SIZE - 6, 4, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(4, ICON_SIZE - 4, 12, -Math.PI / 2, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(4, ICON_SIZE - 4, 20, -Math.PI / 2, 0);
      ctx.stroke();

      // Draw badge if there are unread articles
      if (totalUnread > 0) {
        const badgeText = totalUnread > 99 ? "99+" : totalUnread.toString();

        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(ICON_SIZE - BADGE_SIZE / 2, BADGE_SIZE / 2, BADGE_SIZE / 2 + 1, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${BADGE_FONT_SIZE}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, ICON_SIZE - BADGE_SIZE / 2, BADGE_SIZE / 2);
      }

      link!.href = canvas.toDataURL("image/png");
    };

    img.src = originalFaviconRef.current;
  }, [articles, articlesByFeed]);
}
