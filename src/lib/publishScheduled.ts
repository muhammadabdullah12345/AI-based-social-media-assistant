// src/lib/publishScheduled.ts

import { prisma } from "@/src/lib/prisma";
import { publishToFacebook, publishToInstagram } from "@/src/lib/meta";
import { syncAnalyticsForUser } from "./syncAnalytics";

export async function publishDueScheduledPosts() {
  const now = new Date();
  console.log(`[Scheduler] Running at ${now.toISOString()}`);

  const duePosts = await prisma.scheduledPost.findMany({
    where: {
      status: "pending",
      scheduledAt: { lte: now },
    },
  });

  console.log(`[Scheduler] ${duePosts.length} posts due`);
  if (duePosts.length === 0) return { published: 0, failed: 0 };

  let published = 0;
  let failed = 0;

  for (const scheduled of duePosts) {
    // Mark as processing to prevent race conditions
    await prisma.scheduledPost.update({
      where: { id: scheduled.id },
      data: { status: "processing" },
    });

    try {
      const post = await prisma.post.findUnique({
        where: { id: scheduled.postId },
      });

      if (!post) throw new Error("Post not found");

      // Use stored socialAccountId if available, otherwise fallback to first account
      const account = await prisma.socialAccount.findFirst({
        where: {
          userId: scheduled.userId,
          platform: post.platform,
          ...(scheduled.socialAccountId
            ? { id: scheduled.socialAccountId }
            : {}),
        },
      });

      if (!account) {
        throw new Error(`No ${post.platform} account connected`);
      }

      let platformPostId: string;

      if (post.platform === "facebook") {
        platformPostId = await publishToFacebook({
          pageId: account.pageId!,
          pageAccessToken: account.accessToken,
          message: `${post.title}\n\n${post.content}`,
          imageUrl: post.image,
        });
      } else if (post.platform === "instagram") {
        if (!post.image) throw new Error("Instagram requires an image");
        platformPostId = await publishToInstagram({
          igAccountId: account.igAccountId!,
          pageAccessToken: account.accessToken,
          caption: `${post.title}\n\n${post.content}`,
          imageUrl: post.image,
        });
      } else {
        throw new Error(`Unsupported platform: ${post.platform}`);
      }

      // Success
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: "published",
          publishedAt: new Date(),
          platformPostId,
          publishError: null,
        },
      });

      await prisma.scheduledPost.update({
        where: { id: scheduled.id },
        data: { status: "published" },
      });

      console.log(`[Scheduler] ✓ ${post.platform} post ${post.id} published`);
      published++;
    } catch (err: any) {
      console.error(
        `[Scheduler] ✗ Post ${scheduled.postId} failed:`,
        err.message,
      );

      await prisma.scheduledPost.update({
        where: { id: scheduled.id },
        data: { status: "failed" },
      });

      await prisma.post.update({
        where: { id: scheduled.postId },
        data: { status: "failed", publishError: err.message },
      });

      failed++;
    }
  }

  // Auto-sync analytics for all affected users
  const affectedUserIds = [...new Set(duePosts.map((p) => p.userId))];
  for (const uid of affectedUserIds) {
    try {
      await syncAnalyticsForUser(uid);
    } catch (err) {
      console.error(`[Scheduler] Analytics sync failed for user ${uid}:`, err);
    }
  }

  return { published, failed };
}
