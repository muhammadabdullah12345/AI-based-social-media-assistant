"use client";
import {
  Sparkles,
  Calendar,
  ShieldCheck,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import { redirect } from "next/navigation";

export default function GeneratifyLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Hero */}
      <Hero />
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
          <button
            className="px-8 py-3 cursor-pointer rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 transition"
            onClick={() => redirect("/signup")}
          >
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
