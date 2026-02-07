"use client";

import React, { useEffect, useState } from "react";
import {
  Linkedin,
  Calendar,
  Copy,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
};

export default function LinkedinHistoryPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/posts?platform=linkedin");
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

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-12 flex items-center gap-4">
          <div className="rounded-xl bg-blue-600/20 p-3">
            <Linkedin className="h-7 w-7 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">LinkedIn Post History</h1>
            <p className="text-slate-400 text-sm mt-1">
              Review, reuse, and refine your professional content
            </p>
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <div className="text-slate-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400">
            No LinkedIn posts generated yet.
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8"
              >
                {/* Meta + Actions */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    {/* Edit */}
                    <button
                      onClick={() =>
                        router.push(`/dashboard/linkedin/edit/${post.id}`)
                      }
                      className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800 transition"
                      title="Edit post"
                    >
                      <Pencil className="h-4 w-4 text-blue-400" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="rounded-lg border border-slate-700 p-2 hover:bg-red-600/20 transition disabled:opacity-50"
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  {post.title}
                </h2>

                {/* Content */}
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="mt-6">
                  <button
                    onClick={() => navigator.clipboard.writeText(post.content)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700
                               px-4 py-2 text-sm hover:bg-slate-800 transition"
                  >
                    <Copy className="h-4 w-4 text-blue-400" />
                    Copy Content
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
