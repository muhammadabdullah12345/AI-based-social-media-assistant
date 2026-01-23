"use client";
import { motion } from "framer-motion";
import {
  Sparkles,
  Calendar,
  ShieldCheck,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import { redirect } from "next/navigation";

export default function GeneratifyLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight text-white">
            Generatify
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition">
              Features
            </a>
            <a href="#how" className="hover:text-white transition">
              How it Works
            </a>
            <a href="#contact" className="hover:text-white transition">
              Contact
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 text-sm rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              onClick={() => redirect("/login")}
            >
              Login
            </button>
            <button
              className="px-4 py-2 cursor-pointer text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
              onClick={() => redirect("/signup")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Create. Automate. <span className="text-indigo-500">Publish.</span>
          </motion.h1>
          <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Generatify is an AI-powered social media assistant that helps you
            generate content and publish it automatically across platforms —
            faster than ever.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <button className="px-8 py-3 cursor-pointer rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-lg font-medium">
              Get Started
            </button>
            <button className="px-8 py-3 cursor-pointer rounded-xl border border-slate-700 hover:border-slate-500 transition text-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center">
            Powerful Features
          </h2>
          <p className="text-center text-slate-400 mt-4">
            Everything you need to manage content intelligently
          </p>
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI Content Generation",
                desc: "Generate engaging, platform-optimized posts instantly.",
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                desc: "Schedule posts across multiple platforms effortlessly.",
              },
              {
                icon: ShieldCheck,
                title: "Secure & Reliable",
                desc: "Built with modern authentication and secure APIs.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center hover:border-indigo-600 transition"
              >
                <f.icon className="mx-auto h-10 w-10 text-indigo-500" />
                <h3 className="mt-6 text-xl font-semibold">{f.title}</h3>
                <p className="mt-3 text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center">
          {["Connect Accounts", "Generate Content", "Auto Publish"].map(
            (step, i) => (
              <div key={i} className="space-y-4">
                <div className="text-5xl font-bold text-indigo-600">
                  0{i + 1}
                </div>
                <h3 className="text-xl font-semibold">{step}</h3>
                <p className="text-slate-400">
                  Simple, fast, and optimized workflow powered by AI.
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Start Growing Smarter Today
        </h2>
        <p className="mt-4 text-indigo-100">
          Let Generatify handle your content while you focus on growth.
        </p>
        <div className="mt-8">
          <button className="px-8 py-3 cursor-pointer rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition">
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-slate-950 border-t border-slate-800 py-10"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400">
            © {new Date().getFullYear()} Generatify. All rights reserved.
          </p>
          <div className="flex gap-5 text-slate-400">
            <Twitter className="hover:text-white cursor-pointer" />
            <Linkedin className="hover:text-white cursor-pointer" />
            <Github className="hover:text-white cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}
