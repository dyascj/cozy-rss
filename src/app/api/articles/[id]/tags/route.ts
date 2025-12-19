import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import * as tagRepo from "@/lib/db/repositories/tagRepository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const tags = tagRepo.getArticleTags(id, user.id);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching article tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch article tags" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { tagIds } = body;

    if (!Array.isArray(tagIds)) {
      return NextResponse.json(
        { error: "tagIds must be an array" },
        { status: 400 }
      );
    }

    tagRepo.setArticleTags(id, user.id, tagIds);
    const tags = tagRepo.getArticleTags(id, user.id);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error updating article tags:", error);
    return NextResponse.json(
      { error: "Failed to update article tags" },
      { status: 500 }
    );
  }
}
