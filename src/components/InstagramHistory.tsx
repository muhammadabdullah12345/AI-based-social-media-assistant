// src/components/InstagramHistory.tsx
"use client";

import { useEffect, useState } from "react";
import { Instagram, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Trash2, Edit, Send } from "lucide-react";
import { deletePost } from "@/src/ai/postActions";
import { useRouter } from "next/navigation";
import PublishModal from "./PublishModal";
import PostStatusBadge from "./PostStatusBadge";

type Post = {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
  status?: string;
  scheduledAt?: string;
  publishedAt?: string;
};

export default function InstagramPostHistory() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingPost, setPublishingPost] = useState<Post | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

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

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete post");
    }
  }

  function handlePublished() {
    fetchPosts(); // Refresh list to show updated status
    setPublishingPost(null);
  }

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

        {loading && (
          <div className="text-center text-slate-400 mt-20">
            Loading your Instagram posts...
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="mt-20 flex flex-col items-center text-center text-slate-400">
            <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No Instagram posts yet</p>
            <p className="text-sm mt-1">
              Generate your first post to see it here.
            </p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden hover:shadow-xl transition flex flex-col"
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-56 object-cover"
                  />
                )}

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-pink-400 font-medium">
                      Instagram
                    </span>
                    <div className="flex items-center gap-2">
                      <PostStatusBadge
                        status={(post.status ?? "draft") as any}
                      />
                      <span className="text-xs text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {post.scheduledAt && post.status === "scheduled" && (
                    <p className="text-xs text-blue-400 mb-2">
                      Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                    </p>
                  )}

                  <p className="text-sm text-slate-300 line-clamp-4 whitespace-pre-line flex-1">
                    {post.content}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/instagram/edit/${post.id}`)
                      }
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 text-xs py-2 flex items-center justify-center gap-1"
                    >
                      <Edit size={14} /> Edit
                    </button>

                    <button
                      onClick={() => setPublishingPost(post)}
                      disabled={post.status === "published"}
                      className="rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs py-2 flex items-center justify-center gap-1"
                    >
                      <Send size={14} />
                      {post.status === "published" ? "Published" : "Publish"}
                    </button>

                    <button
                      onClick={() => handleDelete(post.id)}
                      className="rounded-lg bg-red-600 hover:bg-red-500 text-xs py-2 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Publish Modal */}
      {publishingPost && (
        <PublishModal
          postId={publishingPost.id}
          platform="instagram"
          isOpen={!!publishingPost}
          onClose={() => setPublishingPost(null)}
          onPublished={handlePublished}
        />
      )}
    </main>
  );
}
