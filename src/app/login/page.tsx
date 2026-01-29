"use client";

import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("test@gmail.com");
  const [password, setPassword] = useState("test123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // IMPORTANT
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    // login success
    router.push("/dashboard"); // or home page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Generatify</h1>
          <p className="mt-2 text-slate-400">
            Welcome back. Log in to your account.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-2 text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-11 pr-4 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-11 pr-4 py-3 text-sm"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition py-3 font-medium disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-indigo-500 hover:text-indigo-400 cursor-pointer"
          >
            Sign up
          </button>
        </p>
      </motion.div>
    </div>
  );
}
