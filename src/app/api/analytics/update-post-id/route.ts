// src/app/api/analytics/update-post-id/route.ts
// Manually update a post's platformPostId

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId, platformPostId } = await req.json();

  await prisma.post.updateMany({
    where: { id: postId, userId: session.user.id },
    data: { platformPostId },
  });

  return NextResponse.json({ success: true });
}
