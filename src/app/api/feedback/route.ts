// src/app/api/feedback/route.ts
// Saves in-app feedback to database

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  const { rating, category, comment, page, timestamp } = await req.json();

  await prisma.feedback.create({
    data: {
      rating,
      category: category || "General",
      comment,
      page: page || "/",
      createdAt: new Date(timestamp),
    },
  });

  return NextResponse.json({ success: true });
}

export async function GET() {
  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(feedback);
}
