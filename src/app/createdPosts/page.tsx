"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ImageIcon, FileText, Calendar, Loader2 } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  createdAt: string;
}

export default function PostsPage() {
  //   const session = await getServerSession(authOptions);

  //   if (!session) redirect("/login");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts", {
          method: "GET",
        });

        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold tracking-tight">
            Your Generated Posts
          </h1>
          <p className="mt-2 text-slate-400">
            All AI-generated content created using Generatify
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            <span className="ml-2 text-slate-400">Loading posts...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-20 border border-slate-800 rounded-2xl bg-slate-900/40">
            <FileText className="mx-auto h-10 w-10 text-slate-500" />
            <p className="mt-4 text-slate-400">No posts created yet</p>
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg overflow-hidden hover:border-indigo-500/50 transition"
            >
              {/* Image */}
              {post.image ? (
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="h-44 flex items-center justify-center bg-slate-800">
                  <ImageIcon className="h-8 w-8 text-slate-500" />
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold line-clamp-2">
                  {post.title}
                </h3>

                <p className="mt-2 text-sm text-slate-400 line-clamp-3">
                  {post.content}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
