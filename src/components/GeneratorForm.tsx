"use client";

import React, { useEffect, useState } from "react";
import { uploadAIImage } from "../ai/upload_ai_image";
import { savePost } from "../ai/savepost";

export default function GeneratorForm() {
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
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
      console.log(data);
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
    <main className="min-h-screen bg-gradient-to-br from-amber-900 to-amber-700 px-4 py-10 text-amber-50">
      <section className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            AI Social Media Post Generator
          </h1>
          <p className="mt-3 text-amber-200 text-lg">
            Generate captions and images using Generative AI
          </p>
        </header>

        {/* Input Card */}
        <div className="rounded-2xl bg-amber-50 p-6 shadow-lg text-amber-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold mb-1">Topic</label>
              <input
                type="text"
                className="w-full rounded-md border border-amber-300 px-4 py-2 text-base outline-none focus:ring-2 focus:ring-amber-400"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Platform
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-amber-300 px-4 py-2 text-base outline-none focus:ring-2 focus:ring-amber-400"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Target Audience
              </label>
              <input
                type="text"
                className="w-full rounded-md border border-amber-300 px-4 py-2 text-base outline-none focus:ring-2 focus:ring-amber-400"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-semibold mb-1">Tone</label>
              <input
                type="text"
                className="w-full rounded-md border border-amber-300 px-4 py-2 text-base outline-none focus:ring-2 focus:ring-amber-400"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>
          </div>

          {/* Emoji Toggle */}
          <div className="mt-6 flex items-center justify-between">
            <label className="text-sm font-medium">
              Include emojis in caption
            </label>
            <input
              type="checkbox"
              className="h-5 w-5 cursor-pointer accent-amber-600"
              checked={emojis}
              onChange={(e) => setEmojis(e.target.checked)}
            />
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateAndSave}
              disabled={isGeneratingPost}
              className="flex-1 rounded-lg bg-amber-600 cursor-pointer px-6 py-3 text-white font-semibold
             hover:bg-amber-700 transition
             disabled:opacity-60 disabled:cursor-not-allowed
             flex items-center justify-center gap-2"
            >
              {isGeneratingPost && (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isGeneratingPost ? "Generating..." : "Generate Post"}
            </button>
          </div>
        </div>

        {/* Output Section */}
        {post && (
          <section className="mt-12 flex flex-col items-center justify-center max-w-[500px] mx-auto">
            {/* Text Output */}
            {post.image && (
              <img
                // src={`data:image/png;base64,${post.image}`}
                src={post.image}
                alt="Generated visual"
                className="rounded-t-xl shadow-lg max-h-[300px] w-full object-fill"
              />
            )}
            <article className="rounded-b-xl bg-white p-6 shadow text-amber-900">
              <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
              <p className="leading-relaxed whitespace-pre-line">
                {post.content}
              </p>
            </article>

            {/* Image Output */}
          </section>
        )}
      </section>
    </main>
  );
}
