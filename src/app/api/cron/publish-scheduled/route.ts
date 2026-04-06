// src/app/api/cron/publish-scheduled/route.ts
// Called by Vercel Cron in production every minute
// Can also be called manually for testing

import { NextRequest, NextResponse } from "next/server";
import { publishDueScheduledPosts } from "@/src/lib/publishScheduled";

// Protect this endpoint with a secret so only Vercel Cron can call it
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow if no secret set (dev mode) OR if secret matches
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await publishDueScheduledPosts();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Cron] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
