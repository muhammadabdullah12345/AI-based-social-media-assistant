import { generatePostFromDocument } from "@/src/ai/generatePostFromDocument";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { documentId, tone, platform, emojiStatus } = await req.json();

  if (!documentId) {
    return Response.json({ error: "documentId is required" }, { status: 400 });
  }

  try {
    const posts = await generatePostFromDocument(
      documentId,
      tone,
      platform,
      emojiStatus,
    );
    return Response.json({ posts });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
