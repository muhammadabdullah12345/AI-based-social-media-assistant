// src/app/api/auth/facebook/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform") ?? "facebook";

  const appId = process.env.META_APP_ID!;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
  const redirectUri = `${APP_URL}/api/auth/facebook/callback`;

  const scope = [
    "email",
    "public_profile",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "pages_read_user_content", // ← needed to read post reactions/comments
    "instagram_basic",
    "instagram_content_publish",
    "instagram_manage_insights", // ← needed for IG insights (requires app review for others)
    "read_insights", // ← needed for FB page insights
  ].join(",");

  const state = Buffer.from(JSON.stringify({ platform })).toString("base64");

  const oauthUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  oauthUrl.searchParams.set("client_id", appId);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);
  oauthUrl.searchParams.set("scope", scope);
  oauthUrl.searchParams.set("state", state);
  oauthUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(oauthUrl.toString());
}
