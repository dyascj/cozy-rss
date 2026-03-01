import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import * as feedRepo from "@/lib/db/repositories/feedRepository";
import * as folderRepo from "@/lib/db/repositories/folderRepository";
import { fetchAndStoreArticles } from "@/lib/feed-fetcher";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feeds = await feedRepo.getFeedsByUser(user.id);
    const folders = await folderRepo.getFoldersByUser(user.id);

    // Transform to match existing store format
    const feedsMap: Record<string, (typeof feeds)[0]> = {};
    const foldersMap: Record<string, (typeof folders)[0]> = {};
    const feedOrder: Record<string, string[]> = { root: [] };
    const folderOrder: string[] = [];

    // Build folder order (root level only)
    folders
      .filter((f) => !f.parentFolderId)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .forEach((folder) => {
        folderOrder.push(folder.id);
        foldersMap[folder.id] = folder;
        feedOrder[folder.id] = [];
      });

    // Add nested folders
    folders
      .filter((f) => f.parentFolderId)
      .forEach((folder) => {
        foldersMap[folder.id] = folder;
        feedOrder[folder.id] = [];
      });

    // Build feed order
    feeds.forEach((feed) => {
      feedsMap[feed.id] = feed;
      const folderId = feed.folderId || "root";
      if (!feedOrder[folderId]) {
        feedOrder[folderId] = [];
      }
      feedOrder[folderId].push(feed.id);
    });

    // Sort feeds within each folder
    Object.keys(feedOrder).forEach((folderId) => {
      feedOrder[folderId].sort((a, b) => {
        const feedA = feedsMap[a];
        const feedB = feedsMap[b];
        return (feedA?.orderIndex || 0) - (feedB?.orderIndex || 0);
      });
    });

    return NextResponse.json({
      feeds: feedsMap,
      folders: foldersMap,
      feedOrder,
      folderOrder,
    });
  } catch (error) {
    console.error("Error fetching feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, title, description, siteUrl, iconUrl, folderId, fetchInterval } = body;

    if (!url || !title) {
      return NextResponse.json(
        { error: "URL and title are required" },
        { status: 400 }
      );
    }

    // Check if feed already exists
    const existing = await feedRepo.getFeedByUrl(url, user.id);
    if (existing) {
      return NextResponse.json(
        { error: "Feed already exists", feed: existing },
        { status: 409 }
      );
    }

    const feed = await feedRepo.createFeed(user.id, {
      url,
      title,
      description,
      siteUrl,
      iconUrl,
      folderId,
      fetchInterval,
    });

    // Fetch and store articles server-side
    let articlesCreated = 0;
    try {
      articlesCreated = await fetchAndStoreArticles(feed.id, url);
    } catch (err) {
      console.error("Failed to fetch articles for new feed:", err);
    }

    return NextResponse.json({ feed, articlesCreated });
  } catch (error) {
    console.error("Error creating feed:", error);
    return NextResponse.json(
      { error: "Failed to create feed" },
      { status: 500 }
    );
  }
}
