"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

export default function Navbar1() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/", // redirect after logout
    });
  };

  return (
    <nav className="w-full px-6 py-4 bg-slate-950 sticky top-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold text-white">
          Generatify
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {status === "loading" ? null : session ? (
            <>
              {/* Dashboard */}
              <Link
                href="/dashboard"
                className="text-slate-300 hover:text-white transition"
              >
                Dashboard
              </Link>

              {/* Logout */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 transition text-sm font-medium cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </motion.button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                href="/login"
                className="text-slate-300 hover:text-white transition cursor-pointer"
              >
                Login
              </Link>

              {/* Signup */}
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-sm font-medium cursor-pointer"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
