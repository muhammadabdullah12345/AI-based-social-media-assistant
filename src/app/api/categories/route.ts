// src/app/api/categories/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";
import { ensureDefaultCategories } from "@/src/lib/seedCategories";

// GET — list all categories for user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure defaults exist
  await ensureDefaultCategories(session.user.id);

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: {
          examples: true,
          documents: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

// POST — create a custom category
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, displayName, description } = await req.json();

  if (!name || !displayName) {
    return NextResponse.json(
      { error: "name and displayName are required" },
      { status: 400 },
    );
  }

  const slug = name.toLowerCase().replace(/\s+/g, "_");

  try {
    const category = await prisma.category.create({
      data: {
        name: slug,
        displayName,
        description,
        userId: session.user.id,
      },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { error: "Category already exists" },
      { status: 409 },
    );
  }
}
