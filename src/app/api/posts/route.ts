import { getServerSession } from "next-auth";
import { prisma } from "@/src/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, image } = await req.json();

  const post = await prisma.post.create({
    data: {
      title,
      content,
      image,
      userId: session.user?.id,
    },
  });

  return Response.json(post);
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) return Response.json([]);

  const posts = await prisma.post.findMany({
    where: {
      userId: session.user?.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(posts);
}
