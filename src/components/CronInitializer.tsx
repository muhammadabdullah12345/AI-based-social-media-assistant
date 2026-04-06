// src/components/CronInitializer.tsx
// This component silently starts the local cron when the app loads
"use client";

import { useEffect } from "react";

export default function CronInitializer() {
  useEffect(() => {
    // Fire-and-forget — just wake up the cron
    fetch("/api/cron/start").catch(() => {});
  }, []);

  return null; // Renders nothing
}
