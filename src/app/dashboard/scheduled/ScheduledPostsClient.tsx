// src/app/dashboard/scheduled/ScheduledPostsClient.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Trash2,
  Instagram,
  Facebook,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

type ScheduledPost = {
  id: string;
  postId: string;
  platform: string;
  scheduledAt: string;
  status: string;
  post?: {
    title: string;
    content: string;
    image?: string;
  };
};

export default function ScheduledPostsClient() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduled();
    // Auto-refresh every 30 seconds to see status updates
    const interval = setInterval(fetchScheduled, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchScheduled() {
    try {
      const res = await fetch("/api/scheduled-posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function cancelScheduled(postId: string) {
    if (!confirm("Cancel this scheduled post?")) return;
    setCancelling(postId);
    try {
      await fetch(`/api/scheduled-posts/${postId}`, { method: "DELETE" });
      fetchScheduled();
    } catch {
      alert("Failed to cancel");
    } finally {
      setCancelling(null);
    }
  }

  const pending = posts.filter((p) => p.status === "pending");
  const completed = posts.filter(
    (p) => p.status !== "pending" && p.status !== "processing",
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-600/20 p-3">
              <Calendar className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Scheduled Posts</h1>
              <p className="text-slate-400 text-sm mt-1">
                Posts queued for automatic publishing
              </p>
            </div>
          </div>
          <button
            onClick={fetchScheduled}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </header>

        {loading && (
          <p className="text-slate-400 text-center mt-20">
            Loading scheduled posts...
          </p>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center mt-20 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No scheduled posts</p>
            <p className="text-sm mt-1">
              Schedule a post from the Instagram or Facebook history page
            </p>
          </div>
        )}

        {/* Pending / Upcoming */}
        {pending.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Upcoming ({pending.length})
            </h2>
            <div className="space-y-4">
              {pending.map((item, i) => (
                <ScheduledCard
                  key={item.id}
                  item={item}
                  onCancel={cancelScheduled}
                  cancelling={cancelling}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              History ({completed.length})
            </h2>
            <div className="space-y-4">
              {completed.map((item, i) => (
                <ScheduledCard
                  key={item.id}
                  item={item}
                  onCancel={cancelScheduled}
                  cancelling={cancelling}
                  index={i}
                  readonly
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function ScheduledCard({
  item,
  onCancel,
  cancelling,
  index,
  readonly = false,
}: {
  item: ScheduledPost;
  onCancel: (postId: string) => void;
  cancelling: string | null;
  index: number;
  readonly?: boolean;
}) {
  const isPending = item.status === "pending" || item.status === "processing";
  const isPublished = item.status === "published";
  const isFailed = item.status === "failed";

  const PlatformIcon = item.platform === "instagram" ? Instagram : Facebook;
  const platformColor =
    item.platform === "instagram" ? "text-pink-400" : "text-blue-400";

  const timeUntil = new Date(item.scheduledAt).getTime() - Date.now();
  const minutesUntil = Math.floor(timeUntil / 60000);
  const hoursUntil = Math.floor(minutesUntil / 60);

  function getTimeLabel() {
    if (isFailed) return "Failed to publish";
    if (isPublished) return "Published";
    if (timeUntil < 0) return "Publishing soon...";
    if (hoursUntil > 24) return `in ${Math.floor(hoursUntil / 24)} days`;
    if (hoursUntil > 0) return `in ${hoursUntil}h ${minutesUntil % 60}m`;
    return `in ${minutesUntil} minutes`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border bg-slate-900/80 overflow-hidden flex gap-0 ${
        isFailed
          ? "border-red-500/30"
          : isPublished
            ? "border-emerald-500/30"
            : "border-slate-800"
      }`}
    >
      {/* Image thumbnail */}
      {item.post?.image && (
        <img
          src={item.post.image}
          alt=""
          className="w-24 h-24 object-cover flex-shrink-0"
        />
      )}

      <div className="p-5 flex-1 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PlatformIcon className={`h-4 w-4 ${platformColor}`} />
            <span className={`text-xs font-medium capitalize ${platformColor}`}>
              {item.platform}
            </span>
            {/* Status badge */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isPublished
                  ? "bg-emerald-500/20 text-emerald-400"
                  : isFailed
                    ? "bg-red-500/20 text-red-400"
                    : item.status === "processing"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-indigo-500/20 text-indigo-400"
              }`}
            >
              {item.status === "processing" ? "Publishing..." : item.status}
            </span>
          </div>

          <p className="text-sm text-white font-medium truncate">
            {item.post?.title ?? "Untitled Post"}
          </p>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
            {item.post?.content}
          </p>
        </div>

        <div className="text-right flex-shrink-0 space-y-2">
          <div className="flex items-center gap-1 text-xs text-slate-400 justify-end">
            <Clock className="h-3 w-3" />
            {new Date(item.scheduledAt).toLocaleString()}
          </div>
          <div
            className={`text-xs font-medium ${
              isFailed
                ? "text-red-400"
                : isPublished
                  ? "text-emerald-400"
                  : timeUntil < 0
                    ? "text-yellow-400"
                    : "text-indigo-400"
            }`}
          >
            {getTimeLabel()}
          </div>

          {isPending && !readonly && (
            <button
              onClick={() => onCancel(item.postId)}
              disabled={cancelling === item.postId}
              className="flex items-center gap-1 rounded-lg bg-red-600/20 hover:bg-red-600 border border-red-600/30 text-red-400 hover:text-white px-2 py-1 text-xs transition ml-auto"
            >
              <Trash2 className="h-3 w-3" />
              Cancel
            </button>
          )}
          {isPublished && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 ml-auto" />
          )}
          {isFailed && <XCircle className="h-4 w-4 text-red-400 ml-auto" />}
        </div>
      </div>
    </motion.div>
  );
}
