"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { updatePost } from "@/src/ai/postActions";

export default function EditLinkedinPost() {
  const { id } = useParams();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      setTitle(data.title);
      setContent(data.content);
      setImage(data.image);
      setLoading(false);
    }
    fetchPost();
  }, [id]);

  async function handleUpdate() {
    try {
      await updatePost(id as string, { title, content, image });
      alert("Post updated successfully!");
      router.push("/dashboard/linkedin/history");
    } catch (error) {
      alert("Failed to update post");
    }
  }

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Edit Linkedin Post</h1>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3"
        />

        <button
          onClick={handleUpdate}
          className="w-full bg-pink-600 hover:bg-pink-500 py-3 rounded-xl"
        >
          Update Post
        </button>
      </div>
    </main>
  );
}
