// src/components/PostStatusBadge.tsx
"use client";

type Status = "draft" | "published" | "scheduled" | "failed";

export default function PostStatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    draft: "bg-slate-700 text-slate-300",
    published:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    scheduled: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    failed: "bg-red-500/20 text-red-400 border border-red-500/30",
  };

  const labels: Record<Status, string> = {
    draft: "Draft",
    published: "✓ Published",
    scheduled: "⏰ Scheduled",
    failed: "✕ Failed",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] ?? styles.draft}`}
    >
      {labels[status as Status] ?? status}
    </span>
  );
}
