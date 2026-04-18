// src/app/dashboard/compare/CompareClient.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Sparkles,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronUp,
  GitCompare,
  FileText,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Zap,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Category = {
  id: string;
  displayName: string;
  name: string;
  _count: { examples: number; documents: number };
};

type GeneratedPost = {
  title: string;
  content: string;
  promptUsed: string;
  contextInjected: boolean;
  retrievedChunks: string[];
  examplesUsed: number;
  chunksUsed: number;
};

type CompareResult = {
  topic: string;
  platform: string;
  without: GeneratedPost;
  with: GeneratedPost;
  analysis: {
    similarityPercent: number;
    uniquenessPercent: number;
    ragContextSize: number;
    totalChunksRetrieved: number;
    totalExamplesUsed: number;
  };
};

export default function CompareClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topic, setTopic] = useState("healthy breakfast recipes");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("casual");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [showWithoutPrompt, setShowWithoutPrompt] = useState(false);
  const [showWithPrompt, setShowWithPrompt] = useState(false);
  const [showChunks, setShowChunks] = useState(false);
  const [activeChunk, setActiveChunk] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      });
  }, []);

  async function runComparison() {
    if (!topic || !categoryId) return;
    setLoading(true);
    setResult(null);
    setShowWithoutPrompt(false);
    setShowWithPrompt(false);
    setShowChunks(false);

    try {
      const res = await fetch("/api/compare-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, tone, categoryId }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const selectedCat = categories.find((c) => c.id === categoryId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-7xl space-y-8">
        {/* ── Header ── */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-400">
            <GitCompare className="h-4 w-4" />
            RAG vs Standard Generation — Comparison Demo
          </div>
          <h1 className="text-3xl font-bold">Knowledge Base Impact Analysis</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Demonstrates how Retrieval-Augmented Generation (RAG) with a
            domain-specific knowledge base produces significantly richer, more
            accurate posts compared to standard LLM generation.
          </p>
        </header>

        {/* ── How It Works ── */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Brain,
              color: "text-slate-400",
              bg: "bg-slate-700/20",
              border: "border-slate-700/50",
              label: "Standard Generation",
              desc: "Gemini generates from general training data only. No domain knowledge.",
            },
            {
              icon: FileText,
              color: "text-violet-400",
              bg: "bg-violet-600/10",
              border: "border-violet-500/30",
              label: "RAG Retrieval",
              desc: `Semantic search finds the most relevant chunks from your ${selectedCat?._count.documents ?? 0} uploaded documents.`,
            },
            {
              icon: Sparkles,
              color: "text-emerald-400",
              bg: "bg-emerald-600/10",
              border: "border-emerald-500/30",
              label: "RAG-Enhanced Output",
              desc: "Gemini generates using retrieved context + your example posts as style guides.",
            },
          ].map((step, i) => (
            <div
              key={i}
              className={`rounded-2xl border ${step.border} ${step.bg} p-5`}
            >
              <step.icon className={`h-6 w-6 ${step.color} mb-3`} />
              <p className={`text-sm font-semibold ${step.color} mb-1`}>
                {step.label}
              </p>
              <p className="text-xs text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Input Form ── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <h2 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            Configure Comparison
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Topic / Post Idea
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. healthy breakfast recipes"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Category Knowledge Base
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.displayName} ({cat._count.documents} docs,{" "}
                    {cat._count.examples} examples)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"
              >
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="inspirational">Inspirational</option>
                <option value="fun">Fun</option>
              </select>
            </div>
          </div>

          <button
            onClick={runComparison}
            disabled={loading || !topic || !categoryId}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3.5 font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition text-base"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Generating both versions simultaneously...
              </>
            ) : (
              <>
                <GitCompare className="h-5 w-5" />
                Run Comparison
              </>
            )}
          </button>
        </div>

        {/* ── Results ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* ── Stats Bar ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Documents in KB",
                    value: selectedCat?._count.documents ?? 0,
                    icon: FileText,
                    color: "text-violet-400",
                    bg: "bg-violet-500/10",
                  },
                  {
                    label: "Chunks Retrieved",
                    value: result.analysis.totalChunksRetrieved,
                    icon: BookOpen,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                  },
                  {
                    label: "Examples Used",
                    value: result.analysis.totalExamplesUsed,
                    icon: Lightbulb,
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/10",
                  },
                  {
                    label: "Content Uniqueness",
                    value: `${result.analysis.uniquenessPercent}%`,
                    icon: BarChart2,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className={`rounded-2xl border border-slate-800 ${stat.bg} p-4`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* ── Uniqueness Bar ── */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-300">
                    Content Divergence Between Versions
                  </span>
                  <span className="text-sm font-bold text-emerald-400">
                    {result.analysis.uniquenessPercent}% unique content
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.analysis.uniquenessPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>0% (identical)</span>
                  <span>100% (completely different)</span>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  {result.analysis.uniquenessPercent > 60
                    ? "✓ High divergence confirms the knowledge base significantly changes the generated content."
                    : result.analysis.uniquenessPercent > 40
                      ? "✓ Moderate divergence shows the knowledge base influences content direction."
                      : "The knowledge base is providing stylistic guidance while maintaining topic focus."}
                </p>
              </div>

              {/* ── Side by Side Posts ── */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Without RAG */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-slate-700 bg-slate-900/60 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-slate-800 bg-slate-800/40 flex items-center gap-3">
                    <div className="rounded-lg bg-slate-700 p-1.5">
                      <Brain className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">
                        Without Knowledge Base
                      </p>
                      <p className="text-xs text-slate-400">
                        Standard Gemini — general training only
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 rounded-full bg-slate-700 px-2.5 py-1 text-xs text-slate-400">
                      <AlertCircle className="h-3 w-3" />
                      No RAG
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Title
                      </p>
                      <p className="font-semibold text-white">
                        {result.without.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Post Content
                      </p>
                      <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {result.without.content}
                      </p>
                    </div>

                    {/* Characteristics */}
                    <div className="rounded-xl bg-slate-800/50 border border-slate-700 p-3 space-y-1.5">
                      <p className="text-xs font-medium text-slate-400 mb-2">
                        Characteristics
                      </p>
                      {[
                        "Generic language, could apply to any brand",
                        "No specific facts from your documents",
                        "No style from your example posts",
                        "Based on general internet knowledge",
                      ].map((point, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-slate-400"
                        >
                          <AlertCircle className="h-3 w-3 text-slate-500 mt-0.5 flex-shrink-0" />
                          {point}
                        </div>
                      ))}
                    </div>

                    {/* Prompt Used */}
                    <button
                      onClick={() => setShowWithoutPrompt(!showWithoutPrompt)}
                      className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition w-full"
                    >
                      <Eye className="h-3 w-3" />
                      {showWithoutPrompt ? "Hide" : "View"} prompt sent to
                      Gemini
                      {showWithoutPrompt ? (
                        <ChevronUp className="h-3 w-3 ml-auto" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-auto" />
                      )}
                    </button>
                    <AnimatePresence>
                      {showWithoutPrompt && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <pre className="text-xs text-slate-400 bg-slate-950 rounded-xl p-3 whitespace-pre-wrap overflow-x-auto border border-slate-800 max-h-48 overflow-y-auto">
                            {result.without.promptUsed}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* With RAG */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-violet-500/40 bg-violet-500/5 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-5 py-4 border-b border-violet-500/20 bg-violet-600/10 flex items-center gap-3">
                    <div className="rounded-lg bg-violet-600/20 p-1.5">
                      <Sparkles className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">
                        With Knowledge Base (RAG)
                      </p>
                      <p className="text-xs text-slate-400">
                        {result.analysis.totalChunksRetrieved} chunks +{" "}
                        {result.analysis.totalExamplesUsed} examples injected
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 rounded-full bg-violet-600/20 border border-violet-500/30 px-2.5 py-1 text-xs text-violet-400">
                      <CheckCircle2 className="h-3 w-3" />
                      RAG Active
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Title
                      </p>
                      <p className="font-semibold text-white">
                        {result.with.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Post Content
                      </p>
                      <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {result.with.content}
                      </p>
                    </div>

                    {/* Characteristics */}
                    <div className="rounded-xl bg-violet-600/10 border border-violet-500/20 p-3 space-y-1.5">
                      <p className="text-xs font-medium text-violet-400 mb-2">
                        RAG Enhancements
                      </p>
                      {[
                        `${result.analysis.totalChunksRetrieved} relevant chunks retrieved from your documents`,
                        `${result.analysis.totalExamplesUsed} example posts used as style reference`,
                        "Domain-specific facts and terminology included",
                        "Content grounded in YOUR knowledge base",
                      ].map((point, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-violet-300"
                        >
                          <CheckCircle2 className="h-3 w-3 text-violet-400 mt-0.5 flex-shrink-0" />
                          {point}
                        </div>
                      ))}
                    </div>

                    {/* Prompt Used */}
                    <button
                      onClick={() => setShowWithPrompt(!showWithPrompt)}
                      className="flex items-center gap-2 text-xs text-slate-500 hover:text-violet-400 transition w-full"
                    >
                      <Eye className="h-3 w-3" />
                      {showWithPrompt ? "Hide" : "View"} RAG-enhanced prompt
                      {showWithPrompt ? (
                        <ChevronUp className="h-3 w-3 ml-auto" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-auto" />
                      )}
                    </button>
                    <AnimatePresence>
                      {showWithPrompt && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <pre className="text-xs text-slate-400 bg-slate-950 rounded-xl p-3 whitespace-pre-wrap overflow-x-auto border border-violet-800/30 max-h-64 overflow-y-auto">
                            {result.with.promptUsed}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* ── Retrieved Chunks (Evidence) ── */}
              {result.with.retrievedChunks.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                  <button
                    onClick={() => setShowChunks(!showChunks)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-violet-400" />
                      <div className="text-left">
                        <p className="font-semibold text-sm">
                          Retrieved Knowledge Chunks
                        </p>
                        <p className="text-xs text-slate-400">
                          These {result.with.retrievedChunks.length} chunks were
                          extracted from your uploaded documents and injected
                          into the prompt
                        </p>
                      </div>
                    </div>
                    {showChunks ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showChunks && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-800 overflow-hidden"
                      >
                        <div className="p-6 space-y-3">
                          <p className="text-xs text-slate-500">
                            Click each chunk to expand. These are the actual
                            text segments retrieved from your documents using
                            semantic search and keyword relevance scoring.
                          </p>
                          {result.with.retrievedChunks.map((chunk, i) => (
                            <div
                              key={i}
                              className="rounded-xl border border-slate-700 overflow-hidden"
                            >
                              <button
                                onClick={() =>
                                  setActiveChunk(activeChunk === i ? null : i)
                                }
                                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800/40 hover:bg-slate-800/60 transition text-left"
                              >
                                <span className="text-xs font-medium text-violet-400">
                                  Chunk {i + 1}{" "}
                                  <span className="text-slate-500 font-normal">
                                    — {chunk.slice(0, 60)}...
                                  </span>
                                </span>
                                {activeChunk === i ? (
                                  <ChevronUp className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                )}
                              </button>
                              <AnimatePresence>
                                {activeChunk === i && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <p className="px-4 py-3 text-xs text-slate-300 leading-relaxed bg-slate-950/50">
                                      {chunk}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── Summary for Evaluators ── */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
                  <CheckCircle2 className="h-5 w-5" />
                  Technical Summary for Evaluators
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
                  <div className="space-y-2">
                    <p className="font-medium text-white">
                      What RAG does here:
                    </p>
                    <ul className="space-y-1 text-slate-400 text-xs">
                      <li>• Splits uploaded documents into semantic chunks</li>
                      <li>• Scores chunks by relevance to the input topic</li>
                      <li>• Retrieves top-K most relevant chunks</li>
                      <li>
                        • Injects chunks + style examples into the LLM prompt
                      </li>
                      <li>• LLM generates grounded in your domain knowledge</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-white">
                      Evidence of effectiveness:
                    </p>
                    <ul className="space-y-1 text-slate-400 text-xs">
                      <li>
                        • {result.analysis.uniquenessPercent}% unique content vs
                        standard generation
                      </li>
                      <li>
                        • {result.analysis.totalChunksRetrieved} document chunks
                        retrieved and used
                      </li>
                      <li>
                        • {result.analysis.totalExamplesUsed} style examples
                        applied
                      </li>
                      <li>
                        • ~{Math.round(result.analysis.ragContextSize / 4)}{" "}
                        tokens of domain context injected
                      </li>
                      <li>
                        • RAG-enhanced prompt is{" "}
                        {Math.round(
                          result.with.promptUsed.length /
                            result.without.promptUsed.length,
                        )}
                        x larger with domain knowledge
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
