import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import * as tagRepo from "@/lib/db/repositories/tagRepository";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tags = tagRepo.getTagsByUser(user.id);
    const articleTags = tagRepo.getArticleTagsMap(user.id);

    // Transform to match existing store format
    const tagsMap: Record<string, typeof tags[0]> = {};
    tags.forEach((tag) => {
      tagsMap[tag.id] = tag;
    });

    return NextResponse.json({
      tags: tagsMap,
      articleTags,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
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
    const { name, color } = body;

    if (!name || !color) {
      return NextResponse.json(
        { error: "Name and color are required" },
        { status: 400 }
      );
    }

    // Check if tag already exists
    const existing = tagRepo.getTagByName(name, user.id);
    if (existing) {
      return NextResponse.json(
        { error: "Tag already exists", tag: existing },
        { status: 409 }
      );
    }

    const tag = tagRepo.createTag(user.id, { name, color });

    return NextResponse.json({ tag });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
