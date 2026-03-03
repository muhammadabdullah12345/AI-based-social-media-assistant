// src/components/SocialAccountsSettings.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Link2,
  Unlink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

type SocialAccount = {
  id: string;
  platform: string;
  accountName: string;
  accountId: string;
  igAccountId?: string;
  tokenExpiry?: string;
  createdAt: string;
};

export default function SocialAccountsSettings() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");
  const platformParam = searchParams.get("platform");

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoading(true);
    try {
      const res = await fetch("/api/social-accounts");
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function disconnectAccount(accountId: string) {
    const confirm = window.confirm("Disconnect this account?");
    if (!confirm) return;

    setDisconnecting(accountId);
    try {
      await fetch("/api/social-accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    } catch (err) {
      alert("Failed to disconnect account");
    } finally {
      setDisconnecting(null);
    }
  }

  const facebookAccounts = accounts.filter((a) => a.platform === "facebook");
  const instagramAccounts = accounts.filter((a) => a.platform === "instagram");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-10 flex items-center gap-4">
          <div className="rounded-xl bg-slate-800 p-3">
            <Settings className="h-6 w-6 text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Connected Accounts</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your Facebook and Instagram publishing accounts
            </p>
          </div>
        </header>

        {/* Success / Error from OAuth redirect */}
        {successParam && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400 text-sm"
          >
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            {platformParam
              ? `${platformParam} account(s) connected successfully!`
              : "Account connected successfully!"}
          </motion.div>
        )}

        {errorParam && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {decodeURIComponent(errorParam)}
          </motion.div>
        )}

        {/* How it works */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            How connecting works
          </h3>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
            <li>
              Clicking Connect redirects you to Facebook to authorize the app
            </li>
            <li>
              We fetch your Facebook Pages and linked Instagram Business
              Accounts
            </li>
            <li>Both Facebook and Instagram are connected in one step</li>
            <li>
              Instagram must be a Business or Creator account linked to a
              Facebook Page
            </li>
          </ul>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="animate-spin h-4 w-4" />
            Loading connected accounts...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Facebook */}
            <PlatformSection
              platform="facebook"
              accounts={facebookAccounts}
              onDisconnect={disconnectAccount}
              disconnecting={disconnecting}
            />

            {/* Instagram */}
            <PlatformSection
              platform="instagram"
              accounts={instagramAccounts}
              onDisconnect={disconnectAccount}
              disconnecting={disconnecting}
            />
          </div>
        )}

        <button
          onClick={fetchAccounts}
          className="mt-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </section>
    </main>
  );
}

function PlatformSection({
  platform,
  accounts,
  onDisconnect,
  disconnecting,
}: {
  platform: "facebook" | "instagram";
  accounts: SocialAccount[];
  onDisconnect: (id: string) => void;
  disconnecting: string | null;
}) {
  const isFb = platform === "facebook";
  const Icon = isFb ? Facebook : Instagram;
  const color = isFb ? "blue" : "pink";
  const connectHref = `/api/auth/facebook?platform=${platform}`;

  const label = isFb ? "Facebook Pages" : "Instagram Accounts";
  const connectLabel = isFb
    ? "Connect Facebook Page"
    : "Connect Instagram Account";
  const hint = isFb
    ? "Requires a Facebook Page (not a personal profile)"
    : "Your Instagram must be a Business/Creator account linked to a Facebook Page";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      {/* Section Header */}
      <div
        className={`flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-${color}-600/5`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 text-${color}-400`} />
          <span className="font-medium">{label}</span>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {accounts.length} connected
          </span>
        </div>
        {/* ✅ FIX: Added missing opening <a> tag */}
        <a
          href={connectHref}
          className={`flex items-center gap-2 rounded-lg bg-${color}-600 hover:bg-${color}-500 px-3 py-1.5 text-xs font-medium text-white transition`}
        >
          <Link2 className="h-3.5 w-3.5" />
          {connectLabel}
        </a>
      </div>

      {/* Accounts List */}
      <div className="p-4 space-y-3">
        {accounts.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">
            <p>No {platform} accounts connected yet.</p>
            <p className="text-xs mt-1 text-slate-600">{hint}</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {account.accountName}
                </p>
                <p className="text-xs text-slate-400">
                  ID:{" "}
                  {platform === "instagram"
                    ? account.igAccountId
                    : account.accountId}
                </p>
                {account.tokenExpiry && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Token expires:{" "}
                    {new Date(account.tokenExpiry).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => onDisconnect(account.id)}
                disabled={disconnecting === account.id}
                className="flex items-center gap-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 border border-red-600/30 text-red-400 hover:text-white px-3 py-1.5 text-xs transition disabled:opacity-50"
              >
                {disconnecting === account.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Unlink className="h-3 w-3" />
                )}
                Disconnect
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
