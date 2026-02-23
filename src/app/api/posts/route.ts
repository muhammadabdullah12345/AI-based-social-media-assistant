import { getServerSession } from "next-auth";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "@/src/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, image, platform, sourceType, documentId } =
    await req.json();

  const post = await prisma.post.create({
    data: {
      title,
      content,
      image,
      platform,
      sourceType,
      documentId,
      userId: session.user.id,
    },
  });

  return Response.json(post);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json([]);

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");

  const posts = await prisma.post.findMany({
    where: {
      userId: session.user?.id,
      ...(platform && { platform }),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(posts);
}
