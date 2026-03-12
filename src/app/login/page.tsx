"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Lock, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useLogin } from "../hooks/useAuth";
import Image from "next/image";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 flex flex-col lg:flex-row selection:bg-amber-400 selection:text-black">
      {/* ── Left Side: Form Container  ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative z-10 min-h-screen lg:min-h-0">
        {/* Constrain the max width of the actual form content */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          className="w-full max-w-md flex flex-col justify-center"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="relative w-30 h-15 block">
              <Image
                alt="CatLogo"
                src="/LogoCat.png"
                fill
                className="object-contain"
              />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/8 bg-zinc-900/60 backdrop-blur-xl p-8 shadow-2xl">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-zinc-400 mb-8">
              Access your partner dashboard.
            </p>

            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email or Username */}
              <div className="flex flex-col space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Email or Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all placeholder:text-zinc-600"
                    placeholder="badcat@example.com or your_handle"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-[10px] font-bold text-amber-400/80 hover:text-amber-400 transition-colors uppercase tracking-wider"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all placeholder:text-zinc-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loginMutation.isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full mt-4 group flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-400 text-black font-bold text-sm shadow-[0_0_40px_rgba(251,191,36,0.2)] transition-all ${
                  loginMutation.isPending
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-amber-300"
                }`}
              >
                {loginMutation.isPending ? "Authenticating..." : "Authenticate"}
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </motion.button>

              {/* Show Error Message if exists */}
              {loginMutation.isError && (
                <p className="text-rose-500 text-xs mt-2 text-center font-medium">
                  Invalid credentials. Please try again.
                </p>
              )}
            </form>

            <div className="mt-8 text-center pt-6 border-t border-white/5">
              <p className="text-xs text-zinc-500 font-medium">
                Need network access?{" "}
                <Link
                  href="/register"
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right Side: Image Container ── */}
      {/* Hidden on mobile to prevent ridiculous scrolling, visible on lg screens */}
      <div className="hidden lg:block lg:w-1/2 relative min-h-screen">
        <Image
          alt="CatLoginRegister"
          src="/CatLoginRegister.png"
          fill
          priority
          className="object-cover"
        />
        {/* Optional: Add a subtle gradient overlay so the image blends into the dark background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-transparent to-transparent opacity-80 pointer-events-none" />
      </div>
    </div>
  );
}
