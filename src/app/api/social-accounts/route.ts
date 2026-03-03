// src/app/api/social-accounts/route.ts
// Get all connected social accounts for the logged-in user

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.socialAccount.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      platform: true,
      accountId: true,
      accountName: true,
      pageId: true,
      igAccountId: true,
      tokenExpiry: true,
      createdAt: true,
    },
  });

  return NextResponse.json(accounts);
}

// DELETE — disconnect a social account
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountId } = await req.json();

  await prisma.socialAccount.deleteMany({
    where: {
      userId: session.user.id,
      id: accountId,
    },
  });

  return NextResponse.json({ success: true });
}
