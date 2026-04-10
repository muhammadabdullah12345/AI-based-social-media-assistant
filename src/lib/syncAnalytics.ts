// src/lib/syncAnalytics.ts

import { prisma } from "@/src/lib/prisma";
import { calculateEngagementRate } from "@/src/lib/metaAnalytics";

const META_API = "https://graph.facebook.com/v19.0";

// ── Fetch all IG media and find matching post by caption ─────────────
async function getInstagramAnalyticsByCaption(
  igAccountId: string,
  pageAccessToken: string,
  postTitle: string,
  postContent: string,
  storedPostId: string,
): Promise<{
  resolvedId: string | null;
  likes: number;
  comments: number;
  impressions: number;
  reach: number;
  shares: number;
  saves: number;
}> {
  const empty = {
    resolvedId: null,
    likes: 0,
    comments: 0,
    impressions: 0,
    reach: 0,
    shares: 0,
    saves: 0,
  };

  try {
    // First try stored ID directly
    const directRes = await fetch(
      `${META_API}/${storedPostId}?fields=id,like_count,comments_count,caption&access_token=${pageAccessToken}`,
    );
    const directData = await directRes.json();

    if (!directData.error) {
      console.log(
        `[Sync] Direct IG match for ${storedPostId}: likes=${directData.like_count}`,
      );
      return {
        resolvedId: storedPostId,
        likes: directData.like_count ?? 0,
        comments: directData.comments_count ?? 0,
        impressions: 0,
        reach: 0,
        shares: 0,
        saves: 0,
      };
    }

    // Direct failed — fetch all recent media and match by caption
    console.log(
      `[Sync] Direct fetch failed for ${storedPostId}, searching by caption...`,
    );

    let allMedia: any[] = [];
    let url = `${META_API}/${igAccountId}/media?fields=id,caption,like_count,comments_count,timestamp&limit=50&access_token=${pageAccessToken}`;

    // Fetch up to 2 pages of media
    for (let page = 0; page < 2; page++) {
      const res = await fetch(url);
      const data = await res.json();
      if (data.error || !data.data) break;
      allMedia = allMedia.concat(data.data);
      if (!data.paging?.next) break;
      url = data.paging.next;
    }

    console.log(`[Sync] Fetched ${allMedia.length} IG media items`);

    // Match by caption — check if post content appears in caption
    const searchText = postContent.slice(0, 50).toLowerCase().trim();
    const titleText = postTitle.slice(0, 30).toLowerCase().trim();

    const match = allMedia.find((m: any) => {
      const caption = (m.caption ?? "").toLowerCase();
      return caption.includes(searchText) || caption.includes(titleText);
    });

    if (match) {
      console.log(
        `[Sync] Caption match found: ${match.id} | likes=${match.like_count}`,
      );
      return {
        resolvedId: match.id,
        likes: match.like_count ?? 0,
        comments: match.comments_count ?? 0,
        impressions: 0,
        reach: 0,
        shares: 0,
        saves: 0,
      };
    }

    console.warn(`[Sync] No caption match found for post "${postTitle}"`);
    return empty;
  } catch (err: any) {
    console.error(`[Sync] IG analytics error:`, err.message);
    return empty;
  }
}

// ── Fetch Facebook post analytics by matching against page posts ──────
async function getFacebookAnalyticsByMatch(
  pageId: string,
  pageAccessToken: string,
  storedPostId: string,
  postTitle: string,
  postContent: string,
): Promise<{
  resolvedId: string | null;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  reach: number;
  clicks: number;
}> {
  const empty = {
    resolvedId: null,
    likes: 0,
    comments: 0,
    shares: 0,
    impressions: 0,
    reach: 0,
    clicks: 0,
  };

  try {
    // Step 1: Try stored ID directly with different field formats
    // Facebook photo post IDs can be accessed as pageId_photoId
    const idsToTry = [storedPostId, `${pageId}_${storedPostId}`];

    for (const tryId of idsToTry) {
      const res = await fetch(
        `${META_API}/${tryId}?fields=id,likes.summary(true),comments.summary(true),shares&access_token=${pageAccessToken}`,
      );
      const data = await res.json();

      if (!data.error) {
        console.log(`[Sync] FB direct match with ID ${tryId}`);
        const likes = data.likes?.summary?.total_count ?? 0;
        const comments = data.comments?.summary?.total_count ?? 0;
        const shares = data.shares?.count ?? 0;

        // Try to get insights
        let impressions = 0,
          reach = 0,
          clicks = 0;
        const insRes = await fetch(
          `${META_API}/${tryId}/insights?metric=post_impressions,post_impressions_unique,post_clicks&access_token=${pageAccessToken}`,
        );
        const insData = await insRes.json();

        if (!insData.error && insData.data) {
          for (const m of insData.data) {
            const val = m.values?.[0]?.value ?? 0;
            if (m.name === "post_impressions")
              impressions = typeof val === "number" ? val : 0;
            if (m.name === "post_impressions_unique")
              reach = typeof val === "number" ? val : 0;
            if (m.name === "post_clicks")
              clicks = typeof val === "number" ? val : 0;
          }
        }

        return {
          resolvedId: tryId,
          likes,
          comments,
          shares,
          impressions,
          reach,
          clicks,
        };
      }
    }

    // Step 2: Search page feed by matching message content
    console.log(`[Sync] FB direct IDs failed, searching page feed...`);

    const feedRes = await fetch(
      `${META_API}/${pageId}/posts?fields=id,message,likes.summary(true),comments.summary(true),shares,created_time&limit=25&access_token=${pageAccessToken}`,
    );
    const feedData = await feedRes.json();

    if (feedData.error) {
      console.error(`[Sync] FB feed error:`, feedData.error.message);
      return empty;
    }

    const searchText = postContent.slice(0, 60).toLowerCase().trim();
    const titleText = postTitle.slice(0, 40).toLowerCase().trim();

    const match = (feedData.data ?? []).find((p: any) => {
      const msg = (p.message ?? "").toLowerCase();
      return msg.includes(searchText) || msg.includes(titleText);
    });

    if (match) {
      console.log(`[Sync] FB feed match: ${match.id}`);
      const likes = match.likes?.summary?.total_count ?? 0;
      const comments = match.comments?.summary?.total_count ?? 0;
      const shares = match.shares?.count ?? 0;

      // Try insights on matched post
      let impressions = 0,
        reach = 0,
        clicks = 0;
      const insRes = await fetch(
        `${META_API}/${match.id}/insights?metric=post_impressions,post_impressions_unique,post_clicks&access_token=${pageAccessToken}`,
      );
      const insData = await insRes.json();

      if (!insData.error && insData.data) {
        for (const m of insData.data) {
          const val = m.values?.[0]?.value ?? 0;
          if (m.name === "post_impressions")
            impressions = typeof val === "number" ? val : 0;
          if (m.name === "post_impressions_unique")
            reach = typeof val === "number" ? val : 0;
          if (m.name === "post_clicks")
            clicks = typeof val === "number" ? val : 0;
        }
      }

      // Update stored platformPostId in DB to correct ID
      return {
        resolvedId: match.id,
        likes,
        comments,
        shares,
        impressions,
        reach,
        clicks,
      };
    }

    console.warn(`[Sync] No FB match found for "${postTitle}"`);
    return empty;
  } catch (err: any) {
    console.error(`[Sync] FB analytics error:`, err.message);
    return empty;
  }
}

// ── Main sync function ────────────────────────────────────────────────
export async function syncAnalyticsForUser(userId: string) {
  console.log(`[Analytics Sync] Starting for user ${userId}`);

  const publishedPosts = await prisma.post.findMany({
    where: {
      userId,
      status: "published",
      platformPostId: { not: null },
    },
  });

  console.log(`[Analytics Sync] ${publishedPosts.length} published posts`);

  let synced = 0;
  let failed = 0;

  for (const post of publishedPosts) {
    try {
      const account = await prisma.socialAccount.findFirst({
        where: { userId, platform: post.platform },
      });

      if (!account) {
        console.warn(
          `[Analytics Sync] No account for platform ${post.platform}`,
        );
        continue;
      }

      let analyticsData: {
        impressions: number;
        reach: number;
        likes: number;
        comments: number;
        shares: number;
        saves: number;
        clicks: number;
        engagementRate: number;
      };

      let resolvedPostId: string | null = null;

      if (post.platform === "instagram") {
        const result = await getInstagramAnalyticsByCaption(
          account.igAccountId!,
          account.accessToken,
          post.title,
          post.content,
          post.platformPostId!,
        );

        resolvedPostId = result.resolvedId;
        analyticsData = {
          impressions: result.impressions,
          reach: result.reach,
          likes: result.likes,
          comments: result.comments,
          shares: result.shares,
          saves: result.saves,
          clicks: 0,
          engagementRate: calculateEngagementRate(
            result.likes,
            result.comments,
            result.shares,
            result.saves,
            result.reach > 0
              ? result.reach
              : result.likes + result.comments + result.shares + 1,
          ),
        };
      } else if (post.platform === "facebook") {
        const result = await getFacebookAnalyticsByMatch(
          account.pageId!,
          account.accessToken,
          post.platformPostId!,
          post.title,
          post.content,
        );

        resolvedPostId = result.resolvedId;
        analyticsData = {
          impressions: result.impressions,
          reach: result.reach,
          likes: result.likes,
          comments: result.comments,
          shares: result.shares,
          saves: 0,
          clicks: result.clicks,
          engagementRate: calculateEngagementRate(
            result.likes,
            result.comments,
            result.shares,
            0,
            result.reach > 0
              ? result.reach
              : result.likes + result.comments + result.shares + 1,
          ),
        };
      } else {
        continue;
      }

      // If we found a better/corrected post ID, update it in DB
      if (resolvedPostId && resolvedPostId !== post.platformPostId) {
        console.log(
          `[Analytics Sync] Updating platformPostId: ${post.platformPostId} → ${resolvedPostId}`,
        );
        await prisma.post.update({
          where: { id: post.id },
          data: { platformPostId: resolvedPostId },
        });
      }

      console.log(`[Analytics Sync] Saving analytics for "${post.title}":`, {
        likes: analyticsData.likes,
        comments: analyticsData.comments,
        impressions: analyticsData.impressions,
      });

      await prisma.postAnalytics.upsert({
        where: { postId: post.id },
        update: {
          ...analyticsData,
          lastSyncedAt: new Date(),
        },
        create: {
          postId: post.id,
          platform: post.platform,
          ...analyticsData,
        },
      });

      synced++;
    } catch (err: any) {
      console.error(
        `[Analytics Sync] Failed for post ${post.id}:`,
        err.message,
      );
      failed++;
    }
  }

  console.log(`[Analytics Sync] Done. Synced: ${synced}, Failed: ${failed}`);
  return { synced, failed, total: publishedPosts.length };
}
