import { NextRequest, NextResponse } from "next/server";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import { getCurrentUser } from "@/lib/auth/getUser";
import { validateUrlForSSRF } from "@/lib/security/ssrf";

export interface ExtractedArticle {
  title: string;
  content: string;
  excerpt: string | null;
  byline: string | null;
  siteName: string | null;
  length: number;
}

interface ExtractSuccessResponse {
  success: true;
  data: ExtractedArticle;
}

interface ExtractErrorResponse {
  success: false;
  error: string;
  code: "INVALID_URL" | "FETCH_FAILED" | "PARSE_FAILED" | "EXTRACTION_FAILED";
}

type ExtractResponse = ExtractSuccessResponse | ExtractErrorResponse;

export async function GET(
  request: NextRequest
): Promise<NextResponse<ExtractResponse>> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", code: "INVALID_URL" },
      { status: 401 }
    );
  }

  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { success: false, error: "URL parameter is required", code: "INVALID_URL" },
      { status: 400 }
    );
  }

  // Validate URL for SSRF
  const ssrfError = validateUrlForSSRF(url);
  if (ssrfError) {
    return NextResponse.json(
      { success: false, error: ssrfError, code: "INVALID_URL" },
      { status: 400 }
    );
  }

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid URL provided", code: "INVALID_URL" },
      { status: 400 }
    );
  }

  // Fetch the article HTML
  let html: string;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch article (${response.status})`,
          code: "FETCH_FAILED",
        },
        { status: 502 }
      );
    }

    html = await response.text();
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Request timed out"
        : "Failed to fetch article";
    return NextResponse.json(
      { success: false, error: message, code: "FETCH_FAILED" },
      { status: 502 }
    );
  }

  // Parse HTML with linkedom
  let document: Document;
  try {
    const { document: doc } = parseHTML(html);
    document = doc as unknown as Document;
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to parse HTML", code: "PARSE_FAILED" },
      { status: 500 }
    );
  }

  // Extract article content with Readability
  try {
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article || !article.content) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not extract article content",
          code: "EXTRACTION_FAILED",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          title: article.title || "",
          content: article.content,
          excerpt: article.excerpt || null,
          byline: article.byline || null,
          siteName: article.siteName || null,
          length: article.length || 0,
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to extract article content",
        code: "EXTRACTION_FAILED",
      },
      { status: 500 }
    );
  }
}
