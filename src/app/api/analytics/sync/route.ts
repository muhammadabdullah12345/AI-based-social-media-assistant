// src/app/api/analytics/sync/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/authOptions";
import { syncAnalyticsForUser } from "@/src/lib/syncAnalytics";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncAnalyticsForUser(session.user.id);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("[Analytics Sync API]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
