"use client";

import React, { useEffect, useState } from "react";
import { Facebook, Calendar, ImageIcon, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
};

export default function FacebookHistoryPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/posts?platform=facebook");
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

  async function handleDelete(postId: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this Facebook post?",
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert("Failed to delete post");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900 px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-12 flex items-center gap-4">
          <div className="rounded-xl bg-blue-600/20 p-3">
            <Facebook className="h-7 w-7 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Facebook Post History</h1>
            <p className="text-slate-400 text-sm mt-1">
              Your previously generated Facebook posts
            </p>
          </div>
        </header>

        {/* Loading */}
        {loading && <p className="text-slate-400 text-sm">Loading posts...</p>}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-10 text-center">
            <p className="text-slate-300 text-lg font-medium">
              No Facebook posts yet
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Generate your first Facebook post to see it here.
            </p>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg"
            >
              {/* Image */}
              {post.image ? (
                <img
                  src={post.image}
                  alt="Post visual"
                  className="w-full h-72 object-cover"
                />
              ) : (
                <div className="h-48 flex items-center justify-center bg-slate-950 border-b border-slate-800">
                  <ImageIcon className="h-8 w-8 text-slate-600" />
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white">
                  {post.title}
                </h2>

                <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {post.content}
                </p>

                {/* Meta + Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.createdAt).toLocaleString()}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/facebook/edit/${post.id}`)
                      }
                      className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs"
                    >
                      <Edit size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(post.id)}
                      className="flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  );
}
