// src/components/FeedbackWidget.tsx
"use client";

import { useState } from "react";
import {
  MessageSquare,
  X,
  Star,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Rating = 1 | 2 | 3 | 4 | 5;

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"rating" | "detail" | "done">("rating");
  const [rating, setRating] = useState<Rating | null>(null);
  const [hoveredRating, setHoveredRating] = useState<Rating | null>(null);
  const [category, setCategory] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const ratingLabels: Record<Rating, string> = {
    1: "Very Poor",
    2: "Poor",
    3: "Okay",
    4: "Good",
    5: "Excellent",
  };

  const categories = [
    "UI / Design",
    "AI Post Generation",
    "Publishing Feature",
    "Scheduling",
    "Analytics",
    "Category Knowledge Base",
    "Overall Experience",
    "Bug Report",
  ];

  async function submitFeedback() {
    if (!rating) return;
    setSubmitting(true);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          category,
          comment,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });
      setStep("done");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setIsOpen(false);
    setTimeout(() => {
      setStep("rating");
      setRating(null);
      setCategory("");
      setComment("");
    }, 300);
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-lg px-4 py-3 text-sm font-medium text-white transition"
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </motion.button>

      {/* Feedback Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={reset}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-20 right-6 z-50 w-80 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                  <span className="font-semibold text-sm text-white">
                    Share Your Feedback
                  </span>
                </div>
                <button
                  onClick={reset}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  {/* Step 1: Rating */}
                  {step === "rating" && (
                    <motion.div
                      key="rating"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <p className="text-sm text-slate-300">
                        How would you rate your overall experience?
                      </p>

                      {/* Stars */}
                      <div className="flex gap-2 justify-center py-2">
                        {([1, 2, 3, 4, 5] as Rating[]).map((star) => (
                          <button
                            key={star}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(null)}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                star <= (hoveredRating ?? rating ?? 0)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-slate-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      {(hoveredRating || rating) && (
                        <p className="text-center text-xs text-yellow-400 font-medium">
                          {ratingLabels[hoveredRating ?? rating!]}
                        </p>
                      )}

                      <button
                        onClick={() => rating && setStep("detail")}
                        disabled={!rating}
                        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-sm font-medium disabled:opacity-40 transition"
                      >
                        Continue →
                      </button>
                    </motion.div>
                  )}

                  {/* Step 2: Details */}
                  {step === "detail" && (
                    <motion.div
                      key="detail"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2">
                        {([1, 2, 3, 4, 5] as Rating[]).map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= rating!
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-slate-600"
                            }`}
                          />
                        ))}
                        <span className="text-xs text-yellow-400 ml-1">
                          {ratingLabels[rating!]}
                        </span>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">
                          What area is your feedback about?
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white"
                        >
                          <option value="">Select area (optional)</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">
                          Your feedback
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="What did you like? What could be improved?"
                          rows={4}
                          className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setStep("rating")}
                          className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-400 hover:text-white transition"
                        >
                          ← Back
                        </button>
                        <button
                          onClick={submitFeedback}
                          disabled={submitting || !comment.trim()}
                          className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 transition"
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Submit
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Done */}
                  {step === "done" && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4 space-y-3"
                    >
                      <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                      <p className="font-semibold text-white">Thank you!</p>
                      <p className="text-sm text-slate-400">
                        Your feedback has been recorded and will help improve
                        Generatify.
                      </p>
                      <button
                        onClick={reset}
                        className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-sm transition"
                      >
                        Close
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
