"use client";

import React, { useState } from "react";
import { uploadAIImage } from "@/src/ai/upload_ai_image";
import { savePost } from "@/src/ai/savepost";
import {
  Loader2,
  Sparkles,
  Linkedin,
  History,
  Target,
  Users,
  PenLine,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LinkedinForm() {
  const [isGenerating, setIsGenerating] = useState(false);

  // LinkedIn-specific inputs
  const [topic, setTopic] = useState("");
  const [audienceRole, setAudienceRole] = useState("");
  const [tone, setTone] = useState("professional");
  const [postGoal, setPostGoal] = useState("thought-leadership");

  const [post, setPost] = useState<{
    title: string;
    content: string;
    image?: string;
  } | null>(null);

  const platform = "linkedin";

  async function generatePost() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetAudience: audienceRole,
          tone,
          platform,
          postGoal,
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

      const cloudinaryUrl = generatedPost.image
        ? await uploadAIImage(generatedPost.image)
        : null;

      await savePost(
        generatedPost.title,
        generatedPost.content,
        cloudinaryUrl,
        platform,
      );

      alert("LinkedIn post saved successfully!");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-600/20 p-3">
              <Linkedin className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">LinkedIn Content Studio</h1>
              <p className="text-slate-400 text-sm mt-1">
                Craft professional posts that build authority and engagement
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/linkedin/history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800
                       bg-slate-900 px-5 py-3 text-sm hover:bg-slate-800 transition"
          >
            <History className="h-4 w-4 text-blue-500" />
            View Post History
          </Link>
        </header>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* LEFT — Strategy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-8"
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
                placeholder="e.g. What I learned after building my first AI-powered product"
              />
            </div>

            {/* Audience & Goal */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <label className="text-sm text-slate-300">
                      Target Audience (Roles / Industry)
                    </label>
                  </div>
                  <input
                    value={audienceRole}
                    onChange={(e) => setAudienceRole(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                    placeholder="Recruiters, founders, software engineers"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-400" />
                    <label className="text-sm text-slate-300">
                      Post Objective
                    </label>
                  </div>
                  <select
                    value={postGoal}
                    onChange={(e) => setPostGoal(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                  >
                    <option value="thought-leadership">
                      Thought Leadership
                    </option>
                    <option value="career-growth">Career Growth</option>
                    <option value="announcement">Announcement</option>
                    <option value="storytelling">Personal Story</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tone */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
              <label className="text-sm text-slate-300 mb-2 block">
                Writing Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
              >
                <option value="professional">Professional</option>
                <option value="authoritative">Authoritative</option>
                <option value="conversational">Conversational</option>
                <option value="inspirational">Inspirational</option>
              </select>
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
                  Creating LinkedIn Post...
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
                LinkedIn Post Preview
              </div>

              {post ? (
                <div className="p-6 text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                  {post.content}
                </div>
              ) : (
                <div className="p-6 text-slate-500 text-sm">
                  Your LinkedIn post preview will appear here.
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}
