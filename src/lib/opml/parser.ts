export interface OPMLOutline {
  text: string;
  title?: string;
  type?: string;
  xmlUrl?: string;
  htmlUrl?: string;
  children?: OPMLOutline[];
}

export function parseOPML(xmlString: string): OPMLOutline[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");

  // Check for parse errors
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Invalid OPML file");
  }

  const parseOutline = (element: Element): OPMLOutline => {
    const outline: OPMLOutline = {
      text: element.getAttribute("text") || element.getAttribute("title") || "",
      title: element.getAttribute("title") || undefined,
      type: element.getAttribute("type") || undefined,
      xmlUrl: element.getAttribute("xmlUrl") || undefined,
      htmlUrl: element.getAttribute("htmlUrl") || undefined,
    };

    const children = Array.from(element.children)
      .filter((child) => child.tagName.toLowerCase() === "outline")
      .map(parseOutline);

    if (children.length > 0) {
      outline.children = children;
    }

    return outline;
  };

  const body = doc.querySelector("body");
  if (!body) {
    throw new Error("Invalid OPML: missing body element");
  }

  return Array.from(body.children)
    .filter((child) => child.tagName.toLowerCase() === "outline")
    .map(parseOutline);
}

export interface FlattenedFeed {
  url: string;
  title: string;
  siteUrl?: string;
  folderName?: string;
}

export function flattenOPML(outlines: OPMLOutline[]): FlattenedFeed[] {
  const feeds: FlattenedFeed[] = [];

  const processOutline = (outline: OPMLOutline, folderName?: string) => {
    if (outline.xmlUrl) {
      // This is a feed
      feeds.push({
        url: outline.xmlUrl,
        title: outline.text || outline.title || "Untitled",
        siteUrl: outline.htmlUrl,
        folderName,
      });
    } else if (outline.children) {
      // This is a folder
      const folder = outline.text || outline.title;
      outline.children.forEach((child) => processOutline(child, folder));
    }
  };

  outlines.forEach((outline) => processOutline(outline));
  return feeds;
}
