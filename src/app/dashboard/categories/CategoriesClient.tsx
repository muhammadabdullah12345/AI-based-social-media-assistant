// src/app/dashboard/categories/CategoriesClient.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  X,
  Tag,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Category = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  _count: { examples: number; documents: number };
};

type Example = {
  id: string;
  title: string;
  content: string;
  tone: string;
  platform: string;
};

type Document = {
  id: string;
  filename: string;
  fileType: string;
  createdAt: string;
};

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [examples, setExamples] = useState<Record<string, Example[]>>({});
  const [documents, setDocuments] = useState<Record<string, Document[]>>({});
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCat, setNewCat] = useState({ displayName: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // New example form
  const [showExampleForm, setShowExampleForm] = useState<string | null>(null);
  const [newExample, setNewExample] = useState({
    title: "",
    content: "",
    tone: "casual",
    platform: "instagram",
  });
  const [savingExample, setSavingExample] = useState(false);

  // Document upload
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      setCategories(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpand(catId: string) {
    if (expandedId === catId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(catId);
    // Load examples and docs if not loaded yet
    if (!examples[catId]) {
      const [exRes, docRes] = await Promise.all([
        fetch(`/api/categories/${catId}/examples`),
        fetch(`/api/categories/${catId}/documents`),
      ]);
      // FIX: resolve JSON outside setState — await is not allowed inside setState callbacks
      const [exData, docData] = await Promise.all([
        exRes.json(),
        docRes.json(),
      ]);
      setExamples((prev) => ({ ...prev, [catId]: exData }));
      setDocuments((prev) => ({ ...prev, [catId]: docData }));
    }
  }

  async function createCategory() {
    if (!newCat.displayName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCat.displayName,
          displayName: newCat.displayName,
          description: newCat.description,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setShowNewCategory(false);
      setNewCat({ displayName: "", description: "" });
      setMessage({ type: "success", text: "Category created!" });
      fetchCategories();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function addExample(catId: string) {
    if (!newExample.title || !newExample.content) return;
    setSavingExample(true);
    try {
      const res = await fetch(`/api/categories/${catId}/examples`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExample),
      });
      const added = await res.json();
      setExamples((prev) => ({
        ...prev,
        [catId]: [added, ...(prev[catId] ?? [])],
      }));
      setShowExampleForm(null);
      setNewExample({
        title: "",
        content: "",
        tone: "casual",
        platform: "instagram",
      });
      setMessage({ type: "success", text: "Example post added!" });
      fetchCategories();
    } finally {
      setSavingExample(false);
    }
  }

  async function deleteExample(catId: string, exampleId: string) {
    await fetch(`/api/categories/${catId}/examples`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exampleId }),
    });
    setExamples((prev) => ({
      ...prev,
      [catId]: (prev[catId] ?? []).filter((e) => e.id !== exampleId),
    }));
    fetchCategories();
  }

  async function uploadDocument(catId: string, file: File) {
    setUploadingDoc(catId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/categories/${catId}/documents`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDocuments((prev) => ({
        ...prev,
        [catId]: [
          {
            id: data.documentId,
            filename: data.filename,
            fileType: file.type,
            createdAt: new Date().toISOString(),
          },
          ...(prev[catId] ?? []),
        ],
      }));
      setMessage({ type: "success", text: `"${file.name}" uploaded!` });
      fetchCategories();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploadingDoc(null);
    }
  }

  async function removeDocument(catId: string, documentId: string) {
    await fetch(`/api/categories/${catId}/documents`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    });
    setDocuments((prev) => ({
      ...prev,
      [catId]: (prev[catId] ?? []).filter((d) => d.id !== documentId),
    }));
    fetchCategories();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-violet-600/20 p-3">
              <BookOpen className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Category Knowledge Base</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Train AI with your custom examples and documents per category
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNewCategory(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2.5 text-sm font-medium transition"
          >
            <Plus className="h-4 w-4" /> New Category
          </button>
        </header>

        {/* How it works banner */}
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
          <div className="flex items-center gap-2 text-violet-400 font-medium mb-2">
            <Sparkles className="h-4 w-4" /> How Category Training Works
          </div>
          <p className="text-sm text-slate-400">
            Add <strong className="text-white">example posts</strong> and{" "}
            <strong className="text-white">knowledge documents</strong> to each
            category. When generating posts with a category selected, AI uses
            your examples as style guides and your documents as factual
            knowledge — producing posts that match your brand voice and domain
            expertise.
          </p>
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {message.text}
              <button onClick={() => setMessage(null)}>
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Category Form */}
        <AnimatePresence>
          {showNewCategory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 space-y-4"
            >
              <h3 className="font-semibold">Create New Category</h3>
              <input
                value={newCat.displayName}
                onChange={(e) =>
                  setNewCat((p) => ({ ...p, displayName: e.target.value }))
                }
                placeholder="Category name (e.g. Fashion & Style)"
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"
              />
              <textarea
                value={newCat.description}
                onChange={(e) =>
                  setNewCat((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Description (optional)"
                rows={2}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={createCategory}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Create
                </button>
                <button
                  onClick={() => setShowNewCategory(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 py-8 justify-center">
            <Loader2 className="animate-spin h-4 w-4" /> Loading categories...
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleExpand(cat.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-violet-600/20 p-2">
                    <Tag className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">
                      {cat.displayName}
                    </p>
                    {cat.description && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">
                      {cat._count.examples} examples
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">
                      {cat._count.documents} docs
                    </span>
                  </div>
                </div>
                {expandedId === cat.id ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === cat.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-800 overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      {/* ── Example Posts Section ── */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-slate-300">
                            Example Posts
                            <span className="ml-2 text-xs text-slate-500 font-normal">
                              AI uses these as style reference
                            </span>
                          </h3>
                          <button
                            onClick={() => setShowExampleForm(cat.id)}
                            className="flex items-center gap-1.5 text-xs rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-600/30 px-3 py-1.5 transition"
                          >
                            <Plus className="h-3 w-3" /> Add Example
                          </button>
                        </div>

                        {/* Add Example Form */}
                        <AnimatePresence>
                          {showExampleForm === cat.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 mb-4 space-y-3"
                            >
                              <input
                                value={newExample.title}
                                onChange={(e) =>
                                  setNewExample((p) => ({
                                    ...p,
                                    title: e.target.value,
                                  }))
                                }
                                placeholder="Post title"
                                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                              />
                              <textarea
                                value={newExample.content}
                                onChange={(e) =>
                                  setNewExample((p) => ({
                                    ...p,
                                    content: e.target.value,
                                  }))
                                }
                                placeholder="Paste a great example post here..."
                                rows={4}
                                className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm resize-none"
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <select
                                  value={newExample.tone}
                                  onChange={(e) =>
                                    setNewExample((p) => ({
                                      ...p,
                                      tone: e.target.value,
                                    }))
                                  }
                                  className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                                >
                                  <option value="casual">Casual</option>
                                  <option value="professional">
                                    Professional
                                  </option>
                                  <option value="fun">Fun</option>
                                  <option value="inspirational">
                                    Inspirational
                                  </option>
                                </select>
                                <select
                                  value={newExample.platform}
                                  onChange={(e) =>
                                    setNewExample((p) => ({
                                      ...p,
                                      platform: e.target.value,
                                    }))
                                  }
                                  className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
                                >
                                  <option value="instagram">Instagram</option>
                                  <option value="facebook">Facebook</option>
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => addExample(cat.id)}
                                  disabled={savingExample}
                                  className="flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-medium transition disabled:opacity-50"
                                >
                                  {savingExample ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3 w-3" />
                                  )}
                                  Save
                                </button>
                                <button
                                  onClick={() => setShowExampleForm(null)}
                                  className="text-xs text-slate-400 hover:text-white transition px-2"
                                >
                                  Cancel
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Examples List */}
                        {(examples[cat.id] ?? []).length === 0 ? (
                          <p className="text-xs text-slate-500 py-3">
                            No examples yet. Add posts that represent your ideal
                            style for this category.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {(examples[cat.id] ?? []).map((ex) => (
                              <div
                                key={ex.id}
                                className="rounded-xl bg-slate-800/50 border border-slate-700 p-3 flex gap-3"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-white">
                                      {ex.title}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {ex.platform} • {ex.tone}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-400 line-clamp-2">
                                    {ex.content}
                                  </p>
                                </div>
                                <button
                                  onClick={() => deleteExample(cat.id, ex.id)}
                                  className="text-slate-600 hover:text-red-400 transition flex-shrink-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* ── Knowledge Documents Section ── */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-slate-300">
                            Knowledge Documents
                            <span className="ml-2 text-xs text-slate-500 font-normal">
                              AI uses these as factual reference
                            </span>
                          </h3>
                          <div>
                            {/* FIX: callback ref now explicitly returns void to satisfy React 19+ */}
                            <input
                              ref={(el): void => {
                                fileRefs.current[cat.id] = el;
                              }}
                              type="file"
                              accept=".pdf,.docx,.txt"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadDocument(cat.id, file);
                                e.target.value = "";
                              }}
                            />
                            <button
                              onClick={() => fileRefs.current[cat.id]?.click()}
                              disabled={uploadingDoc === cat.id}
                              className="flex items-center gap-1.5 text-xs rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 transition disabled:opacity-50"
                            >
                              {uploadingDoc === cat.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Upload className="h-3 w-3" />
                              )}
                              Upload Doc
                            </button>
                          </div>
                        </div>

                        {(documents[cat.id] ?? []).length === 0 ? (
                          <p className="text-xs text-slate-500 py-3">
                            No documents yet. Upload PDFs, DOCX or TXT files
                            with category-specific knowledge.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {(documents[cat.id] ?? []).map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between rounded-xl bg-slate-800/50 border border-slate-700 px-3 py-2.5"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-violet-400 flex-shrink-0" />
                                  <span className="text-sm text-white truncate">
                                    {doc.filename}
                                  </span>
                                </div>
                                <button
                                  onClick={() => removeDocument(cat.id, doc.id)}
                                  className="text-slate-600 hover:text-red-400 transition ml-3"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
