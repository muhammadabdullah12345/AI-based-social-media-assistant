"use client";

import React, { useState } from "react";
import { uploadAIImage } from "@/src/ai/upload_ai_image";
import { savePost } from "@/src/ai/savepost";
import {
  Loader2,
  Sparkles,
  Facebook,
  History,
  Megaphone,
  CheckCircle,
  PenLine,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type GeneratedPost = {
  title: string;
  content: string;
  image?: string;
};

export default function FacebookForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Inputs
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("friendly");
  const [cta, setCTA] = useState("comment");
  const [postLength, setPostLength] = useState("medium");
  const [emojiLevel, setEmojiLevel] = useState(1);

  // Generated posts
  const [postOptions, setPostOptions] = useState<GeneratedPost[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const platform = "facebook";

  const emojiStatus =
    emojiLevel === 0
      ? "not add"
      : emojiLevel === 1
        ? "add few"
        : "add moderate";

  // 🔹 Generate 3 variations
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
          cta,
          postLength,
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

  // 🔹 Save selected post
  async function saveSelectedPost() {
    if (selectedIndex === null) {
      alert("Please select one post to save");
      return;
    }

    const selectedPost = postOptions[selectedIndex];
    setIsSaving(true);

    try {
      const cloudinaryUrl = selectedPost.image
        ? await uploadAIImage(selectedPost.image)
        : null;

      await savePost(
        selectedPost.title,
        selectedPost.content,
        cloudinaryUrl,
        platform,
      );

      alert("Facebook post saved successfully!");
      setPostOptions([]);
      setSelectedIndex(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-600/20 p-3">
              <Facebook className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Facebook Content Studio</h1>
              <p className="text-slate-400 text-sm mt-1">
                Generate multiple Facebook posts and select the best one
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/facebook/history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800
                       bg-slate-900 px-5 py-3 text-sm hover:bg-slate-800 transition"
          >
            <History className="h-4 w-4 text-blue-400" />
            View History
          </Link>
        </header>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Topic */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-4">
              <PenLine className="text-blue-400" />
              <h2 className="text-lg font-semibold">Post Idea</h2>
            </div>

            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={4}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
              placeholder="e.g. Sharing a motivational story about consistency"
            />
          </div>

          {/* Audience & Tone */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                placeholder="Students, entrepreneurs, local community"
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

          {/* Engagement Strategy */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 space-y-6">
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

            <div>
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-blue-400" />
                Emoji Usage
              </label>

              <input
                type="range"
                min={0}
                max={2}
                value={emojiLevel}
                onChange={(e) => setEmojiLevel(Number(e.target.value))}
                className="w-full mt-3"
              />

              <div className="mt-2 text-xs text-slate-400">
                {["None", "Few", "Moderate"][emojiLevel]}
              </div>
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={generatePosts}
            disabled={isGenerating}
            className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 transition py-4
                       font-medium flex items-center justify-center gap-2 text-lg"
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
              Choose the strongest Facebook post 📘
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
                        ? "border-blue-500 ring-2 ring-blue-500/40 bg-blue-500/10"
                        : "border-slate-800 bg-slate-900 hover:bg-slate-800"
                    }
                  `}
                >
                  {post.image && (
                    <img
                      src={post.image}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}

                  <div className="text-sm whitespace-pre-line leading-relaxed text-slate-200">
                    {post.content}
                  </div>

                  {selectedIndex === index && (
                    <div className="absolute top-3 right-3 bg-blue-600 rounded-full p-1">
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
