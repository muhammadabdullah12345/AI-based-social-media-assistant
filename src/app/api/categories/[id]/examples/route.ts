// src/app/api/categories/[id]/examples/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";

// GET — list examples for a category
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const examples = await prisma.categoryExample.findMany({
    where: { categoryId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(examples);
}

// POST — add an example post to a category
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: categoryId } = await params;
  const { title, content, tone, platform } = await req.json();

  if (!title || !content) {
    return NextResponse.json(
      { error: "title and content are required" },
      { status: 400 },
    );
  }

  // Verify category belongs to user
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: session.user.id },
  });

  if (!category)
    return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const example = await prisma.categoryExample.create({
    data: {
      categoryId,
      title,
      content,
      tone: tone ?? "casual",
      platform: platform ?? "instagram",
    },
  });

  return NextResponse.json(example);
}

// DELETE — remove an example
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: categoryId } = await params;
  const { exampleId } = await req.json();

  await prisma.categoryExample.deleteMany({
    where: { id: exampleId, categoryId },
  });

  return NextResponse.json({ success: true });
}
