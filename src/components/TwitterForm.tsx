"use client";

import React, { useState, useRef } from "react";
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
  FileText,
  UploadCloud,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type GeneratedPost = {
  title: string;
  content: string;
};

type Mode = "form" | "document";

export default function TwitterForm() {
  const [mode, setMode] = useState<Mode>("form");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form mode state
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("bold");
  const [goal, setGoal] = useState("engagement");
  const [isThread, setIsThread] = useState(false);
  const [hashtagLevel, setHashtagLevel] = useState(1);

  // Document mode state
  const [file, setFile] = useState<File | null>(null);
  const [docTone, setDocTone] = useState("bold");
  const [docGoal, setDocGoal] = useState("engagement");
  const [docIsThread, setDocIsThread] = useState(false);
  const [docHashtagLevel, setDocHashtagLevel] = useState(1);
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

  const platform = "twitter";

  const getHashtagStatus = (level: number) =>
    level === 0
      ? "no hashtags"
      : level === 1
        ? "few hashtags"
        : "trending hashtags";

  const hashtagLabels = ["None", "Few relevant", "Trending-heavy"];

  // ── FORM GENERATE ──────────────────────────────────────────────────
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
          hashtagStatus: getHashtagStatus(hashtagLevel),
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
          goal: docGoal,
          isThread: docIsThread,
          hashtagStatus: getHashtagStatus(docHashtagLevel),
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
      alert("Please select one tweet to save");
      return;
    }
    const selectedPost = postOptions[selectedIndex];
    setIsSaving(true);

    try {
      await savePost(
        selectedPost.title,
        selectedPost.content,
        "",
        platform,
        currentSourceType,
        currentDocumentId,
      );
      alert("Twitter post saved successfully!");
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
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm hover:bg-slate-800 transition"
          >
            <History className="h-4 w-4 text-sky-400" />
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
                ? "bg-sky-500 text-black shadow-lg"
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
                ? "bg-sky-500 text-black shadow-lg"
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
                    {hashtagLabels[hashtagLevel]}
                  </div>
                </div>
              </div>

              <button
                onClick={generatePosts}
                disabled={isLoading}
                className="w-full rounded-2xl bg-sky-500 hover:bg-sky-400 transition py-4 font-medium flex items-center justify-center gap-2 text-lg text-black disabled:opacity-60"
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
                  Upload a PDF, DOCX, or TXT file — AI will generate tweet
                  variations based on its content.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                {!file ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl py-12 flex flex-col items-center gap-3 text-slate-400 hover:text-sky-400 transition"
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
                      <FileText className="h-5 w-5 text-sky-400" />
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
                <h2 className="text-lg font-semibold">Tweet Style</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">
                      Tweet Goal
                    </label>
                    <select
                      value={docGoal}
                      onChange={(e) => setDocGoal(e.target.value)}
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
                      value={docTone}
                      onChange={(e) => setDocTone(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                    >
                      <option value="bold">Bold</option>
                      <option value="witty">Witty</option>
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <List className="h-4 w-4 text-sky-400" />
                    Thread Format
                  </div>
                  <button
                    onClick={() => setDocIsThread(!docIsThread)}
                    className={`px-4 py-2 rounded-lg text-sm transition ${
                      docIsThread
                        ? "bg-sky-500 text-black"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {docIsThread ? "Enabled" : "Disabled"}
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
                    value={docHashtagLevel}
                    onChange={(e) => setDocHashtagLevel(Number(e.target.value))}
                    className="w-full mt-4"
                  />
                  <div className="mt-2 text-xs text-slate-400">
                    {hashtagLabels[docHashtagLevel]}
                  </div>
                </div>
              </div>

              <button
                onClick={generateFromDocument}
                disabled={isLoading || !file}
                className="w-full rounded-2xl bg-sky-500 hover:bg-sky-400 transition py-4 font-medium flex items-center justify-center gap-2 text-lg text-black disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" /> Uploading document...
                  </>
                ) : isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" /> Generating tweets...
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
                    }`}
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
                    <CheckCircle /> Save Selected Tweet
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
