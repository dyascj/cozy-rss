import DOMPurify from "dompurify";

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    return html;
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "b",
      "i",
      "em",
      "strong",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "figure",
      "figcaption",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "span",
      "div",
      "section",
      "article",
      // Media embeds
      "iframe",
      "video",
      "audio",
      "source",
      "picture",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "class",
      "id",
      "target",
      "rel",
      "width",
      "height",
      // Media attributes
      "srcset",
      "sizes",
      "loading",
      "type",
      "media",
      // iframe attributes
      "allow",
      "allowfullscreen",
      "frameborder",
      // video/audio attributes
      "controls",
      "autoplay",
      "muted",
      "loop",
      "poster",
      "preload",
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["style", "script"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
  });
}

export function stripHtml(html: string): string {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, "");
  }

  const div = document.createElement("div");
  div.innerHTML = DOMPurify.sanitize(html);
  return div.textContent || div.innerText || "";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
