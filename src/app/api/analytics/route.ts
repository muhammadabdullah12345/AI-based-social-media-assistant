// src/app/api/analytics/route.ts
// Returns aggregated analytics data for the dashboard

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // All posts with analytics
  const postsWithAnalytics = await prisma.post.findMany({
    where: { userId, status: "published" },
    include: { analytics: true },
    orderBy: { publishedAt: "desc" },
  });

  // All posts summary (including drafts/scheduled)
  const allPosts = await prisma.post.findMany({
    where: { userId },
    select: { status: true, platform: true, createdAt: true },
  });

  // ── Aggregate totals ─────────────────────────────────────────────
  const totals = postsWithAnalytics.reduce(
    (acc, post) => {
      if (!post.analytics) return acc;
      return {
        impressions: acc.impressions + post.analytics.impressions,
        reach: acc.reach + post.analytics.reach,
        likes: acc.likes + post.analytics.likes,
        comments: acc.comments + post.analytics.comments,
        shares: acc.shares + post.analytics.shares,
        saves: acc.saves + post.analytics.saves,
        clicks: acc.clicks + post.analytics.clicks,
      };
    },
    {
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      clicks: 0,
    },
  );

  // ── Platform breakdown ────────────────────────────────────────────
  const platformBreakdown = {
    facebook: {
      posts: 0,
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      engagementRate: 0,
    },
    instagram: {
      posts: 0,
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      engagementRate: 0,
    },
  };

  postsWithAnalytics.forEach((post) => {
    const platform = post.platform as "facebook" | "instagram";
    if (!platformBreakdown[platform] || !post.analytics) return;
    platformBreakdown[platform].posts += 1;
    platformBreakdown[platform].impressions += post.analytics.impressions;
    platformBreakdown[platform].reach += post.analytics.reach;
    platformBreakdown[platform].likes += post.analytics.likes;
    platformBreakdown[platform].comments += post.analytics.comments;
    platformBreakdown[platform].shares += post.analytics.shares;
    if (platform === "instagram") {
      (platformBreakdown.instagram as any).saves += post.analytics.saves;
    }
  });

  // Average engagement rates per platform
  ["facebook", "instagram"].forEach((p) => {
    const platform = p as "facebook" | "instagram";
    const platformPosts = postsWithAnalytics.filter(
      (post) => post.platform === platform && post.analytics,
    );
    if (platformPosts.length > 0) {
      platformBreakdown[platform].engagementRate = parseFloat(
        (
          platformPosts.reduce(
            (sum, post) => sum + (post.analytics?.engagementRate ?? 0),
            0,
          ) / platformPosts.length
        ).toFixed(2),
      );
    }
  });

  // ── Chart data — posts published per day (last 30 days) ──────────
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentPosts = postsWithAnalytics.filter(
    (p) => p.publishedAt && p.publishedAt > thirtyDaysAgo,
  );

  const chartDataMap: Record<
    string,
    {
      date: string;
      impressions: number;
      reach: number;
      likes: number;
      posts: number;
    }
  > = {};
  recentPosts.forEach((post) => {
    const date = post.publishedAt!.toISOString().split("T")[0];
    if (!chartDataMap[date]) {
      chartDataMap[date] = {
        date,
        impressions: 0,
        reach: 0,
        likes: 0,
        posts: 0,
      };
    }
    chartDataMap[date].impressions += post.analytics?.impressions ?? 0;
    chartDataMap[date].reach += post.analytics?.reach ?? 0;
    chartDataMap[date].likes += post.analytics?.likes ?? 0;
    chartDataMap[date].posts += 1;
  });

  const chartData = Object.values(chartDataMap).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // ── Best performing post ──────────────────────────────────────────
  const bestPost = postsWithAnalytics
    .filter((p) => p.analytics)
    .sort(
      (a, b) =>
        (b.analytics?.engagementRate ?? 0) - (a.analytics?.engagementRate ?? 0),
    )[0];

  // ── Post status counts ────────────────────────────────────────────
  const statusCounts = {
    draft: allPosts.filter((p) => p.status === "draft").length,
    published: allPosts.filter((p) => p.status === "published").length,
    scheduled: allPosts.filter((p) => p.status === "scheduled").length,
    failed: allPosts.filter((p) => p.status === "failed").length,
    total: allPosts.length,
  };

  // ── Per-post analytics list ───────────────────────────────────────
  const postAnalyticsList = postsWithAnalytics.map((post) => ({
    id: post.id,
    title: post.title,
    platform: post.platform,
    image: post.image,
    publishedAt: post.publishedAt,
    analytics: post.analytics,
  }));

  return NextResponse.json({
    totals,
    platformBreakdown,
    chartData,
    bestPost: bestPost
      ? {
          id: bestPost.id,
          title: bestPost.title,
          platform: bestPost.platform,
          image: bestPost.image,
          analytics: bestPost.analytics,
        }
      : null,
    statusCounts,
    postAnalyticsList,
    lastSyncedAt: postsWithAnalytics[0]?.analytics?.lastSyncedAt ?? null,
  });
}
