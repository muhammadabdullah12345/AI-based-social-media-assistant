import React from "react";
import { motion } from "framer-motion";
import { redirect } from "next/navigation";

export default function Hero() {
  return (
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
          <button
            onClick={() => redirect("/login")}
            className="px-8 py-3 cursor-pointer rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-lg font-medium"
          >
            Get Started
          </button>
          <button className="px-8 py-3 cursor-pointer rounded-xl border border-slate-700 hover:border-slate-500 transition text-lg">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
