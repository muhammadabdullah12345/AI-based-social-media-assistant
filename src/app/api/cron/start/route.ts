// src/app/api/cron/start/route.ts
// Lightweight route to boot the local cron in dev
// Called once when the app loads

import { NextResponse } from "next/server";

// Use a global flag to avoid starting multiple times in dev hot reload
declare global {
  var __cronStarted: boolean | undefined;
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    // In production, Vercel handles cron — nothing to do here
    return NextResponse.json({
      message: "Production mode — Vercel Cron handles scheduling",
    });
  }

  if (!global.__cronStarted) {
    const { startLocalCron } = await import("@/src/lib/cron");
    startLocalCron();
    global.__cronStarted = true;
    console.log("[CronStart] Local cron initialized");
  }

  return NextResponse.json({ message: "Local cron is running" });
}
