"use client";

import React, { useState, useRef } from "react";
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
  FileText,
  UploadCloud,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type GeneratedPost = {
  title: string;
  content: string;
  image?: string;
};

type Mode = "form" | "document";

export default function FacebookForm() {
  const [mode, setMode] = useState<Mode>("form");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form mode state
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("friendly");
  const [cta, setCTA] = useState("comment");
  const [postLength, setPostLength] = useState("medium");
  const [emojiLevel, setEmojiLevel] = useState(1);

  // Document mode state
  const [file, setFile] = useState<File | null>(null);
  const [docTone, setDocTone] = useState("friendly");
  const [docCta, setDocCta] = useState("comment");
  const [docPostLength, setDocPostLength] = useState("medium");
  const [docEmojiLevel, setDocEmojiLevel] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared state
  const [postOptions, setPostOptions] = useState<GeneratedPost[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentSourceType, setCurrentSourceType] = useState<
    "form" | "document"
  >("form");
  const [currentDocumentId, setCurrentDocumentId] = useState<
    string | undefined
  >(undefined);

  const platform = "facebook";

  const getEmojiStatus = (level: number) =>
    level === 0 ? "not add" : level === 1 ? "add few" : "add moderate";

  const emojiLabels = ["None", "Few", "Moderate"];

  // ── FORM GENERATE ──────────────────────────────────────────────────
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
          emojiStatus: getEmojiStatus(emojiLevel),
          cta,
          postLength,
          variations: 3,
        }),
      });
      const data = await res.json();
      setPostOptions(data.posts);
      setSelectedIndex(0);
      setCurrentSourceType("form");
      setCurrentDocumentId(undefined);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  // ── DOCUMENT GENERATE ──────────────────────────────────────────────
  async function generateFromDocument() {
    if (!file) {
      alert("Please upload a document first");
      return;
    }
    setIsUploading(true);
    setIsGenerating(true);
    setPostOptions([]);
    setSelectedIndex(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Document upload failed");
      const { documentId } = await uploadRes.json();
      setIsUploading(false);

      const genRes = await fetch("/api/generate-post-from-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          tone: docTone,
          platform,
          emojiStatus: getEmojiStatus(docEmojiLevel),
          cta: docCta,
          postLength: docPostLength,
        }),
      });
      if (!genRes.ok) throw new Error("Post generation failed");
      const data = await genRes.json();
      setPostOptions(data.posts);
      setSelectedIndex(0);
      setCurrentSourceType("document");
      setCurrentDocumentId(documentId);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsUploading(false);
      setIsGenerating(false);
    }
  }

  // ── SAVE ───────────────────────────────────────────────────────────
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
        currentSourceType,
        currentDocumentId,
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

  const isLoading = isGenerating || isUploading;

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
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm hover:bg-slate-800 transition"
          >
            <History className="h-4 w-4 text-blue-400" />
            View History
          </Link>
        </header>

        {/* MODE TOGGLE */}
        <div className="mb-8 flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-2 w-fit">
          <button
            onClick={() => {
              setMode("form");
              setPostOptions([]);
              setSelectedIndex(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              mode === "form"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PenLine className="h-4 w-4" />
            Write Manually
          </button>
          <button
            onClick={() => {
              setMode("document");
              setPostOptions([]);
              setSelectedIndex(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${
              mode === "document"
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="h-4 w-4" />
            From Document
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── FORM MODE ── */}
          {mode === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
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
                    {emojiLabels[emojiLevel]}
                  </div>
                </div>
              </div>

              <button
                onClick={generatePosts}
                disabled={isLoading}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 transition py-4 font-medium flex items-center justify-center gap-2 text-lg disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" /> Generating
                    Variations...
                  </>
                ) : (
                  <>
                    <Sparkles /> Generate 3 Variations
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* ── DOCUMENT MODE ── */}
          {mode === "document" && (
            <motion.div
              key="document"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* File Upload */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
                <h2 className="text-lg font-semibold mb-2">Upload Document</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Upload a PDF, DOCX, or TXT file — AI will generate Facebook
                  posts based on its content.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                  }}
                  className="hidden"
                />
                {!file ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl py-12 flex flex-col items-center gap-3 text-slate-400 hover:text-blue-400 transition"
                  >
                    <UploadCloud className="h-10 w-10" />
                    <span className="text-sm font-medium">
                      Click to upload a file
                    </span>
                    <span className="text-xs text-slate-500">
                      PDF, DOCX, TXT supported
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-700 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-slate-500 hover:text-red-400 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Style Options */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 space-y-6">
                <h2 className="text-lg font-semibold">Post Style</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <select
                    value={docTone}
                    onChange={(e) => setDocTone(e.target.value)}
                    className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="storytelling">Storytelling</option>
                    <option value="motivational">Motivational</option>
                  </select>
                  <select
                    value={docCta}
                    onChange={(e) => setDocCta(e.target.value)}
                    className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                  >
                    <option value="comment">Encourage Comments</option>
                    <option value="share">Encourage Sharing</option>
                    <option value="join">Invite to Community</option>
                    <option value="react">Ask for Reactions</option>
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-6 items-start">
                  <select
                    value={docPostLength}
                    onChange={(e) => setDocPostLength(e.target.value)}
                    className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long Story</option>
                  </select>
                  <div>
                    <label className="text-sm text-slate-300 flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-blue-400" />
                      Emoji Usage
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      value={docEmojiLevel}
                      onChange={(e) => setDocEmojiLevel(Number(e.target.value))}
                      className="w-full mt-3"
                    />
                    <div className="mt-2 text-xs text-slate-400">
                      {emojiLabels[docEmojiLevel]}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={generateFromDocument}
                disabled={isLoading || !file}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-500 transition py-4 font-medium flex items-center justify-center gap-2 text-lg disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" /> Uploading document...
                  </>
                ) : isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" /> Generating posts...
                  </>
                ) : (
                  <>
                    <Sparkles /> Generate 3 Variations from Document
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
                    }`}
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

            <div className="sticky bottom-6 mt-10">
              <button
                onClick={saveSelectedPost}
                disabled={isSaving || selectedIndex === null}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-4 text-lg font-medium flex justify-center items-center gap-2 disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle /> Save Selected Post
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
