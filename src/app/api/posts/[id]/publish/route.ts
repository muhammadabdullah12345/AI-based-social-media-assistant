// src/app/api/posts/[id]/publish/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";
import { publishToFacebook, publishToInstagram } from "@/src/lib/meta";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: postId } = await params;
  const { action, scheduledAt, socialAccountId } = await req.json();

  // Fetch the post
  const post = await prisma.post.findFirst({
    where: { id: postId, userId: session.user.id },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Fetch the social account
  const account = await prisma.socialAccount.findFirst({
    where: { id: socialAccountId, userId: session.user.id },
  });

  if (!account) {
    return NextResponse.json(
      { error: "Social account not found. Please connect your account first." },
      { status: 404 },
    );
  }

  // ── SCHEDULE ─────────────────────────────────────────────────────────
  if (action === "schedule") {
    if (!scheduledAt) {
      return NextResponse.json(
        { error: "scheduledAt is required for scheduling" },
        { status: 400 },
      );
    }

    const scheduleDate = new Date(scheduledAt);

    if (isNaN(scheduleDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
    }

    if (scheduleDate <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 },
      );
    }

    // Update post status
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: "scheduled",
        scheduledAt: scheduleDate,
        publishError: null,
      },
    });

    // Upsert ScheduledPost — store socialAccountId so cron knows which account to use
    await prisma.scheduledPost.upsert({
      where: { postId },
      update: {
        scheduledAt: scheduleDate,
        status: "pending",
        platform: post.platform,
        socialAccountId,
      },
      create: {
        postId,
        userId: session.user.id,
        platform: post.platform,
        scheduledAt: scheduleDate,
        status: "pending",
        socialAccountId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Post scheduled for ${scheduleDate.toLocaleString()}`,
    });
  }

  // ── PUBLISH NOW ───────────────────────────────────────────────────────
  try {
    let platformPostId: string;

    if (post.platform === "facebook") {
      if (!account.pageId) {
        return NextResponse.json(
          { error: "No Facebook Page linked to this account" },
          { status: 400 },
        );
      }
      platformPostId = await publishToFacebook({
        pageId: account.pageId,
        pageAccessToken: account.accessToken,
        message: `${post.title}\n\n${post.content}`,
        imageUrl: post.image,
      });
    } else if (post.platform === "instagram") {
      if (!account.igAccountId) {
        return NextResponse.json(
          {
            error:
              "No Instagram Business Account linked. Make sure your Instagram is a Business account connected to a Facebook Page.",
          },
          { status: 400 },
        );
      }
      if (!post.image) {
        return NextResponse.json(
          {
            error:
              "Instagram requires an image. Please regenerate the post with an image.",
          },
          { status: 400 },
        );
      }
      platformPostId = await publishToInstagram({
        igAccountId: account.igAccountId,
        pageAccessToken: account.accessToken,
        caption: `${post.title}\n\n${post.content}`,
        imageUrl: post.image,
      });
    } else {
      return NextResponse.json(
        { error: "Unsupported platform" },
        { status: 400 },
      );
    }

    // Update post
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: "published",
        publishedAt: new Date(),
        platformPostId,
        publishError: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Post published successfully!",
      platformPostId,
    });
  } catch (err: any) {
    console.error("[Publish Error]", err);

    await prisma.post.update({
      where: { id: postId },
      data: { status: "failed", publishError: err.message },
    });

    return NextResponse.json(
      { error: err.message ?? "Publishing failed" },
      { status: 500 },
    );
  }
}
