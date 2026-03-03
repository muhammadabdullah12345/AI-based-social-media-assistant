// src/app/api/auth/facebook/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { prisma } from "@/src/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const META_API = "https://graph.facebook.com/v19.0";

async function fetchPages(userAccessToken: string) {
  // Try with different field combinations — Meta API is inconsistent in dev mode
  const attempts = [
    `${META_API}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`,
    `${META_API}/me/accounts?fields=id,name,access_token&access_token=${userAccessToken}`,
    `${META_API}/me/accounts?access_token=${userAccessToken}`,
  ];

  for (const url of attempts) {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`[FB Callback] Pages attempt response:`, JSON.stringify(data));
    if (!data.error && data.data && data.data.length > 0) {
      return data.data;
    }
  }
  return [];
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(`${APP_URL}/login`);
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const errorParam = searchParams.get("error");
  const errorMessage = searchParams.get("error_message");

  if (errorParam || !code) {
    const msg = encodeURIComponent(
      errorMessage ?? errorParam ?? "OAuth cancelled",
    );
    return NextResponse.redirect(`${APP_URL}/dashboard/settings?error=${msg}`);
  }

  try {
    const redirectUri = `${APP_URL}/api/auth/facebook/callback`;

    // ── STEP 1: Exchange code for short-lived token ──────────────────
    const tokenParams = new URLSearchParams({
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri: redirectUri,
      code,
    });

    console.log("[FB Callback] Exchanging code for token...");
    const tokenRes = await fetch(
      `${META_API}/oauth/access_token?${tokenParams}`,
    );
    const tokenData = await tokenRes.json();
    console.log(
      "[FB Callback] Token response:",
      JSON.stringify({ ...tokenData, access_token: "***" }),
    );

    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error?.message ?? "Token exchange failed");
    }

    // ── STEP 2: Exchange for long-lived token ────────────────────────
    const longLivedParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      fb_exchange_token: tokenData.access_token,
    });

    console.log("[FB Callback] Getting long-lived token...");
    const llRes = await fetch(
      `${META_API}/oauth/access_token?${longLivedParams}`,
    );
    const llData = await llRes.json();
    const userToken = llData.access_token ?? tokenData.access_token;
    console.log("[FB Callback] Long-lived token obtained:", !!userToken);

    // ── STEP 3: Get user info for debugging ──────────────────────────
    const meRes = await fetch(
      `${META_API}/me?fields=id,name&access_token=${userToken}`,
    );
    const meData = await meRes.json();
    console.log("[FB Callback] User info:", JSON.stringify(meData));

    // ── STEP 4: Try to fetch pages ───────────────────────────────────
    console.log("[FB Callback] Fetching pages...");
    const pages = await fetchPages(userToken);
    console.log(`[FB Callback] Found ${pages.length} pages`);

    if (pages.length === 0) {
      // Store the user token so we can use Graph API Explorer workaround
      // Redirect to a special page where user can manually enter page token
      const encodedToken = encodeURIComponent(userToken);
      return NextResponse.redirect(
        `${APP_URL}/dashboard/settings/connect-manual?token=${encodedToken}`,
      );
    }

    // ── STEP 5: Save pages and Instagram accounts ────────────────────
    await saveAccounts(pages, session.user.id);

    let platform = "facebook";
    if (stateParam) {
      try {
        const decoded = JSON.parse(
          Buffer.from(stateParam, "base64").toString(),
        );
        platform = decoded.platform ?? "facebook";
      } catch {}
    }

    return NextResponse.redirect(
      `${APP_URL}/dashboard/settings?success=true&platform=${platform}`,
    );
  } catch (err: any) {
    console.error("[FB Callback] Error:", err?.message);
    return NextResponse.redirect(
      `${APP_URL}/dashboard/settings?error=${encodeURIComponent(err?.message ?? "Connection failed")}`,
    );
  }
}

async function saveAccounts(pages: any[], userId: string) {
  for (const page of pages) {
    console.log(`[FB Callback] Saving page: ${page.name} (${page.id})`);
    const igAccountId = page.instagram_business_account?.id ?? null;

    await prisma.socialAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId,
          platform: "facebook",
          accountId: page.id,
        },
      },
      update: {
        accountName: page.name,
        accessToken: page.access_token,
        pageId: page.id,
        igAccountId,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      create: {
        userId,
        platform: "facebook",
        accountId: page.id,
        accountName: page.name,
        accessToken: page.access_token,
        pageId: page.id,
        igAccountId,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });

    if (igAccountId) {
      let igName = `${page.name} (Instagram)`;
      try {
        const igRes = await fetch(
          `${META_API}/${igAccountId}?fields=username&access_token=${page.access_token}`,
        );
        const igData = await igRes.json();
        if (igData.username) igName = `@${igData.username}`;
      } catch {}

      await prisma.socialAccount.upsert({
        where: {
          userId_platform_accountId: {
            userId,
            platform: "instagram",
            accountId: igAccountId,
          },
        },
        update: {
          accountName: igName,
          accessToken: page.access_token,
          pageId: page.id,
          igAccountId,
          tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
        create: {
          userId,
          platform: "instagram",
          accountId: igAccountId,
          accountName: igName,
          accessToken: page.access_token,
          pageId: page.id,
          igAccountId,
          tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      });
      console.log(`[FB Callback] Saved Instagram: ${igName}`);
    }
  }
}
