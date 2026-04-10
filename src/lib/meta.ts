// src/lib/meta.ts
// Central helper for all Meta (Facebook + Instagram) API calls

const META_API_BASE = "https://graph.facebook.com/v19.0";

// ── Exchange short-lived token for long-lived token ──────────────────
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<string> {
  const url = new URL(`${META_API_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", process.env.META_APP_ID!);
  url.searchParams.set("client_secret", process.env.META_APP_SECRET!);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (!data.access_token) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

// ── Get all Facebook Pages the user manages ──────────────────────────
export async function getUserPages(userAccessToken: string) {
  const url = `${META_API_BASE}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) throw new Error(data.error.message);
  return data.data as Array<{
    id: string;
    name: string;
    access_token: string;
    instagram_business_account?: { id: string };
  }>;
}

// ── Get Instagram Business Account ID for a Page ────────────────────
export async function getInstagramAccountId(
  pageId: string,
  pageAccessToken: string,
): Promise<string | null> {
  const url = `${META_API_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) throw new Error(data.error.message);
  return data.instagram_business_account?.id ?? null;
}

// ── Publish to Facebook Page ─────────────────────────────────────────
// Replace just the publishToFacebook function in src/lib/meta.ts

export async function publishToFacebook({
  pageId,
  pageAccessToken,
  message,
  imageUrl,
  scheduledPublishTime,
}: {
  pageId: string;
  pageAccessToken: string;
  message: string;
  imageUrl?: string | null;
  scheduledPublishTime?: Date;
}): Promise<string> {
  if (imageUrl) {
    // When posting a photo, we need to get the POST id, not the photo id
    // photo endpoint returns { id: "photoId", post_id: "pageId_postId" }
    const body: Record<string, any> = {
      message,
      url: imageUrl,
      access_token: pageAccessToken,
      published: scheduledPublishTime ? false : true,
    };

    if (scheduledPublishTime) {
      body.scheduled_publish_time = Math.floor(
        scheduledPublishTime.getTime() / 1000,
      );
    }

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/photos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();
    console.log("[FB Publish] Photo response:", JSON.stringify(data));

    if (data.error)
      throw new Error(`Facebook publish error: ${data.error.message}`);

    // Use post_id if available (this is the ID that works with insights)
    // Fall back to id (photo id) if post_id not returned
    return data.post_id ?? data.id;
  } else {
    // Text-only post
    const body: Record<string, any> = {
      message,
      access_token: pageAccessToken,
    };

    if (scheduledPublishTime) {
      body.published = false;
      body.scheduled_publish_time = Math.floor(
        scheduledPublishTime.getTime() / 1000,
      );
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("[FB Publish] Feed response:", JSON.stringify(data));

    if (data.error)
      throw new Error(`Facebook publish error: ${data.error.message}`);
    return data.id;
  }
}

// ── Publish to Instagram ─────────────────────────────────────────────
// Instagram requires a 2-step process:
// 1. Create a media container
// 2. Publish the container
export async function publishToInstagram({
  igAccountId,
  pageAccessToken,
  caption,
  imageUrl,
}: {
  igAccountId: string;
  pageAccessToken: string;
  caption: string;
  imageUrl: string;
}): Promise<string> {
  // Step 1: Create media container
  const containerRes = await fetch(`${META_API_BASE}/${igAccountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption,
      access_token: pageAccessToken,
    }),
  });

  const containerData = await containerRes.json();
  if (containerData.error) {
    throw new Error(
      `Instagram container error: ${containerData.error.message}`,
    );
  }

  const containerId = containerData.id;

  // Step 2: Publish the container
  const publishRes = await fetch(
    `${META_API_BASE}/${igAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: pageAccessToken,
      }),
    },
  );

  const publishData = await publishRes.json();
  if (publishData.error) {
    throw new Error(`Instagram publish error: ${publishData.error.message}`);
  }

  return publishData.id;
}

// ── Verify a page access token is still valid ────────────────────────
export async function verifyToken(accessToken: string): Promise<boolean> {
  try {
    const url = `${META_API_BASE}/me?access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    return !data.error;
  } catch {
    return false;
  }
}
