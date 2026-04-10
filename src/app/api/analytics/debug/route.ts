// src/app/api/analytics/debug/route.ts
// Temporarily shows raw Meta API responses so we can see what's happening

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";

const META_API = "https://graph.facebook.com/v19.0";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: any[] = [];

  // Get all published posts
  const posts = await prisma.post.findMany({
    where: {
      userId: session.user.id,
      status: "published",
      platformPostId: { not: null },
    },
  });

  for (const post of posts) {
    const account = await prisma.socialAccount.findFirst({
      where: { userId: session.user.id, platform: post.platform },
    });

    if (!account) {
      results.push({
        postId: post.id,
        error: "No account found",
        platform: post.platform,
      });
      continue;
    }

    const postResult: any = {
      postId: post.id,
      platformPostId: post.platformPostId,
      platform: post.platform,
      title: post.title,
      accountName: account.accountName,
      pageId: account.pageId,
      igAccountId: account.igAccountId,
      rawResponses: {},
    };

    if (post.platform === "facebook") {
      // Test 1: Basic post info
      const basicRes = await fetch(
        `${META_API}/${post.platformPostId}?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares&access_token=${account.accessToken}`,
      );
      postResult.rawResponses.basicPost = await basicRes.json();

      // Test 2: Post insights
      const insightsRes = await fetch(
        `${META_API}/${post.platformPostId}/insights?metric=post_impressions,post_impressions_unique,post_engaged_users,post_clicks&access_token=${account.accessToken}`,
      );
      postResult.rawResponses.insights = await insightsRes.json();

      // Test 3: Check token validity
      const tokenRes = await fetch(
        `${META_API}/me?fields=id,name&access_token=${account.accessToken}`,
      );
      postResult.rawResponses.tokenCheck = await tokenRes.json();

      // Test 4: List page posts to verify platformPostId format
      const pagePostsRes = await fetch(
        `${META_API}/${account.pageId}/posts?fields=id,message,created_time&limit=3&access_token=${account.accessToken}`,
      );
      postResult.rawResponses.recentPagePosts = await pagePostsRes.json();
    } else if (post.platform === "instagram") {
      // Test 1: Basic media info
      const basicRes = await fetch(
        `${META_API}/${post.platformPostId}?fields=id,caption,like_count,comments_count,timestamp&access_token=${account.accessToken}`,
      );
      postResult.rawResponses.basicMedia = await basicRes.json();

      // Test 2: Media insights
      const insightsRes = await fetch(
        `${META_API}/${post.platformPostId}/insights?metric=impressions,reach,likes,comments,shares,saved&access_token=${account.accessToken}`,
      );
      postResult.rawResponses.insights = await insightsRes.json();

      // Test 3: List recent IG media to verify IDs
      const mediaRes = await fetch(
        `${META_API}/${account.igAccountId}/media?fields=id,caption,like_count,comments_count,timestamp&limit=3&access_token=${account.accessToken}`,
      );
      postResult.rawResponses.recentMedia = await mediaRes.json();

      // Test 4: Token check
      const tokenRes = await fetch(
        `${META_API}/me?fields=id,name&access_token=${account.accessToken}`,
      );
      postResult.rawResponses.tokenCheck = await tokenRes.json();
    }

    results.push(postResult);
  }

  return NextResponse.json({ posts: results }, { status: 200 });
}
