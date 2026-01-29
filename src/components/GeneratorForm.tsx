"use client";

import React, { useEffect, useState } from "react";
import { uploadAIImage } from "../ai/upload_ai_image";
import { savePost } from "../ai/savepost";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function GeneratorForm() {
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [topic, setTopic] = useState("travelling");
  const [platform, setPlatform] = useState("instagram");
  const [targetAudience, setTargetAudience] = useState("normal people");
  const [tone, setTone] = useState("professional");
  const [emojis, setEmojis] = useState(false);
  const [emojiStatus, setEmojiStatus] = useState("");
  const [post, setPost] = useState<{
    title: string;
    content: string;
    image_prompt: string;
    image?: string;
  } | null>(null);

  async function handleGeneratePost() {
    try {
      setIsGeneratingPost(true);

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
    } catch (error) {
      console.error("Post generation failed", error);
    } finally {
      setIsGeneratingPost(false);
    }
  }

  const handleGenerateAndSave = async () => {
    try {
      const generatedPost = await handleGeneratePost();
      const cloudinaryImageUrl = await uploadAIImage(generatedPost.image);
      await savePost(
        generatedPost.title,
        generatedPost.content,
        cloudinaryImageUrl,
      );
      alert("Post saved successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setEmojiStatus(emojis ? "add" : "not add");
  }, [emojis]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12 text-slate-100">
      <section className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            AI Post Generator
          </h1>
          <p className="mt-3 text-slate-400 text-lg">
            Generate captions and visuals using Generative AI
          </p>
        </header>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 p-8 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topic */}
            <div>
              <label className="block text-sm mb-2 text-slate-300">Topic</label>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm
                placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm mb-2 text-slate-300">
                Platform
              </label>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm
                placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm mb-2 text-slate-300">
                Target Audience
              </label>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm
                placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm mb-2 text-slate-300">Tone</label>
              <input
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm
                placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>
          </div>

          {/* Emoji Toggle */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-slate-300">
              Include emojis in caption
            </span>
            <input
              type="checkbox"
              checked={emojis}
              onChange={(e) => setEmojis(e.target.checked)}
              className="h-5 w-5 accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Button */}
          <div className="mt-8">
            <button
              onClick={handleGenerateAndSave}
              disabled={isGeneratingPost}
              className="cursor-pointer w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 transition py-3 font-medium
              flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isGeneratingPost ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate & Save Post
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Output */}
        {post && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 max-w-xl mx-auto"
          >
            {post.image && (
              <img
                src={post.image}
                alt="Generated"
                className="rounded-t-2xl w-full max-h-[300px] object-cover border border-slate-800"
              />
            )}

            <div className="rounded-b-2xl bg-slate-900 border border-t-0 border-slate-800 p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-3">{post.title}</h2>
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                {post.content}
              </p>
            </div>
          </motion.section>
        )}
      </section>
    </main>
  );
}
