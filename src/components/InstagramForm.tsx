"use client";

import React, { useState } from "react";
import { uploadAIImage } from "@/src/ai/upload_ai_image";
import { savePost } from "@/src/ai/savepost";
import {
  Loader2,
  Sparkles,
  Instagram,
  History,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type GeneratedPost = {
  title: string;
  content: string;
  image?: string;
};

export default function InstagramForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("casual");
  const [emojiLevel, setEmojiLevel] = useState(2);

  const [postOptions, setPostOptions] = useState<GeneratedPost[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const platform = "instagram";

  const emojiStatus =
    emojiLevel === 0
      ? "not add"
      : emojiLevel === 1
        ? "add few"
        : emojiLevel === 2
          ? "add moderate"
          : "add many";

  async function generatePosts() {
    if (!topic || !targetAudience) {
      alert("Please fill topic and target audience");
      return;
    }

    setIsGenerating(true);
    setPostOptions([]);
    setSelectedIndex(null);

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetAudience,
          tone,
          platform,
          emojiStatus,
        }),
      });

      const data = await res.json();
      setPostOptions(data.posts);
      setSelectedIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveSelectedPost() {
    if (selectedIndex === null) {
      alert("Please select one post");
      return;
    }

    const selectedPost = postOptions[selectedIndex];
    setIsSaving(true);

    try {
      const imageUrl = await uploadAIImage(selectedPost.image!);

      await savePost(
        selectedPost.title,
        selectedPost.content,
        imageUrl,
        platform,
      );

      alert("Instagram post saved successfully!");
      setPostOptions([]);
      setSelectedIndex(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-950 via-purple-950 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-pink-600/20 p-3">
              <Instagram className="h-7 w-7 text-pink-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Instagram Content Studio</h1>
              <p className="text-slate-400 text-sm mt-1">
                Generate AI captions and pick the best one
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/instagram/history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm hover:bg-slate-800 transition"
          >
            <History className="h-4 w-4 text-pink-500" />
            View History
          </Link>
        </header>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
            <h2 className="text-lg font-semibold mb-6">Content Intent</h2>

            <label className="text-sm text-slate-300">
              What is this post about?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
              placeholder="e.g. Aesthetic travel reel in northern Pakistan"
            />
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
            <h2 className="text-lg font-semibold mb-6">Audience & Style</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-300">
                  Target Audience
                </label>
                <input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                  placeholder="Travel lovers, creators, students"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Caption Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                >
                  <option value="casual">Casual</option>
                  <option value="fun">Fun</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
            <h2 className="text-lg font-semibold mb-4">Emoji Intensity</h2>

            <input
              type="range"
              min={0}
              max={3}
              value={emojiLevel}
              onChange={(e) => setEmojiLevel(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-2 text-xs text-slate-400">
              {
                ["No emojis", "Minimal", "Balanced", "Highly expressive"][
                  emojiLevel
                ]
              }
            </p>
          </div>

          <button
            onClick={generatePosts}
            disabled={isGenerating}
            className="w-full rounded-2xl bg-pink-600 hover:bg-pink-500 py-4 text-lg font-medium flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles />
                Generate 3 Variations
              </>
            )}
          </button>
        </motion.div>

        {/* GENERATED POSTS */}
        {postOptions.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold mb-6">
              Choose the best caption ✨
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {postOptions.map((post, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative cursor-pointer rounded-2xl border overflow-hidden transition
                    ${
                      selectedIndex === index
                        ? "border-pink-500 ring-2 ring-pink-500/40 bg-pink-500/10"
                        : "border-slate-800 bg-slate-900 hover:bg-slate-800"
                    }
                  `}
                >
                  {post.image && (
                    <img
                      src={post.image}
                      className="h-44 w-full object-cover"
                    />
                  )}

                  <div className="p-5 text-sm whitespace-pre-line text-slate-200">
                    {post.content}
                  </div>

                  {selectedIndex === index && (
                    <div className="absolute top-3 right-3 bg-pink-600 rounded-full p-1">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* SAVE BUTTON */}
            <div className="sticky bottom-6 mt-10">
              <button
                onClick={saveSelectedPost}
                disabled={isSaving || selectedIndex === null}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-4 text-lg font-medium flex justify-center items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle />
                    Save Selected Post
                  </>
                )}
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
