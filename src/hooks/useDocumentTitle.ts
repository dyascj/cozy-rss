"use client";

import { useEffect } from "react";
import { useArticleStore } from "@/stores/articleStore";

const BASE_TITLE = "RSS Reader";

export function useDocumentTitle() {
  const { articles, articlesByFeed } = useArticleStore();

  useEffect(() => {
    // Calculate total unread count
    let totalUnread = 0;
    for (const feedId in articlesByFeed) {
      const articleIds = articlesByFeed[feedId] || [];
      totalUnread += articleIds.filter((id) => !articles[id]?.isRead).length;
    }

    // Update document title
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ${BASE_TITLE}`;
    } else {
      document.title = BASE_TITLE;
    }
  }, [articles, articlesByFeed]);
}
