import { generatePost } from "@/src/ai/generate-post";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const post = await generatePost(
    body.topic,
    body.targetAudience,
    body.tone,
    body.platform,
    body.emojiStatus
  );

  return NextResponse.json(post);
}
