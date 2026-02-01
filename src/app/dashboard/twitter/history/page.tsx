"use client";

import React, { useEffect, useState } from "react";
import { Twitter, Calendar, Trash2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function TwitterHistoryPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/posts?platform=twitter");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-12 flex items-center gap-4">
          <div className="rounded-xl bg-sky-500/20 p-3">
            <Twitter className="h-7 w-7 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Twitter Post History</h1>
            <p className="text-slate-400 text-sm mt-1">
              Review, analyze, and reuse your generated tweets
            </p>
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <div className="text-slate-400">Loading tweets...</div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400">
            No Twitter posts found yet.
            <br />
            Generate your first tweet to see it here.
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6"
              >
                {/* Meta */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <MessageSquare className="h-4 w-4 text-sky-400" />
                    {post.content.split("\n\n").length > 1
                      ? "Thread"
                      : "Single Tweet"}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Tweet Body */}
                <div className="whitespace-pre-line text-slate-200 leading-relaxed text-sm">
                  {post.content}
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                  <div className="text-xs text-slate-500">
                    {post.content.length} characters
                  </div>

                  <button
                    className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition"
                    onClick={() => alert("Delete feature optional")}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
