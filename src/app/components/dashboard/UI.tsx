"use client";

import React from "react";
import { motion } from "motion/react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

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
      className="relative rounded-2xl border border-white/6 bg-zinc-900/70 backdrop-blur-xl p-4 sm:p-5 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-800 border border-white/8 flex items-center justify-center text-amber-400">
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
        <div className="h-6 sm:h-7 w-20 sm:w-24 bg-zinc-800 rounded-lg animate-pulse mb-1" />
      ) : (
        <div className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
          {value}
        </div>
      )}
      <div className="text-[10px] sm:text-xs font-medium text-zinc-500 uppercase tracking-widest">
        {label}
      </div>
    </motion.div>
  );
}

export function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <motion.div variants={fadeUp} className="mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
        {title}
      </h2>
      {sub && <p className="text-sm text-zinc-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

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
    <div className="flex items-center gap-1 border-b border-white/6 mb-4 sm:mb-6 overflow-x-auto no-scrollbar">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`relative px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold tracking-wide transition-colors whitespace-nowrap ${active === t ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
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

export function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-zinc-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

// className prop added for responsive hiding: hidden sm:table-cell etc.
export function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 sm:px-4 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-zinc-600 border-b border-white/5 ${className}`}
    >
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
      className={`px-3 sm:px-4 py-3 sm:py-3.5 text-sm text-zinc-300 border-b border-white/4 ${className}`}
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
      <td
        colSpan={colSpan}
        className="py-12 sm:py-16 text-center text-sm text-zinc-600"
      >
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
            <td
              key={j}
              className="px-3 sm:px-4 py-3 sm:py-3.5 border-b border-white/4"
            >
              <div className="h-4 bg-zinc-800 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

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
    <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
      {children}
    </div>
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

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12 sm:py-16">
      <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
    </div>
  );
}

export function QueryError({
  message = "Failed to load data.",
}: {
  message?: string;
}) {
  return (
    <div className="py-10 text-center text-sm text-rose-400">{message}</div>
  );
}

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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg md:max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-4 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

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

export function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 4) {
    pages.push(1, 2, 3, 4, 5, "...", totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    );
  } else {
    pages.push(
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    );
  }
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(
    currentPage * pageSize,
    totalItems ?? currentPage * pageSize,
  );
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 sm:mt-5 px-1 gap-2">
      {totalItems !== undefined && (
        <p className="text-xs text-zinc-500 font-semibold tracking-wide">
          Showing {from}–{to} of {totalItems}
        </p>
      )}
      <div className="flex items-center gap-1 sm:gap-1.5 ml-auto flex-wrap">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border border-white/8 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-1 text-zinc-600 text-xs font-bold">
              …
            </span>
          ) : (
            <button
              key={i}
              onClick={() => onPageChange(p as number)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${currentPage === p ? "bg-amber-400 text-black" : "border border-white/8 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/5"}`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border border-white/8 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
