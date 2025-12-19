import { Feed, Folder } from "@/stores/feedStore";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateOPML(
  feeds: Record<string, Feed>,
  folders: Record<string, Folder>,
  feedOrder: Record<string, string[]>
): string {
  const now = new Date().toUTCString();

  const generateFeedOutline = (feed: Feed): string => {
    const attrs = [
      `type="rss"`,
      `text="${escapeXml(feed.title)}"`,
      `title="${escapeXml(feed.title)}"`,
      `xmlUrl="${escapeXml(feed.url)}"`,
    ];

    if (feed.siteUrl) {
      attrs.push(`htmlUrl="${escapeXml(feed.siteUrl)}"`);
    }

    return `      <outline ${attrs.join(" ")}/>`;
  };

  const generateFolderOutline = (folderId: string): string => {
    const folder = folders[folderId];
    if (!folder) return "";

    const folderFeeds = (feedOrder[folderId] || [])
      .map((feedId) => feeds[feedId])
      .filter(Boolean);

    if (folderFeeds.length === 0) return "";

    return `    <outline text="${escapeXml(folder.name)}" title="${escapeXml(folder.name)}">
${folderFeeds.map(generateFeedOutline).join("\n")}
    </outline>`;
  };

  const folderOutlines = Object.keys(folders)
    .map(generateFolderOutline)
    .filter(Boolean)
    .join("\n");

  const rootFeeds = (feedOrder.root || [])
    .map((feedId) => feeds[feedId])
    .filter(Boolean)
    .map((feed) => `    ${generateFeedOutline(feed).trim()}`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>CozyRSS Export</title>
    <dateCreated>${now}</dateCreated>
  </head>
  <body>
${folderOutlines}
${rootFeeds}
  </body>
</opml>`;
}

export function downloadOPML(
  feeds: Record<string, Feed>,
  folders: Record<string, Folder>,
  feedOrder: Record<string, string[]>
) {
  const opml = generateOPML(feeds, folders, feedOrder);
  const blob = new Blob([opml], { type: "text/xml" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `rss-reader-export-${new Date().toISOString().split("T")[0]}.opml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
