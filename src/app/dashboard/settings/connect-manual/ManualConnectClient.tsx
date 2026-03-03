// src/app/dashboard/settings/connect-manual/ManualConnectClient.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Link2, Info } from "lucide-react";

export default function ManualConnectClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userToken = searchParams.get("token") ?? "";

  const [pageId, setPageId] = useState("");
  const [pageAccessToken, setPageAccessToken] = useState("");
  const [pageName, setPageName] = useState("");
  const [igAccountId, setIgAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  // Auto-lookup page details when Page Access Token is pasted
  async function lookupPage() {
    if (!pageAccessToken.trim()) return;
    setLookupLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/social-accounts/lookup-page?token=${encodeURIComponent(pageAccessToken)}`,
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPageId(data.pageId);
      setPageName(data.pageName);
      setIgAccountId(data.igAccountId ?? "");
      setFetched(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to look up page");
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSave() {
    if (!pageId || !pageAccessToken || !pageName) {
      setError("Please look up the page first using your Page Access Token");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/social-accounts/manual-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          pageAccessToken,
          pageName,
          igAccountId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      router.push("/dashboard/settings?success=true&platform=facebook");
    } catch (err: any) {
      setError(err.message ?? "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Manual Account Connection</h1>
          <p className="text-slate-400 text-sm">
            Your Facebook Page couldn't be fetched automatically (common in Dev
            mode). Paste your{" "}
            <strong className="text-white">Page Access Token</strong> from Graph
            API Explorer below.
          </p>
        </div>

        {/* Instructions */}
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-medium">
            <Info className="h-4 w-4" />
            How to get your Page Access Token
          </div>
          <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
            <li>
              Go to{" "}
              <a
                href="https://developers.facebook.com/tools/explorer/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                Meta Graph API Explorer
              </a>
            </li>
            <li>Select your app from the top-right dropdown</li>
            <li>
              Click <strong>"Generate Access Token"</strong> and grant all
              permissions
            </li>
            <li>
              Change the dropdown from <strong>"User Token"</strong> to{" "}
              <strong>your Page name ("AI posts")</strong>
            </li>
            <li>
              Copy the token that appears — that is your Page Access Token
            </li>
            <li>Paste it below and click "Look Up Page"</li>
          </ol>
        </div>

        {/* Token Input */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Page Access Token
            </label>
            <textarea
              value={pageAccessToken}
              onChange={(e) => {
                setPageAccessToken(e.target.value);
                setFetched(false);
              }}
              rows={3}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Paste your Page Access Token here..."
            />
          </div>

          <button
            onClick={lookupPage}
            disabled={lookupLoading || !pageAccessToken.trim()}
            className="flex items-center gap-2 rounded-lg bg-slate-700 hover:bg-slate-600 px-4 py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {lookupLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            Look Up Page
          </button>

          {/* Fetched page info */}
          {fetched && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-1 text-sm">
              <p className="text-emerald-400 font-medium">✓ Page found!</p>
              <p className="text-slate-300">
                Page: <strong>{pageName}</strong> ({pageId})
              </p>
              {igAccountId ? (
                <p className="text-slate-300">
                  Instagram: <strong>{igAccountId}</strong> linked ✓
                </p>
              ) : (
                <p className="text-slate-500">
                  No Instagram Business account linked to this page
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={loading || !fetched}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Connect Account"
            )}
          </button>
        </div>

        <button
          onClick={() => router.push("/dashboard/settings")}
          className="text-sm text-slate-400 hover:text-white transition"
        >
          ← Back to Settings
        </button>
      </div>
    </main>
  );
}
