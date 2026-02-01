"use client";

import React, { useState } from "react";
import { uploadAIImage } from "@/src/ai/upload_ai_image";
import { savePost } from "@/src/ai/savepost";
import { Loader2, Sparkles, Facebook, History, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FacebookForm() {
  const [isGenerating, setIsGenerating] = useState(false);

  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("friendly");
  const [cta, setCTA] = useState("comment");
  const [postLength, setPostLength] = useState("medium");
  const [emojiLevel, setEmojiLevel] = useState(1);

  const [post, setPost] = useState<{
    title: string;
    content: string;
    image?: string;
  } | null>(null);

  const platform = "facebook";

  const emojiStatus =
    emojiLevel === 0
      ? "not add"
      : emojiLevel === 1
        ? "add few"
        : "add moderate";

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
          cta,
          postLength,
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

      alert("Facebook post saved successfully!");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-600/20 p-3">
              <Facebook className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Facebook Content Studio</h1>
              <p className="text-slate-400 text-sm mt-1">
                Create engaging, community-driven Facebook posts
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/facebook/history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800
              bg-slate-900 px-5 py-3 text-sm text-slate-200
              hover:bg-slate-800 transition"
          >
            <History className="h-4 w-4 text-blue-400" />
            View Post History
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
            {/* Intent */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
              <h2 className="text-lg font-semibold mb-6">
                1. Post Intent & Topic
              </h2>

              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                placeholder="e.g. Sharing a motivational story about consistency in learning"
              />
            </div>

            {/* Audience */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
              <h2 className="text-lg font-semibold mb-6">
                2. Audience & Voice
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                  placeholder="Small business owners, students, community"
                />

                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="storytelling">Storytelling</option>
                  <option value="motivational">Motivational</option>
                </select>
              </div>
            </div>

            {/* Engagement */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
              <h2 className="text-lg font-semibold mb-4">
                3. Engagement Strategy
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <select
                  value={cta}
                  onChange={(e) => setCTA(e.target.value)}
                  className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                >
                  <option value="comment">Encourage Comments</option>
                  <option value="share">Encourage Sharing</option>
                  <option value="join">Invite to Community</option>
                  <option value="react">Ask for Reactions</option>
                </select>

                <select
                  value={postLength}
                  onChange={(e) => setPostLength(e.target.value)}
                  className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long Story</option>
                </select>
              </div>

              <div className="mt-6">
                <label className="text-sm text-slate-300">
                  Emoji Usage (Facebook prefers subtle)
                </label>
                <input
                  type="range"
                  min={0}
                  max={2}
                  value={emojiLevel}
                  onChange={(e) => setEmojiLevel(Number(e.target.value))}
                  className="w-full mt-3"
                />
              </div>
            </div>

            {/* Action */}
            <button
              onClick={generateAndSave}
              disabled={isGenerating}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 transition py-4
                font-medium flex items-center justify-center gap-2 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" />
                  Creating Facebook Post...
                </>
              ) : (
                <>
                  <Sparkles />
                  Generate & Save Post
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
            <div className="sticky top-24 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 text-sm text-slate-300 flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-blue-400" />
                Facebook Preview
              </div>

              {post ? (
                <>
                  {post.image && (
                    <img
                      src={post.image}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <div className="p-5 text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </div>
                </>
              ) : (
                <div className="p-6 text-slate-500 text-sm">
                  Your Facebook post preview will appear here.
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}
