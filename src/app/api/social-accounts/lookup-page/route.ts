// src/app/api/social-accounts/lookup-page/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";

const META_API = "https://graph.facebook.com/v19.0";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  try {
    // Fetch page info using the page access token
    const res = await fetch(
      `${META_API}/me?fields=id,name,instagram_business_account&access_token=${token}`,
    );
    const data = await res.json();

    console.log("[lookup-page] Response:", JSON.stringify(data));

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({
      pageId: data.id,
      pageName: data.name,
      igAccountId: data.instagram_business_account?.id ?? null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Lookup failed" },
      { status: 500 },
    );
  }
}
