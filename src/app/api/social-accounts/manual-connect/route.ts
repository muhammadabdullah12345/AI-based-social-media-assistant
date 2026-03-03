// src/app/api/social-accounts/manual-connect/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";

const META_API = "https://graph.facebook.com/v19.0";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId, pageAccessToken, pageName, igAccountId } = await req.json();

  if (!pageId || !pageAccessToken || !pageName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    // Save Facebook Page
    await prisma.socialAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: session.user.id,
          platform: "facebook",
          accountId: pageId,
        },
      },
      update: {
        accountName: pageName,
        accessToken: pageAccessToken,
        pageId,
        igAccountId: igAccountId || null,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        platform: "facebook",
        accountId: pageId,
        accountName: pageName,
        accessToken: pageAccessToken,
        pageId,
        igAccountId: igAccountId || null,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });

    // Save Instagram account if present
    if (igAccountId) {
      let igName = `${pageName} (Instagram)`;

      try {
        const igRes = await fetch(
          `${META_API}/${igAccountId}?fields=username&access_token=${pageAccessToken}`,
        );
        const igData = await igRes.json();
        if (igData.username) igName = `@${igData.username}`;
      } catch {}

      await prisma.socialAccount.upsert({
        where: {
          userId_platform_accountId: {
            userId: session.user.id,
            platform: "instagram",
            accountId: igAccountId,
          },
        },
        update: {
          accountName: igName,
          accessToken: pageAccessToken,
          pageId,
          igAccountId,
          tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          platform: "instagram",
          accountId: igAccountId,
          accountName: igName,
          accessToken: pageAccessToken,
          pageId,
          igAccountId,
          tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[manual-connect] Error:", err);
    return NextResponse.json(
      { error: err.message ?? "Save failed" },
      { status: 500 },
    );
  }
}
