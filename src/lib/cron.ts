// src/lib/cron.ts
// Only runs in local development (not in production/Vercel)
// Call this once from a server startup file

import cron from "node-cron";
import { publishDueScheduledPosts } from "./publishScheduled";

let isRunning = false;
let cronJob: cron.ScheduledTask | null = null;

export function startLocalCron() {
  if (cronJob) return; // Already started

  console.log(
    "[LocalCron] Starting scheduled post publisher — runs every minute",
  );

  cronJob = cron.schedule("* * * * *", async () => {
    if (isRunning) {
      console.log("[LocalCron] Previous run still in progress, skipping");
      return;
    }

    isRunning = true;
    try {
      await publishDueScheduledPosts();
    } catch (err) {
      console.error("[LocalCron] Unexpected error:", err);
    } finally {
      isRunning = false;
    }
  });
}

export function stopLocalCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log("[LocalCron] Stopped");
  }
}
