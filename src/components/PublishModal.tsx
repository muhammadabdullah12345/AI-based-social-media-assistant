// src/components/PublishModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  X,
  Send,
  Calendar,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link2,
  Facebook,
  Instagram,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SocialAccount = {
  id: string;
  platform: string;
  accountName: string;
  accountId: string;
  igAccountId?: string;
  tokenExpiry?: string;
};

type PublishModalProps = {
  postId: string;
  platform: "instagram" | "facebook";
  isOpen: boolean;
  onClose: () => void;
  onPublished?: () => void;
};

export default function PublishModal({
  postId,
  platform,
  isOpen,
  onClose,
  onPublished,
}: PublishModalProps) {
  const [tab, setTab] = useState<"now" | "schedule">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Get minimum datetime (10 minutes from now for scheduling)
  const getMinDateTime = () => {
    const d = new Date(Date.now() + 10 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
      setResult(null);
    }
  }, [isOpen, platform]);

  async function loadAccounts() {
    setLoadingAccounts(true);
    try {
      const res = await fetch("/api/social-accounts");
      const data = await res.json();
      const filtered = data.filter(
        (a: SocialAccount) => a.platform === platform,
      );
      setAccounts(filtered);
      if (filtered.length > 0) setSelectedAccountId(filtered[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAccounts(false);
    }
  }

  async function handlePublish() {
    if (!selectedAccountId) {
      setResult({
        type: "error",
        message: "Please select an account to publish to.",
      });
      return;
    }

    if (tab === "schedule" && !scheduledAt) {
      setResult({
        type: "error",
        message: "Please select a date and time to schedule.",
      });
      return;
    }

    setPublishing(true);
    setResult(null);

    try {
      const res = await fetch(`/api/posts/${postId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: tab,
          scheduledAt: tab === "schedule" ? scheduledAt : undefined,
          socialAccountId: selectedAccountId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({
          type: "error",
          message: data.error ?? "Publishing failed",
        });
      } else {
        setResult({ type: "success", message: data.message ?? "Done!" });
        if (onPublished) setTimeout(onPublished, 1500);
      }
    } catch (err: any) {
      setResult({
        type: "error",
        message: err.message ?? "Something went wrong",
      });
    } finally {
      setPublishing(false);
    }
  }

  const PlatformIcon = platform === "facebook" ? Facebook : Instagram;
  const platformColor = platform === "facebook" ? "blue" : "pink";
  const connectUrl = `/api/auth/facebook?platform=${platform}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div
              className={`px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-${platformColor}-600/10`}
            >
              <div className="flex items-center gap-3">
                <PlatformIcon className={`h-5 w-5 text-${platformColor}-400`} />
                <h2 className="text-lg font-semibold text-white capitalize">
                  Publish to {platform}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Account Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Select Account
                </label>

                {loadingAccounts ? (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading connected accounts...
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center space-y-3">
                    <p className="text-sm text-slate-400">
                      No {platform} account connected yet.
                    </p>
                    {/* ✅ FIX 1: Added missing opening <a> tag */}
                    <a
                      href={connectUrl}
                      className={`inline-flex items-center gap-2 rounded-lg bg-${platformColor}-600 hover:bg-${platformColor}-500 px-4 py-2 text-sm font-medium text-white transition`}
                    >
                      <Link2 className="h-4 w-4" />
                      Connect{" "}
                      {platform === "facebook"
                        ? "Facebook Page"
                        : "Instagram Account"}
                    </a>
                    <p className="text-xs text-slate-500">
                      {platform === "instagram"
                        ? "Your Instagram must be a Business/Creator account linked to a Facebook Page"
                        : "You need a Facebook Page (not a personal profile) to publish"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {accounts.map((account) => (
                      <label
                        key={account.id}
                        className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                          selectedAccountId === account.id
                            ? `border-${platformColor}-500 bg-${platformColor}-500/10`
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="account"
                          value={account.id}
                          checked={selectedAccountId === account.id}
                          onChange={() => setSelectedAccountId(account.id)}
                          className="accent-blue-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {account.accountName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {platform === "instagram" && account.igAccountId
                              ? `IG ID: ${account.igAccountId}`
                              : `Page ID: ${account.accountId}`}
                          </p>
                        </div>
                      </label>
                    ))}
                    {/* ✅ FIX 2: Added missing opening <a> tag */}
                    <a
                      href={connectUrl}
                      className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition mt-1 pl-1"
                    >
                      <Link2 className="h-3 w-3" />
                      Connect another account
                    </a>
                  </div>
                )}
              </div>

              {/* Publish / Schedule Tabs */}
              {accounts.length > 0 && (
                <>
                  <div className="flex rounded-xl border border-slate-700 bg-slate-800/50 p-1 gap-1">
                    <button
                      onClick={() => setTab("now")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                        tab === "now"
                          ? `bg-${platformColor}-600 text-white`
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Send className="h-4 w-4" />
                      Publish Now
                    </button>
                    <button
                      onClick={() => setTab("schedule")}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                        tab === "schedule"
                          ? `bg-${platformColor}-600 text-white`
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </button>
                  </div>

                  {tab === "schedule" && (
                    <div>
                      {/* ✅ FIX 3: Separated <label> and <div> — label can't contain block flex children cleanly */}
                      <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <label htmlFor="schedule-datetime">
                          Pick Date &amp; Time
                        </label>
                      </div>
                      <input
                        id="schedule-datetime"
                        type="datetime-local"
                        min={getMinDateTime()}
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Must be at least 10 minutes from now
                      </p>
                    </div>
                  )}

                  {/* Result message */}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-3 rounded-xl p-3 text-sm ${
                        result.type === "success"
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : "bg-red-500/10 border border-red-500/30 text-red-400"
                      }`}
                    >
                      {result.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      {result.message}
                    </motion.div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={handlePublish}
                    disabled={publishing || result?.type === "success"}
                    className={`w-full rounded-xl py-3 font-medium text-white flex items-center justify-center gap-2 transition disabled:opacity-60 ${
                      platform === "facebook"
                        ? "bg-blue-600 hover:bg-blue-500"
                        : "bg-pink-600 hover:bg-pink-500"
                    }`}
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {tab === "schedule" ? "Scheduling..." : "Publishing..."}
                      </>
                    ) : tab === "schedule" ? (
                      <>
                        <Calendar className="h-4 w-4" />
                        Schedule Post
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Publish Now
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
