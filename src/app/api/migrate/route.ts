import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import * as feedRepo from "@/lib/db/repositories/feedRepository";
import * as folderRepo from "@/lib/db/repositories/folderRepository";
import * as articleRepo from "@/lib/db/repositories/articleRepository";
import * as tagRepo from "@/lib/db/repositories/tagRepository";
import * as settingsRepo from "@/lib/db/repositories/settingsRepository";

interface LocalStorageData {
  feeds?: Record<string, {
    id: string;
    url: string;
    title: string;
    description?: string;
    imageUrl?: string;
    folderId?: string | null;
    order?: number;
  }>;
  folders?: Record<string, {
    id: string;
    name: string;
    parentId?: string | null;
    order?: number;
  }>;
  articles?: Record<string, {
    id: string;
    feedId: string;
    guid?: string;
    title: string;
    link?: string;
    content?: string;
    contentSnippet?: string;
    author?: string;
    publishedAt?: string;
    imageUrl?: string;
  }>;
  readArticles?: string[];
  starredArticles?: string[];
  readLaterArticles?: string[];
  tags?: Record<string, {
    id: string;
    name: string;
    color: string;
  }>;
  articleTags?: Record<string, string[]>;
  settings?: {
    theme?: "light" | "dark" | "system";
    fontSize?: "small" | "medium" | "large";
    showImages?: boolean;
    markReadOnScroll?: boolean;
    defaultView?: "all" | "unread";
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data: LocalStorageData = await request.json();
    const results = {
      folders: 0,
      feeds: 0,
      articles: 0,
      tags: 0,
      articleStates: 0,
      settings: false,
    };

    // Create a mapping from old IDs to new IDs
    const folderIdMap: Record<string, string> = {};
    const feedIdMap: Record<string, string> = {};
    const tagIdMap: Record<string, string> = {};
    const articleIdMap: Record<string, string> = {};

    // 1. Import folders (handle parent relationships)
    if (data.folders) {
      const folders = Object.values(data.folders);
      // First pass: create folders without parents
      const rootFolders = folders.filter((f) => !f.parentId);
      for (const folder of rootFolders) {
        const newFolder = await folderRepo.createFolder(user.id, {
          name: folder.name,
          parentFolderId: null,
        });
        if (newFolder) {
          folderIdMap[folder.id] = newFolder.id;
          results.folders++;
        }
      }

      // Second pass: create child folders
      const childFolders = folders.filter((f) => f.parentId);
      for (const folder of childFolders) {
        const parentId = folder.parentId ? folderIdMap[folder.parentId] : null;
        const newFolder = await folderRepo.createFolder(user.id, {
          name: folder.name,
          parentFolderId: parentId || null,
        });
        if (newFolder) {
          folderIdMap[folder.id] = newFolder.id;
          results.folders++;
        }
      }
    }

    // 2. Import feeds
    if (data.feeds) {
      for (const feed of Object.values(data.feeds)) {
        const folderId = feed.folderId ? folderIdMap[feed.folderId] : null;
        const newFeed = await feedRepo.createFeed(user.id, {
          url: feed.url,
          title: feed.title,
          description: feed.description,
          iconUrl: feed.imageUrl,
          folderId: folderId || null,
        });
        if (newFeed) {
          feedIdMap[feed.id] = newFeed.id;
          results.feeds++;
        }
      }
    }

    // 3. Import articles
    if (data.articles) {
      for (const article of Object.values(data.articles)) {
        const feedId = feedIdMap[article.feedId];
        if (!feedId) continue; // Skip if feed wasn't imported

        const newArticle = await articleRepo.createArticle({
          feedId,
          guid: article.guid || article.id,
          title: article.title,
          link: article.link || "",
          content: article.content,
          summary: article.contentSnippet,
          author: article.author,
          publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
          imageUrl: article.imageUrl,
        });
        if (newArticle) {
          articleIdMap[article.id] = newArticle.id;
          results.articles++;
        }
      }
    }

    // 4. Import article states (read, starred, read later)
    const readSet = new Set(data.readArticles || []);
    const starredSet = new Set(data.starredArticles || []);
    const readLaterSet = new Set(data.readLaterArticles || []);

    for (const [oldId, newId] of Object.entries(articleIdMap)) {
      const isRead = readSet.has(oldId);
      const isStarred = starredSet.has(oldId);
      const isReadLater = readLaterSet.has(oldId);

      if (isRead || isStarred || isReadLater) {
        await articleRepo.updateArticleState(newId, user.id, {
          isRead,
          isStarred,
          isReadLater,
        });
        results.articleStates++;
      }
    }

    // 5. Import tags
    if (data.tags) {
      for (const tag of Object.values(data.tags)) {
        const newTag = await tagRepo.createTag(user.id, {
          name: tag.name,
          color: tag.color,
        });
        if (newTag) {
          tagIdMap[tag.id] = newTag.id;
          results.tags++;
        }
      }
    }

    // 6. Import article-tag associations
    if (data.articleTags) {
      for (const [oldArticleId, oldTagIds] of Object.entries(data.articleTags)) {
        const newArticleId = articleIdMap[oldArticleId];
        if (!newArticleId) continue;

        const newTagIds = oldTagIds
          .map((oldTagId) => tagIdMap[oldTagId])
          .filter(Boolean);

        if (newTagIds.length > 0) {
          await tagRepo.setArticleTags(newArticleId, user.id, newTagIds);
        }
      }
    }

    // 7. Import settings
    if (data.settings) {
      await settingsRepo.updateUserSettings(user.id, data.settings);
      results.settings = true;
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error migrating data:", error);
    return NextResponse.json(
      { error: "Failed to migrate data" },
      { status: 500 }
    );
  }
}
