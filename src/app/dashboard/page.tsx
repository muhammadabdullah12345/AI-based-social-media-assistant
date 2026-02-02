"use client";

import Link from "next/link";
import { Instagram, Linkedin, Twitter, Facebook } from "lucide-react";
import { motion } from "framer-motion";

const platforms = [
  {
    name: "Instagram",
    description:
      "Create visually engaging captions and creatives optimized for Instagram engagement.",
    icon: Instagram,
    color: "from-pink-600 to-purple-600",
    bg: "bg-pink-600/10",
    href: "/dashboard/instagram",
  },
  {
    name: "LinkedIn",
    description:
      "Generate professional posts tailored for thought leadership and networking.",
    icon: Linkedin,
    color: "from-blue-600 to-sky-600",
    bg: "bg-blue-600/10",
    href: "/dashboard/linkedin",
  },
  {
    name: "Twitter (X)",
    description:
      "Craft short, impactful tweets designed for virality and conversations.",
    icon: Twitter,
    color: "from-slate-600 to-slate-400",
    bg: "bg-slate-600/10",
    href: "/dashboard/twitter",
  },
  {
    name: "Facebook",
    description:
      "Write community-focused posts perfect for discussions and storytelling.",
    icon: Facebook,
    color: "from-indigo-600 to-blue-600",
    bg: "bg-indigo-600/10",
    href: "/dashboard/facebook",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-14 text-center">
          <h1 className="text-4xl font-bold">Choose a Platform</h1>
          <p className="mt-3 text-slate-400 text-lg">
            Select where you want to generate AI-powered content
          </p>
        </header>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;

            return (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={platform.href}>
                  <div className="group h-full cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-xl transition-all hover:border-slate-700 hover:shadow-2xl">
                    {/* Icon */}
                    <div
                      className={`mb-6 inline-flex rounded-xl p-4 ${platform.bg}`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    {/* Text */}
                    <h2 className="text-xl font-semibold mb-2">
                      {platform.name}
                    </h2>

                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      {platform.description}
                    </p>

                    {/* CTA */}
                    <div className="mt-auto">
                      <div
                        className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-r ${platform.color} px-4 py-2 text-sm font-medium transition-transform group-hover:scale-105`}
                      >
                        Open Studio →
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
