import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "@/src/lib/authOptions";

type RouteContext = {
  params: {
    id: string;
  };
};

// ================= GET =================
export async function GET(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const post = await prisma.post.findFirst({
    where: {
      id: context.params.id,
      userId: session.user.id,
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

// ================= PUT =================
export async function PUT(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, image } = await req.json();

  const updated = await prisma.post.updateMany({
    where: {
      id: context.params.id,
      userId: session.user.id,
    },
    data: {
      title,
      content,
      image,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// ================= DELETE =================
export async function DELETE(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await prisma.post.deleteMany({
    where: {
      id: context.params.id,
      userId: session.user.id,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
