"use client";

import React from "react";
import { motion } from "motion/react";
import { ChevronDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

// ─── Animation constants (shared) ─────────────────────────────────────────────
export const EASE = [0.16, 1, 0.3, 1] as const;

export const pageIn = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: EASE } },
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// ─── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = "default" | "green" | "yellow" | "red" | "amber" | "blue";
export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  const cls: Record<BadgeVariant, string> = {
    default: "bg-zinc-700/60 text-zinc-300",
    green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
    yellow: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
    red: "bg-rose-500/15 text-rose-400 border border-rose-500/25",
    amber: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
    blue: "bg-sky-500/15 text-sky-400 border border-sky-500/25",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${cls[variant]}`}
    >
      {children}
    </span>
  );
}

// ─── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="relative rounded-2xl border border-white/6 bg-zinc-900/70 backdrop-blur-xl p-5 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-white/8 flex items-center justify-center text-amber-400">
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-bold ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-zinc-500"}`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : trend === "down" ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : null}
            {sub}
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-zinc-800 rounded-lg animate-pulse mb-1" />
      ) : (
        <div className="text-2xl font-black tracking-tight text-white mb-1">
          {value}
        </div>
      )}
      <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
        {label}
      </div>
    </motion.div>
  );
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <motion.div variants={fadeUp} className="mb-6">
      <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
      {sub && <p className="text-sm text-zinc-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

// ─── TabBar ────────────────────────────────────────────────────────────────────
export function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-white/6 mb-6 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`relative px-4 py-2.5 text-xs font-bold tracking-wide transition-colors whitespace-nowrap ${active === t ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          {t}
          {active === t && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full"
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Table helpers ─────────────────────────────────────────────────────────────
export function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-zinc-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-zinc-600 border-b border-white/5">
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-3.5 text-sm text-zinc-300 border-b border-white/4 ${className}`}
    >
      {children}
    </td>
  );
}

export function EmptyState({
  label = "No data found.",
  colSpan = 20,
}: {
  label?: string;
  colSpan?: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center text-sm text-zinc-600">
        {label}
      </td>
    </tr>
  );
}

export function TableSkeleton({
  rows = 3,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3.5 border-b border-white/4">
              <div className="h-4 bg-zinc-800 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Buttons ───────────────────────────────────────────────────────────────────
export function AmberBtn({
  children,
  onClick,
  small,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  small?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 font-bold text-black bg-amber-400 hover:bg-amber-300 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${small ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs"}`}
    >
      {children}
    </motion.button>
  );
}

export function OutlineBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-zinc-800/40 text-xs font-semibold text-zinc-400 hover:border-white/20 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">{children}</div>
  );
}

export function FilterBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-zinc-800/60 text-xs font-semibold text-zinc-400 hover:border-white/20 hover:text-white transition-all"
    >
      {children}
      <ChevronDown className="w-3 h-3" />
    </button>
  );
}

// ─── Loading spinner ───────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );
}

// ─── Error message ─────────────────────────────────────────────────────────────
export function QueryError({
  message = "Failed to load data.",
}: {
  message?: string;
}) {
  return (
    <div className="py-10 text-center text-sm text-rose-400">{message}</div>
  );
}

// ─── Modal wrapper ─────────────────────────────────────────────────────────────
export function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── Format helpers ────────────────────────────────────────────────────────────
export const fmt = {
  usd: (v: number) =>
    `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  pct: (v: number) => `${v.toFixed(1)}%`,
  date: (s: string) =>
    new Date(s).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  dateTime: (s: string) =>
    new Date(s).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  shortAddr: (a: string) => `${a.slice(0, 12)}…${a.slice(-6)}`,
};
