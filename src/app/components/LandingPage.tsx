"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { Variants } from "motion/react";
import {
  ArrowUpRight,
  Shield,
  BarChart3,
  MousePointer2,
  Coins,
  Activity,
  ChevronRight,
  Lock,
} from "lucide-react";
import Link from "next/link";
import CurvedLoop from "@/components/CurvedLoop";
import Header from "./Header";
import Image from "next/image";
import CountUp from "@/components/CountUp";

// ─── Easing ───────────────────────────────────────────────────────────────────
// Must be typed `as const` so TS infers [number, number, number, number]
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  // Framer Motion calls the function with the `custom` prop value when set.
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: EASE_OUT_EXPO,
    },
  }),
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.75,
      ease: EASE_OUT_EXPO,
    },
  },
};

// ─── Shared viewport config ───────────────────────────────────────────────────
// once: false  →  animations re-fire every time the element enters the viewport
const VP = { once: false, margin: "-100px" } as const;
const VP_LOOSE = { once: false, margin: "-80px" } as const;

// ─── StatPill ─────────────────────────────────────────────────────────────────
function StatPill({
  to,
  from = 0,
  direction = "up",
  prefix = "",
  suffix = "",
  label,
  i,
}: {
  to: number;
  from?: number;
  direction?: "up" | "down";
  prefix?: string;
  suffix?: string;
  label: string;
  i: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={i}
      className="flex flex-col items-center gap-1 px-8 py-5 rounded-2xl border border-white/8 bg-white/4 backdrop-blur-md"
    >
      <span className="text-4xl font-black tracking-tighter bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent flex items-center justify-center">
        {prefix}
        <CountUp
          from={from}
          to={to}
          direction={direction}
          duration={2}
          separator=","
        />
        {suffix}
      </span>
      <span className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
        {label}
      </span>
    </motion.div>
  );
}

// ─── BentoCard ────────────────────────────────────────────────────────────────
function BentoCard({
  icon,
  title,
  description,
  accent,
  span,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: string;
  span?: string;
  badge?: string;
}) {
  return (
    <motion.div
      variants={cardReveal}
      whileHover={{ y: -4, transition: { duration: 0.3, ease: "easeOut" } }}
      className={`group relative rounded-3xl border border-white/8 bg-zinc-900/60 backdrop-blur-xl p-7 overflow-hidden flex flex-col justify-between gap-6 ${span ?? ""}`}
    >
      {/* glow blob */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-700 ${accent ?? "bg-amber-400"}`}
      />

      {/* icon + badge */}
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-zinc-800 border border-white/10 text-amber-400 group-hover:bg-amber-400/15 transition-colors duration-300">
          {icon}
        </div>
        {badge && (
          <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
            {badge}
          </span>
        )}
      </div>

      {/* text */}
      <div>
        <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
      </div>

      {/* bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 font-sans selection:bg-amber-400 selection:text-black antialiased">
      {/* Noise overlay */}

      {/* Nav */}
      <Header />

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative w-full h-screen bg-black overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-0"
        >
          <video
            src="/BC Partners backgroun video.mp4"
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            className="w-full h-full object-cover pointer-events-none"
          />
        </motion.div>

        <div className="absolute inset-0 bg-black/40 z-[2]" />

        {/* ── Hero Content Container ── */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute inset-0 flex flex-col justify-center z-10 pointer-events-none"
        >
          <div className="w-full max-w-7xl mx-auto px-7 pt-20 flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: EASE_OUT_EXPO }}
              className="mb-6 flex items-center gap-2 px-2 sm:px-4 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/8 text-amber-400 text-xs font-bold tracking-widest uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              iGaming Affiliate Infrastructure
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.9, ease: EASE_OUT_EXPO }}
              className="text-5xl md:text-[2.5rem] lg:text-[4rem] w-65 font-black text-white text-start tracking-[-0.04em] leading-[0.9] drop-shadow-2xl max-w-3xl"
            >
              BAD CAT{" "}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                PARTNERS
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.8, ease: EASE_OUT_EXPO }}
              className="mt-8 text-zinc-400 text-base md:text-lg max-w-lg text-start leading-relaxed"
            >
              High-volume affiliate management for serious iGaming operators.
              Real-time tracking, crypto payouts, and analytics at the edge.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7, ease: EASE_OUT_EXPO }}
              className="mt-10 flex items-center gap-4 pointer-events-auto"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link
                  href="/register"
                  className="group flex items-center gap-2 px-3 sm:px-6 py-3.5 rounded-xl bg-amber-400 text-black font-bold text-sm hover:bg-amber-300 transition-colors shadow-[0_0_40px_rgba(251,191,36,0.35)]"
                >
                  Start Earning
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <a
                  href="#features"
                  className="flex items-center gap-2 px-3 sm:px-6 py-3.5 rounded-xl border border-white/12 text-zinc-300 text-sm font-semibold hover:border-white/30 hover:text-white transition-all backdrop-blur-sm"
                >
                  Explore Platform
                </a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Partners marquee ── */}
      <section id="partners" className="relative z-10 bg-[#080808]">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        <div className="py-8">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600 mb-6">
            Trusted Networks
          </p>
          <CurvedLoop
            marqueeText="Mostbet  ✦  Twin  ✦  SlotV  ✦  AmonBet  ✦  N1 Partners  ✦  NV Casino  ✦  Parimatch  ✦  Fairpari Partners  ✦  Pin-Up Partners  ✦"
            speed={0.5}
            curveAmount={0}
            direction="right"
            interactive={false}
            className="text-zinc-600 text-sm font-semibold tracking-wider"
          />
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </section>

      {/* ── Stats ── */}
      <section className="relative z-10 py-16 px-6 bg-[#080808]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VP_LOOSE}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              {
                id: 1,
                prefix: "$",
                to: 2.4,
                suffix: "B+",
                label: "Tracked Revenue",
              },
              { id: 2, to: 840, suffix: "M+", label: "Clicks Logged" },
              {
                id: 3,
                from: 50,
                to: 0,
                direction: "down" as const,
                suffix: "ms",
                label: "Event Latency",
              },
              { id: 4, to: 99.98, suffix: "%", label: "Uptime SLA" },
            ].map((s, i) => (
              <StatPill key={s.label} {...s} i={s.id} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Bento features ── */}
      <section
        id="features"
        className="relative z-10 py-12 sm:py-24 px-6 bg-[#080808]"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          variants={staggerContainer}
          className="max-w-7xl mx-auto mb-14"
        >
          <motion.p
            variants={fadeUp}
            className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500 mb-4"
          >
            Platform Capabilities
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-4xl md:text-6xl font-black tracking-[-0.03em] text-white max-w-2xl leading-[1.0]"
          >
            Everything you need.{" "}
            <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              Nothing you don&apos;t.
            </span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          variants={staggerContainer}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px]"
        >
          <BentoCard
            icon={<MousePointer2 className="w-5 h-5" />}
            title="Zero-Latency Click Tracking"
            description="Our edge-deployed tracking layer captures every click, impression, and conversion across all your campaigns in real time. Sub-5ms event capture with 99.98% SLA."
            accent="bg-amber-400"
            span="md:col-span-2"
            badge="Core"
          />
          <BentoCard
            icon={<Coins className="w-5 h-5" />}
            title="Crypto-Native Payouts"
            description="USDT, BTC, ETH. Multi-signature verification, scheduled or on-demand withdrawals, and a full audit trail."
            accent="bg-emerald-400"
            badge="Web3"
          />
          <BentoCard
            icon={<BarChart3 className="w-5 h-5" />}
            title="Deep Analytics Suite"
            description="Traffic source breakdowns, funnel visualization, cohort analysis, and custom dashboards — all in a minimal interface."
            accent="bg-sky-400"
          />
          <BentoCard
            icon={<Shield className="w-5 h-5" />}
            title="Fraud Prevention"
            description="ML-powered bot detection, IP reputation scoring, and real-time click fraud alerts protect your commission spend."
            accent="bg-rose-400"
          />
          <BentoCard
            icon={<Activity className="w-5 h-5" />}
            title="Live Conversion Feed"
            description="Watch conversions roll in as they happen. Webhook-first architecture so you're never waiting for batch syncs."
            accent="bg-violet-400"
            badge="Live"
          />
          <BentoCard
            icon={<Lock className="w-5 h-5" />}
            title="Enterprise-Grade Access Control"
            description="Role-based permissions, SSO support, IP whitelisting, and detailed audit logs for compliance-heavy markets. Your data stays yours."
            accent="bg-amber-400"
            span="md:col-span-2"
          />

          {/* CTA card */}
          <motion.div
            variants={cardReveal}
            whileHover={{ scale: 1.02, transition: { duration: 0.25 } }}
            className="relative rounded-3xl overflow-hidden flex flex-col items-start justify-end p-7 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500"
          >
            <div className="absolute top-5 right-5">
              <ArrowUpRight className="w-6 h-6 text-black/40" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-black/50 mb-2">
              Ready to scale?
            </p>
            <h3 className="text-2xl font-black text-black tracking-tight leading-tight mb-4">
              Join BC Partners today.
            </h3>
            <Link
              href="/register"
              className="flex items-center gap-1.5 text-xs font-bold text-black bg-black/15 hover:bg-black/25 transition-colors px-4 py-2.5 rounded-xl"
            >
              Apply Now <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── CurvedLoop divider ── */}
      <section className="relative z-10 bg-[#080808] py-0 sm:py-6">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent mb-6" />
        <CurvedLoop
          marqueeText="🇵🇹 Portugal  ✦  🇧🇷 Brazil  ✦  🇵🇱 Poland  ✦  🇩🇪 Germany  ✦  🇨🇦 Canada  ✦  🇦🇺 Australia  ✦  🇮🇳 India  ✦  🇹🇷 Turkey  ✦  🇪🇸 Spain  ✦  🇮🇹 Italy  ✦  🇫🇷 France  ✦  🇿🇦 South Africa  ✦  🇬🇧 UK  ✦"
          speed={0.35}
          curveAmount={0}
          direction="left"
          interactive={false}
          className="text-amber-500/40 text-xs font-bold tracking-[0.15em] uppercase"
        />
        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent mt-6" />
      </section>

      {/* ── Testimonials ── */}
      <section className="relative z-10 bg-[#080808] py-12 sm:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={VP}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                quote:
                  "BC Partners completely replaced our legacy tracker. The latency improvement alone added 4% to our CR.",
                author: "Head of Affiliates, N1 Casino",
              },
              {
                quote:
                  "Finally a platform that treats crypto payouts as a first-class feature, not an afterthought.",
                author: "CTO, Parimatch",
              },
              {
                quote:
                  "The fraud detection blocked $180k in fake traffic in the first month. ROI was immediate.",
                author: "Performance Director, Mostbet",
              },
            ].map((t, i) => (
              <motion.blockquote
                key={i}
                variants={cardReveal}
                className="rounded-2xl border border-white/8 bg-zinc-900/50 p-7 flex flex-col justify-between gap-6"
              >
                <p className="text-zinc-300 text-sm leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
                  — {t.author}
                </footer>
              </motion.blockquote>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative z-10 py-12 sm:py-32 px-6 bg-[#080808] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-amber-400/8 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={VP}
          variants={staggerContainer}
          className="relative max-w-3xl mx-auto text-center"
        >
          <motion.p
            variants={fadeUp}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 mb-5"
          >
            Get Access
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-5xl md:text-7xl font-black tracking-[-0.04em] text-white leading-[0.95] mb-8"
          >
            Scale your traffic.{" "}
            <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              Maximise returns.
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-zinc-500 text-base mb-10 max-w-lg mx-auto leading-relaxed"
          >
            Join hundreds of iGaming affiliates already generating high-quality
            traffic on the BC Partners network.
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-400 text-black font-bold text-sm hover:bg-amber-300 transition-colors shadow-[0_0_60px_rgba(251,191,36,0.3)]"
              >
                Apply as Affiliate
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
            <Link
              href="/login"
              className="text-sm font-semibold text-zinc-500 hover:text-white transition-colors"
            >
              Sign in →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/6 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative w-30 h-15">
            <Image
              alt="CatLogo"
              src="/LogoCat.png"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-[11px] text-zinc-400">
            © 2026 Bad Cat Partners. All rights reserved.
          </p>
          <div className="flex gap-6 text-[11px] font-semibold text-zinc-400">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                className="hover:text-white transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
