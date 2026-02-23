// "use client";

// import React, { useState } from "react";
// import { uploadAIImage } from "@/src/ai/upload_ai_image";
// import { savePost } from "@/src/ai/savepost";
// import {
//   Loader2,
//   Sparkles,
//   Instagram,
//   History,
//   CheckCircle,
// } from "lucide-react";
// import { motion } from "framer-motion";
// import Link from "next/link";

// type GeneratedPost = {
//   title: string;
//   content: string;
//   image?: string;
// };

// export default function InstagramForm() {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);

//   const [topic, setTopic] = useState("");
//   const [targetAudience, setTargetAudience] = useState("");
//   const [tone, setTone] = useState("casual");
//   const [emojiLevel, setEmojiLevel] = useState(2);

//   const [postOptions, setPostOptions] = useState<GeneratedPost[]>([]);
//   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

//   const platform = "instagram";

//   const emojiStatus =
//     emojiLevel === 0
//       ? "not add"
//       : emojiLevel === 1
//         ? "add few"
//         : emojiLevel === 2
//           ? "add moderate"
//           : "add many";

//   async function generatePosts() {
//     if (!topic || !targetAudience) {
//       alert("Please fill topic and target audience");
//       return;
//     }

//     setIsGenerating(true);
//     setPostOptions([]);
//     setSelectedIndex(null);

//     try {
//       const res = await fetch("/api/generate-post", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           topic,
//           targetAudience,
//           tone,
//           platform,
//           emojiStatus,
//         }),
//       });

//       const data = await res.json();
//       setPostOptions(data.posts);
//       setSelectedIndex(0);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsGenerating(false);
//     }
//   }

//   async function saveSelectedPost() {
//     if (selectedIndex === null) {
//       alert("Please select one post");
//       return;
//     }

//     const selectedPost = postOptions[selectedIndex];
//     setIsSaving(true);

//     try {
//       const imageUrl = await uploadAIImage(selectedPost.image!);

//       await savePost(
//         selectedPost.title,
//         selectedPost.content,
//         imageUrl,
//         platform,
//       );

//       alert("Instagram post saved successfully!");
//       setPostOptions([]);
//       setSelectedIndex(null);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-pink-950 via-purple-950 to-slate-950 px-6 py-12 text-white">
//       <section className="mx-auto max-w-6xl">
//         {/* HEADER */}
//         <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
//           <div className="flex items-center gap-4">
//             <div className="rounded-xl bg-pink-600/20 p-3">
//               <Instagram className="h-7 w-7 text-pink-500" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold">Instagram Content Studio</h1>
//               <p className="text-slate-400 text-sm mt-1">
//                 Generate AI captions and pick the best one
//               </p>
//             </div>
//           </div>

//           <Link
//             href="/dashboard/instagram/history"
//             className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm hover:bg-slate-800 transition"
//           >
//             <History className="h-4 w-4 text-pink-500" />
//             View History
//           </Link>
//         </header>

//         {/* FORM */}
//         <motion.div
//           initial={{ opacity: 0, y: 15 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="space-y-8"
//         >
//           <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
//             <h2 className="text-lg font-semibold mb-6">Content Intent</h2>

//             <label className="text-sm text-slate-300">
//               What is this post about?
//             </label>
//             <textarea
//               value={topic}
//               onChange={(e) => setTopic(e.target.value)}
//               rows={3}
//               className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
//               placeholder="e.g. Aesthetic travel reel in northern Pakistan"
//             />
//           </div>

//           <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
//             <h2 className="text-lg font-semibold mb-6">Audience & Style</h2>

//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <label className="text-sm text-slate-300">
//                   Target Audience
//                 </label>
//                 <input
//                   value={targetAudience}
//                   onChange={(e) => setTargetAudience(e.target.value)}
//                   className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
//                   placeholder="Travel lovers, creators, students"
//                 />
//               </div>

//               <div>
//                 <label className="text-sm text-slate-300">Caption Tone</label>
//                 <select
//                   value={tone}
//                   onChange={(e) => setTone(e.target.value)}
//                   className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
//                 >
//                   <option value="casual">Casual</option>
//                   <option value="fun">Fun</option>
//                   <option value="inspirational">Inspirational</option>
//                   <option value="professional">Professional</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
//             <h2 className="text-lg font-semibold mb-4">Emoji Intensity</h2>

//             <input
//               type="range"
//               min={0}
//               max={3}
//               value={emojiLevel}
//               onChange={(e) => setEmojiLevel(Number(e.target.value))}
//               className="w-full"
//             />
//             <p className="mt-2 text-xs text-slate-400">
//               {
//                 ["No emojis", "Minimal", "Balanced", "Highly expressive"][
//                   emojiLevel
//                 ]
//               }
//             </p>
//           </div>

//           <button
//             onClick={generatePosts}
//             disabled={isGenerating}
//             className="w-full rounded-2xl bg-pink-600 hover:bg-pink-500 py-4 text-lg font-medium flex items-center justify-center gap-2"
//           >
//             {isGenerating ? (
//               <>
//                 <Loader2 className="animate-spin" />
//                 Generating...
//               </>
//             ) : (
//               <>
//                 <Sparkles />
//                 Generate 3 Variations
//               </>
//             )}
//           </button>
//         </motion.div>

//         {/* GENERATED POSTS */}
//         {postOptions.length > 0 && (
//           <section className="mt-16">
//             <h2 className="text-xl font-semibold mb-6">
//               Choose the best caption ✨
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {postOptions.map((post, index) => (
//                 <motion.div
//                   key={index}
//                   whileHover={{ scale: 1.03 }}
//                   onClick={() => setSelectedIndex(index)}
//                   className={`relative cursor-pointer rounded-2xl border overflow-hidden transition
//                     ${
//                       selectedIndex === index
//                         ? "border-pink-500 ring-2 ring-pink-500/40 bg-pink-500/10"
//                         : "border-slate-800 bg-slate-900 hover:bg-slate-800"
//                     }
//                   `}
//                 >
//                   {post.image && (
//                     <img
//                       src={post.image}
//                       className="h-44 w-full object-cover"
//                     />
//                   )}

//                   <div className="p-5 text-sm whitespace-pre-line text-slate-200">
//                     {post.content}
//                   </div>

//                   {selectedIndex === index && (
//                     <div className="absolute top-3 right-3 bg-pink-600 rounded-full p-1">
//                       <CheckCircle size={16} />
//                     </div>
//                   )}
//                 </motion.div>
//               ))}
//             </div>

//             {/* SAVE BUTTON */}
//             <div className="sticky bottom-6 mt-10">
//               <button
//                 onClick={saveSelectedPost}
//                 disabled={isSaving || selectedIndex === null}
//                 className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-4 text-lg font-medium flex justify-center items-center gap-2"
//               >
//                 {isSaving ? (
//                   <>
//                     <Loader2 className="animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <CheckCircle />
//                     Save Selected Post
//                   </>
//                 )}
//               </button>
//             </div>
//           </section>
//         )}
//       </section>
//     </main>
//   );
// }

"use client";

import React, { useState, useRef } from "react";
import { uploadAIImage } from "@/src/ai/upload_ai_image";
import { savePost } from "@/src/ai/savepost";
import {
  Loader2,
  Sparkles,
  Instagram,
  History,
  CheckCircle,
  FileText,
  UploadCloud,
  PenLine,
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

export default function InstagramForm() {
  const [mode, setMode] = useState<Mode>("form");

  // Form mode state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState("casual");
  const [emojiLevel, setEmojiLevel] = useState(2);

  // Document mode state
  const [file, setFile] = useState<File | null>(null);
  const [docTone, setDocTone] = useState("casual");
  const [docEmojiLevel, setDocEmojiLevel] = useState(2);
  const [isUploading, setIsUploading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
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

  const platform = "instagram";

  const getEmojiStatus = (level: number) =>
    level === 0
      ? "not add"
      : level === 1
        ? "add few"
        : level === 2
          ? "add moderate"
          : "add many";

  const emojiLabels = ["No emojis", "Minimal", "Balanced", "Highly expressive"];

  // ── FORM MODE GENERATE ──────────────────────────────────────────────
  async function generateFromForm() {
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

  // ── DOCUMENT MODE: UPLOAD THEN GENERATE ─────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setDocumentId(null); // reset previous upload
  }

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
      // Step 1: Upload document
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Document upload failed");
      const { documentId: docId } = await uploadRes.json();
      setDocumentId(docId);
      setIsUploading(false);

      // Step 2: Generate posts from document
      const genRes = await fetch("/api/generate-post-from-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: docId,
          tone: docTone,
          platform,
          emojiStatus: getEmojiStatus(docEmojiLevel),
        }),
      });

      if (!genRes.ok) throw new Error("Post generation failed");
      const data = await genRes.json();
      setPostOptions(data.posts);
      setSelectedIndex(0);
      setCurrentSourceType("document");
      setCurrentDocumentId(docId);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsUploading(false);
      setIsGenerating(false);
    }
  }

  // ── SAVE ──────────────────────────────────────────────────────────────
  async function saveSelectedPost() {
    if (selectedIndex === null) {
      alert("Please select one post");
      return;
    }

    const selectedPost = postOptions[selectedIndex];
    setIsSaving(true);

    try {
      const imageUrl = await uploadAIImage(selectedPost.image!);
      await savePost(
        selectedPost.title,
        selectedPost.content,
        imageUrl,
        platform,
        currentSourceType,
        currentDocumentId,
      );
      alert("Instagram post saved successfully!");
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
    <main className="min-h-screen bg-gradient-to-br from-pink-950 via-purple-950 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-pink-600/20 p-3">
              <Instagram className="h-7 w-7 text-pink-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Instagram Content Studio</h1>
              <p className="text-slate-400 text-sm mt-1">
                Generate AI captions from your ideas or documents
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/instagram/history"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm hover:bg-slate-800 transition"
          >
            <History className="h-4 w-4 text-pink-500" />
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
                ? "bg-pink-600 text-white shadow-lg"
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
                ? "bg-pink-600 text-white shadow-lg"
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
                <h2 className="text-lg font-semibold mb-6">Content Intent</h2>
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

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
                <h2 className="text-lg font-semibold mb-6">Audience & Style</h2>
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
                    <label className="text-sm text-slate-300">
                      Caption Tone
                    </label>
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

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
                <h2 className="text-lg font-semibold mb-4">Emoji Intensity</h2>
                <input
                  type="range"
                  min={0}
                  max={3}
                  value={emojiLevel}
                  onChange={(e) => setEmojiLevel(Number(e.target.value))}
                  className="w-full"
                />
                <p className="mt-2 text-xs text-slate-400">
                  {emojiLabels[emojiLevel]}
                </p>
              </div>

              <button
                onClick={generateFromForm}
                disabled={isLoading}
                className="w-full rounded-2xl bg-pink-600 hover:bg-pink-500 py-4 text-lg font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" /> Generating...
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
                  Upload a PDF, DOCX, or TXT file — AI will generate Instagram
                  posts based on its content.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!file ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-700 hover:border-pink-500 rounded-2xl py-12 flex flex-col items-center gap-3 text-slate-400 hover:text-pink-400 transition"
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
                      <FileText className="h-5 w-5 text-pink-400" />
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
                      onClick={() => {
                        setFile(null);
                        setDocumentId(null);
                      }}
                      className="text-slate-500 hover:text-red-400 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Style Options */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8">
                <h2 className="text-lg font-semibold mb-6">Caption Style</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-slate-300">
                      Caption Tone
                    </label>
                    <select
                      value={docTone}
                      onChange={(e) => setDocTone(e.target.value)}
                      className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3"
                    >
                      <option value="casual">Casual</option>
                      <option value="fun">Fun</option>
                      <option value="inspirational">Inspirational</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">
                      Emoji Intensity
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={3}
                      value={docEmojiLevel}
                      onChange={(e) => setDocEmojiLevel(Number(e.target.value))}
                      className="w-full mt-2"
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      {emojiLabels[docEmojiLevel]}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={generateFromDocument}
                disabled={isLoading || !file}
                className="w-full rounded-2xl bg-pink-600 hover:bg-pink-500 py-4 text-lg font-medium flex items-center justify-center gap-2 disabled:opacity-60"
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
              Choose the best caption ✨
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {postOptions.map((post, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative cursor-pointer rounded-2xl border overflow-hidden transition
                    ${
                      selectedIndex === index
                        ? "border-pink-500 ring-2 ring-pink-500/40 bg-pink-500/10"
                        : "border-slate-800 bg-slate-900 hover:bg-slate-800"
                    }`}
                >
                  {post.image && (
                    <img
                      src={post.image}
                      className="h-44 w-full object-cover"
                    />
                  )}
                  <div className="p-5 text-sm whitespace-pre-line text-slate-200">
                    {post.content}
                  </div>
                  {selectedIndex === index && (
                    <div className="absolute top-3 right-3 bg-pink-600 rounded-full p-1">
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
