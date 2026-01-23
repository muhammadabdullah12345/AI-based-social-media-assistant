"use client";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { redirect } from "next/navigation";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-xl p-8"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Generatify</h1>
          <p className="mt-2 text-slate-400">
            Welcome back. Log in to your account.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          <div>
            <label className="block text-sm mb-2 text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-11 pr-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-11 pr-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400">
              <input type="checkbox" className="accent-indigo-600" />
              Remember me
            </label>
            <button className="text-indigo-500 hover:text-indigo-400 transition">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition py-3 font-medium"
          >
            Log In
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Don’t have an account?{" "}
          <button
            onClick={() => redirect("/signup")}
            className="text-indigo-500 hover:text-indigo-400 transition font- cursor-pointer"
          >
            Sign up
          </button>
        </p>
      </motion.div>
    </div>
  );
}
