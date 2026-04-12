// src/app/api/categories/[id]/documents/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";
import { extractText } from "@/src/rag/extractText";
import { chunkText } from "@/src/rag/chunkText";
import { embedChunks } from "@/src/rag/embedChunks";

// GET — list documents for a category
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const docs = await prisma.categoryDocument.findMany({
    where: { categoryId: id },
    include: {
      document: {
        select: { id: true, filename: true, fileType: true, createdAt: true },
      },
    },
  });

  return NextResponse.json(docs.map((d) => d.document));
}

// POST — upload a document and link it to a category
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: categoryId } = await params;

  // Verify category belongs to user
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: session.user.id },
  });
  if (!category)
    return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });

  try {
    // Process document (same RAG pipeline as before)
    const text = await extractText(file);
    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Could not extract text" },
        { status: 422 },
      );
    }

    const chunks = chunkText(text);
    const embedded = await embedChunks(chunks);

    // Save document
    const document = await prisma.document.create({
      data: {
        filename: file.name,
        fileType: file.type,
        userId: session.user.id,
        chunks: {
          create: embedded.map((e) => ({
            content: e.content,
            embedding: e.embedding,
          })),
        },
      },
    });

    // Link document to category
    await prisma.categoryDocument.create({
      data: { categoryId, documentId: document.id },
    });

    return NextResponse.json({ documentId: document.id, filename: file.name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — unlink a document from a category
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: categoryId } = await params;
  const { documentId } = await req.json();

  await prisma.categoryDocument.deleteMany({
    where: { categoryId, documentId },
  });

  return NextResponse.json({ success: true });
}
