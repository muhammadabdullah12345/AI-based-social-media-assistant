// src/app/api/scheduled-posts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scheduled = await prisma.scheduledPost.findMany({
    where: { userId: session.user.id },
    orderBy: { scheduledAt: "asc" },
  });

  // Fetch post details for each scheduled item
  const withPosts = await Promise.all(
    scheduled.map(async (s) => {
      const post = await prisma.post.findUnique({
        where: { id: s.postId },
        select: { title: true, content: true, image: true },
      });
      return { ...s, post };
    }),
  );

  return NextResponse.json(withPosts);
}
