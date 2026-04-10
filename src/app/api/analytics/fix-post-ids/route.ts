// src/app/api/analytics/fix-post-ids/route.ts
// One-time endpoint to fix stored platformPostIds by matching against actual page posts

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

  const fixed: any[] = [];
  const errors: any[] = [];

  const publishedPosts = await prisma.post.findMany({
    where: {
      userId: session.user.id,
      status: "published",
      platformPostId: { not: null },
    },
  });

  for (const post of publishedPosts) {
    const account = await prisma.socialAccount.findFirst({
      where: { userId: session.user.id, platform: post.platform },
    });
    if (!account) continue;

    if (post.platform === "facebook") {
      try {
        // Fetch recent page posts and try to match by content
        const feedRes = await fetch(
          `${META_API}/${account.pageId}/posts?fields=id,message,created_time,story&limit=25&access_token=${account.accessToken}`,
        );
        const feedData = await feedRes.json();

        if (feedData.error) {
          errors.push({ postId: post.id, error: feedData.error.message });
          continue;
        }

        // Also try photos feed
        const photosRes = await fetch(
          `${META_API}/${account.pageId}/photos?fields=id,name,created_time&type=uploaded&limit=25&access_token=${account.accessToken}`,
        );
        const photosData = await photosRes.json();

        fixed.push({
          postId: post.id,
          currentPlatformPostId: post.platformPostId,
          recentPagePosts: feedData.data?.slice(0, 5),
          recentPhotos: photosData.data?.slice(0, 5),
        });
      } catch (err: any) {
        errors.push({ postId: post.id, error: err.message });
      }
    }

    if (post.platform === "instagram") {
      try {
        // Get recent IG media
        const mediaRes = await fetch(
          `${META_API}/${account.igAccountId}/media?fields=id,caption,like_count,comments_count,timestamp,media_type&limit=10&access_token=${account.accessToken}`,
        );
        const mediaData = await mediaRes.json();

        fixed.push({
          postId: post.id,
          currentPlatformPostId: post.platformPostId,
          recentIGMedia: mediaData.data?.slice(0, 5),
          igAccountId: account.igAccountId,
        });
      } catch (err: any) {
        errors.push({ postId: post.id, error: err.message });
      }
    }
  }

  return NextResponse.json({ fixed, errors });
}
