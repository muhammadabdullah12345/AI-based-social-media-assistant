// src/app/api/generate-post-with-category/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { generatePostWithCategory } from "@/src/ai/generatePostWithCategory";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topic, targetAudience, tone, platform, emojiStatus, categoryId } =
    await req.json();

  if (!categoryId) {
    return NextResponse.json(
      { error: "categoryId is required" },
      { status: 400 },
    );
  }

  try {
    const posts = await generatePostWithCategory({
      topic,
      targetAudience,
      tone,
      platform,
      emojiStatus,
      categoryId,
    });
    return NextResponse.json({ posts });
  } catch (err: any) {
    console.error("[generate-post-with-category]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
