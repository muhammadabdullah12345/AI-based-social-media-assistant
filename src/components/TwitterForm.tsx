"use client";

import React, { useState } from "react";
import { savePost } from "@/src/ai/savepost";
import { Loader2, Sparkles, Twitter, History, Hash, List } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TwitterForm() {
  const [isGenerating, setIsGenerating] = useState(false);

  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("engagement");
  const [tone, setTone] = useState("bold");
  const [isThread, setIsThread] = useState(false);
  const [hashtagLevel, setHashtagLevel] = useState(1);

  const [post, setPost] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const platform = "twitter";

  const hashtagStatus =
    hashtagLevel === 0
      ? "no hashtags"
      : hashtagLevel === 1
        ? "few hashtags"
        : "trending hashtags";

  async function generatePost() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          platform,
          goal,
          isThread,
          hashtagStatus,
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
    const generatedPost = await generatePost();
    if (!generatedPost) return;

    await savePost(generatedPost.title, generatedPost.content, null, platform);

    alert("Twitter post saved successfully!");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-sky-500/20 p-3">
              <Twitter className="h-7 w-7 text-sky-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Twitter Content Studio</h1>
              <p className="text-slate-400 text-sm mt-1">
                Craft concise, high-impact tweets built for engagement
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/twitter/history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800
              bg-slate-900 px-5 py-3 text-sm text-slate-200
              hover:bg-slate-800 transition"
          >
            <History className="h-4 w-4 text-sky-400" />
            View Tweet History
          </Link>
        </header>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* Tweet Idea */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
              <h2 className="text-lg font-semibold mb-6">1. Tweet Idea</h2>

              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                placeholder="e.g. Why most developers fail interviews despite good skills"
              />
            </div>

            {/* Strategy */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
              <h2 className="text-lg font-semibold mb-6">
                2. Strategy & Style
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-slate-300">Post Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                  >
                    <option value="engagement">Max Engagement</option>
                    <option value="education">Educate</option>
                    <option value="opinion">Bold Opinion</option>
                    <option value="promotion">Promotional</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300">Writing Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                  >
                    <option value="bold">Bold</option>
                    <option value="witty">Witty</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Twitter Mechanics */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
              <h2 className="text-lg font-semibold mb-4">
                3. Twitter Mechanics
              </h2>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <List className="h-4 w-4 text-sky-400" />
                  Thread Format
                </div>

                <button
                  onClick={() => setIsThread(!isThread)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    isThread
                      ? "bg-sky-500 text-black"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {isThread ? "Enabled" : "Disabled"}
                </button>
              </div>

              <div>
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Hashtag Density
                </label>

                <input
                  type="range"
                  min={0}
                  max={2}
                  value={hashtagLevel}
                  onChange={(e) => setHashtagLevel(Number(e.target.value))}
                  className="w-full mt-4"
                />

                <div className="mt-2 text-xs text-slate-400">
                  {["None", "Few relevant", "Trending-heavy"][hashtagLevel]}
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={generateAndSave}
              disabled={isGenerating}
              className="w-full rounded-2xl bg-sky-500 hover:bg-sky-400 transition py-4
                font-medium flex items-center justify-center gap-2 text-lg text-black"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" />
                  Generating Tweet...
                </>
              ) : (
                <>
                  <Sparkles />
                  Generate & Save Tweet
                </>
              )}
            </button>
          </motion.div>

          {/* Preview */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="sticky top-24 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="p-4 border-b border-slate-800 text-sm text-slate-300">
                Twitter Preview
              </div>

              {post ? (
                <div className="p-5 text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  {post.content}
                </div>
              ) : (
                <div className="p-6 text-slate-500 text-sm">
                  Generated tweet preview will appear here.
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}
