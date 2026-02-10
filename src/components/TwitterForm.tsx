"use client";

import React, { useState } from "react";
import { savePost } from "@/src/ai/savepost";
import {
  Loader2,
  Sparkles,
  Twitter,
  History,
  Hash,
  List,
  PenLine,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type GeneratedPost = {
  title: string;
  content: string;
};

export default function TwitterForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Inputs
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("bold");
  const [goal, setGoal] = useState("engagement");
  const [isThread, setIsThread] = useState(false);
  const [hashtagLevel, setHashtagLevel] = useState(1);

  // Generated posts
  const [postOptions, setPostOptions] = useState<GeneratedPost[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const platform = "twitter";

  const hashtagStatus =
    hashtagLevel === 0
      ? "no hashtags"
      : hashtagLevel === 1
        ? "few hashtags"
        : "trending hashtags";

  // 🔹 Generate 3 tweet variations
  async function generatePosts() {
    if (!topic) {
      alert("Please enter a tweet idea");
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
          tone,
          goal,
          platform,
          isThread,
          hashtagStatus,
          variations: 3,
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

  // 🔹 Save selected tweet
  async function saveSelectedPost() {
    if (selectedIndex === null) {
      alert("Please select one tweet to save");
      return;
    }

    const selectedPost = postOptions[selectedIndex];
    setIsSaving(true);

    try {
      await savePost(selectedPost.title, selectedPost.content, "", platform);

      alert("Twitter post saved successfully!");
      setPostOptions([]);
      setSelectedIndex(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-sky-500/20 p-3">
              <Twitter className="h-7 w-7 text-sky-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Twitter Content Studio</h1>
              <p className="text-slate-400 text-sm mt-1">
                Generate multiple tweet variations and pick the best one
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/twitter/history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800
                       bg-slate-900 px-5 py-3 text-sm hover:bg-slate-800 transition"
          >
            <History className="h-4 w-4 text-sky-400" />
            View History
          </Link>
        </header>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Tweet Idea */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-4">
              <PenLine className="text-sky-400" />
              <h2 className="text-lg font-semibold">Tweet Idea</h2>
            </div>

            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
              placeholder="e.g. Why most developers fail interviews despite strong skills"
            />
          </div>

          {/* Goal & Tone */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Tweet Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                >
                  <option value="engagement">Max Engagement</option>
                  <option value="education">Educate</option>
                  <option value="opinion">Bold Opinion</option>
                  <option value="promotion">Promotional</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Writing Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
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
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 space-y-6">
            <div className="flex items-center justify-between">
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

          {/* Generate */}
          <button
            onClick={generatePosts}
            disabled={isGenerating}
            className="w-full rounded-2xl bg-sky-500 hover:bg-sky-400 transition py-4
                       font-medium flex items-center justify-center gap-2 text-lg text-black"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" />
                Generating Variations...
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
              Choose the strongest tweet 🐦
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {postOptions.map((post, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative cursor-pointer rounded-2xl border p-6 transition
                    ${
                      selectedIndex === index
                        ? "border-sky-500 ring-2 ring-sky-500/40 bg-sky-500/10"
                        : "border-slate-800 bg-slate-900 hover:bg-slate-800"
                    }
                  `}
                >
                  <div className="text-sm whitespace-pre-line leading-relaxed text-slate-200">
                    {post.content}
                  </div>

                  {selectedIndex === index && (
                    <div className="absolute top-3 right-3 bg-sky-500 rounded-full p-1 text-black">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* SAVE */}
            <div className="sticky bottom-6 mt-10">
              <button
                onClick={saveSelectedPost}
                disabled={isSaving || selectedIndex === null}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-4
                           text-lg font-medium flex justify-center items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle />
                    Save Selected Tweet
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
