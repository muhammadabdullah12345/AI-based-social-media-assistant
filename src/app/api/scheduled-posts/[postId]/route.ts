// src/app/api/scheduled-posts/[postId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;

  // Delete the scheduled entry
  await prisma.scheduledPost.deleteMany({
    where: { postId, userId: session.user.id },
  });

  // Reset post status to draft
  await prisma.post.updateMany({
    where: { id: postId, userId: session.user.id },
    data: { status: "draft", scheduledAt: null },
  });

  return NextResponse.json({ success: true });
}
