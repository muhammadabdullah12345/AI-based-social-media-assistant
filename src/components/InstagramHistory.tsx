"use client";

import { useEffect, useState } from "react";
import { Instagram, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

type Post = {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
};

export default function InstagramPostHistory() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/posts?platform=instagram");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-950 via-purple-950 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-pink-600/20 p-3">
              <Instagram className="h-7 w-7 text-pink-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Instagram Post History</h1>
              <p className="text-slate-400 text-sm mt-1">
                All AI-generated Instagram posts in one place
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            Total Posts:{" "}
            <span className="text-white font-medium">{posts.length}</span>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-slate-400 mt-20">
            Loading your Instagram posts...
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="mt-20 flex flex-col items-center text-center text-slate-400">
            <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No Instagram posts yet</p>
            <p className="text-sm mt-1">
              Generate your first post to see it here.
            </p>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden hover:shadow-xl transition"
              >
                {/* Image */}
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-56 object-cover"
                  />
                )}

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-pink-400 font-medium">
                      Instagram
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 line-clamp-4 whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex gap-3">
                    <button className="flex-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs py-2">
                      View
                    </button>
                    <button className="flex-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-xs py-2">
                      Reuse
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
}
