import { extractText } from "@/src/rag/extractText";
import { chunkText } from "@/src/rag/chunkText";
import { embedChunks } from "@/src/rag/embedChunks";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt")) {
      return Response.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 },
      );
    }

    console.log(`[upload] Processing file: ${file.name} (${file.type})`);

    // Step 1: Extract text
    const text = await extractText(file);
    console.log(`[upload] Extracted ${text.length} characters`);

    if (!text || text.trim().length === 0) {
      return Response.json(
        { error: "Could not extract text from document. Is it a scanned PDF?" },
        { status: 422 },
      );
    }

    // Step 2: Chunk text
    const chunks = chunkText(text);
    console.log(`[upload] Created ${chunks.length} chunks`);

    // Step 3: Embed chunks
    const embedded = await embedChunks(chunks);
    console.log(`[upload] Embedded ${embedded.length} chunks`);

    // Step 4: Save to database
    // Prisma Json field requires the embedding to be stored as a plain array
    const document = await prisma.document.create({
      data: {
        filename: file.name,
        fileType: file.type,
        userId: session.user.id,
        chunks: {
          create: embedded.map((e) => ({
            content: e.content,
            embedding: e.embedding, // number[] is valid for Prisma Json
          })),
        },
      },
    });

    console.log(`[upload] Document saved with id: ${document.id}`);
    return Response.json({ documentId: document.id });
  } catch (err: any) {
    // Log the full error server-side so you can see it in terminal
    console.error("[upload] Error:", err?.message ?? err);
    console.error(err?.stack);
    return Response.json(
      { error: err?.message ?? "Upload failed" },
      { status: 500 },
    );
  }
}
