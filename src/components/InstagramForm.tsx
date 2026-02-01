"use client";

import React, { useState } from "react";
import { uploadAIImage } from "@/src/ai/upload_ai_image";
import { savePost } from "@/src/ai/savepost";
import { Loader2, Sparkles, Instagram, History } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function InstagramForm() {
  const [isGenerating, setIsGenerating] = useState(false);

  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("casual");
  const [emojiLevel, setEmojiLevel] = useState(2);

  const [post, setPost] = useState<{
    title: string;
    content: string;
    image?: string;
  } | null>(null);

  const platform = "instagram";

  const emojiStatus =
    emojiLevel === 0
      ? "not add"
      : emojiLevel === 1
        ? "add few"
        : emojiLevel === 2
          ? "add moderate"
          : "add many";

  async function generatePost() {
    setIsGenerating(true);
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
      setPost(data);
      return data;
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function generateAndSave() {
    try {
      const generatedPost = await generatePost();
      if (!generatedPost) return;

      const cloudinaryUrl = await uploadAIImage(generatedPost.image);

      await savePost(
        generatedPost.title,
        generatedPost.content,
        cloudinaryUrl,
        platform,
      );

      alert("Instagram post saved successfully!");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-950 via-purple-950 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        {/* Page Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left: Title */}
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-pink-600/20 p-3">
              <Instagram className="h-7 w-7 text-pink-500" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">Instagram Content Studio</h1>
              <p className="text-slate-400 text-sm mt-1">
                Design captions and visuals the way Instagram expects them
              </p>
            </div>
          </div>

          {/* Right: History Navigation */}
          <Link
            href="/dashboard/instagram/history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800
               bg-slate-900 px-5 py-3 text-sm text-slate-200
               hover:bg-slate-800 transition"
          >
            <History className="h-4 w-4 text-pink-500" />
            View Post History
          </Link>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* LEFT — Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* Intent Section */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
              <h2 className="text-lg font-semibold mb-6">1. Content Intent</h2>

              <div className="space-y-5">
                <div>
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
              </div>
            </div>

            {/* Audience & Style */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
              <h2 className="text-lg font-semibold mb-6">
                2. Audience & Style
              </h2>

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

            {/* Instagram Behavior */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
              <h2 className="text-lg font-semibold mb-4">
                3. Instagram Behavior
              </h2>

              <p className="text-sm text-slate-400 mb-6">
                Control how expressive and emoji-heavy your caption should be.
              </p>

              <div>
                <label className="text-sm text-slate-300">
                  Emoji Intensity
                </label>
                <input
                  type="range"
                  min={0}
                  max={3}
                  value={emojiLevel}
                  onChange={(e) => setEmojiLevel(Number(e.target.value))}
                  className="w-full mt-4"
                />
                <div className="mt-2 text-xs text-slate-400">
                  {
                    ["No emojis", "Minimal", "Balanced", "Highly expressive"][
                      emojiLevel
                    ]
                  }
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={generateAndSave}
              disabled={isGenerating}
              className="w-full rounded-2xl bg-pink-600 hover:bg-pink-500 transition py-4 font-medium flex items-center justify-center gap-2 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating Instagram Post...
                </>
              ) : (
                <>
                  <Sparkles />
                  Generate & Save Post
                </>
              )}
            </button>
          </motion.div>

          {/* RIGHT — Preview */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="sticky top-24 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 text-sm text-slate-300">
                Instagram Preview
              </div>

              {post ? (
                <>
                  {post.image && (
                    <img src={post.image} className="w-full h-64 object-fill" />
                  )}
                  <div className="p-5 text-sm text-slate-300 whitespace-pre-line">
                    {post.content}
                  </div>
                </>
              ) : (
                <div className="p-6 text-slate-500 text-sm">
                  Your generated post preview will appear here.
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}
