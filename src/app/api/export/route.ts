import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import * as feedRepo from "@/lib/db/repositories/feedRepository";
import * as folderRepo from "@/lib/db/repositories/folderRepository";
import * as articleRepo from "@/lib/db/repositories/articleRepository";
import * as tagRepo from "@/lib/db/repositories/tagRepository";
import * as settingsRepo from "@/lib/db/repositories/settingsRepository";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Gather all user data
    const folders = folderRepo.getFoldersByUser(user.id);
    const feeds = feedRepo.getFeedsByUser(user.id);
    const articles = articleRepo.getArticlesByUser(user.id, {});
    const tags = tagRepo.getTagsByUser(user.id);
    const articleTags = tagRepo.getArticleTagsMap(user.id);
    const settings = settingsRepo.getUserSettings(user.id);

    // Get article states
    const articleStates: Record<string, { isRead: boolean; isStarred: boolean; isReadLater: boolean }> = {};
    for (const article of articles) {
      if (article.isRead || article.isStarred || article.isReadLater) {
        articleStates[article.id] = {
          isRead: article.isRead || false,
          isStarred: article.isStarred || false,
          isReadLater: article.isReadLater || false,
        };
      }
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        username: user.username,
      },
      folders,
      feeds,
      articles: articles.map((a) => ({
        id: a.id,
        feedId: a.feedId,
        guid: a.guid,
        title: a.title,
        link: a.link,
        content: a.content,
        summary: a.summary,
        author: a.author,
        publishedAt: a.publishedAt,
        imageUrl: a.imageUrl,
      })),
      articleStates,
      tags,
      articleTags,
      settings,
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="rss-reader-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

// OPML export endpoint
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folders = folderRepo.getFoldersByUser(user.id);
    const feeds = feedRepo.getFeedsByUser(user.id);

    // Build OPML structure
    const folderMap = new Map(folders.map((f) => [f.id, f]));
    const feedsByFolder = new Map<string | null, typeof feeds>();

    for (const feed of feeds) {
      const folderId = feed.folderId || null;
      if (!feedsByFolder.has(folderId)) {
        feedsByFolder.set(folderId, []);
      }
      feedsByFolder.get(folderId)!.push(feed);
    }

    const buildOutline = (feed: (typeof feeds)[0]) => {
      return `      <outline type="rss" text="${escapeXml(feed.title)}" title="${escapeXml(feed.title)}" xmlUrl="${escapeXml(feed.url)}"${feed.description ? ` description="${escapeXml(feed.description)}"` : ""} />`;
    };

    const buildFolderOutline = (folderId: string, indent: string): string => {
      const folder = folderMap.get(folderId);
      if (!folder) return "";

      const folderFeeds = feedsByFolder.get(folderId) || [];
      const childFolders = folders.filter((f) => f.parentFolderId === folderId);

      let content = `${indent}<outline text="${escapeXml(folder.name)}" title="${escapeXml(folder.name)}">\n`;
      for (const feed of folderFeeds) {
        content += `${indent}  ${buildOutline(feed)}\n`;
      }
      for (const child of childFolders) {
        content += buildFolderOutline(child.id, indent + "  ");
      }
      content += `${indent}</outline>\n`;
      return content;
    };

    // Build OPML content
    let opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>CozyRSS Export</title>
    <dateCreated>${new Date().toUTCString()}</dateCreated>
    <ownerName>${escapeXml(user.username)}</ownerName>
  </head>
  <body>
`;

    // Root level feeds (no folder)
    const rootFeeds = feedsByFolder.get(null) || [];
    for (const feed of rootFeeds) {
      opmlContent += `    ${buildOutline(feed)}\n`;
    }

    // Root level folders
    const rootFolders = folders.filter((f) => !f.parentFolderId);
    for (const folder of rootFolders) {
      opmlContent += buildFolderOutline(folder.id, "    ");
    }

    opmlContent += `  </body>
</opml>`;

    return new NextResponse(opmlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="rss-reader-export-${new Date().toISOString().split("T")[0]}.opml"`,
      },
    });
  } catch (error) {
    console.error("Error exporting OPML:", error);
    return NextResponse.json(
      { error: "Failed to export OPML" },
      { status: 500 }
    );
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
