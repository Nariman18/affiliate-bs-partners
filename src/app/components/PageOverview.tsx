"use client";

import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  MousePointer2,
  TrendingUp,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  ChevronRight,
  Lock,
} from "lucide-react";
import {
  StatCard,
  stagger,
  fadeUp,
  pageIn,
  SectionHeader,
  fmt,
  Badge,
} from "./dashboard/UI";
import { ROLES, type AppRole } from "../lib/api";
import { useReportsOverview, useOffers } from "../hooks/useDashboard";

// ─── Quick Stats period selector ─────────────────────────────────────────────
const PERIODS = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
] as const;

function periodRange(days: number): { from: string; to: string } {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - days * 86_400_000)
    .toISOString()
    .slice(0, 10);
  return { from, to };
}

// ─── Mini sparkline (SVG) ─────────────────────────────────────────────────────
function Sparkline({ value }: { value: number }) {
  // Flat line with a dot at the end — data comes in as a single current value
  const w = 120,
    h = 40;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
      <line
        x1={0}
        y1={h - 4}
        x2={w - 8}
        y2={h - 4}
        stroke="#3b82f6"
        strokeWidth={1.5}
      />
      <circle
        cx={w - 8}
        cy={h - 4}
        r={3}
        fill="#3b82f6"
        stroke="#1e3a8a"
        strokeWidth={1.5}
      />
      {value > 0 && (
        <text x={w - 4} y={h - 1} fill="#6b7280" fontSize={9} textAnchor="end">
          {value}
        </text>
      )}
    </svg>
  );
}

// ─── Quick Stat card ──────────────────────────────────────────────────────────
function QuickCard({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string | number;
  isLoading?: boolean;
}) {
  const numVal = typeof value === "string" ? parseFloat(value) || 0 : value;
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-white/6 bg-zinc-900/70 p-4 overflow-hidden"
    >
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className="text-[10px] text-zinc-700 mb-2">Today</p>
      {isLoading ? (
        <div className="h-6 w-20 bg-zinc-800 rounded animate-pulse mb-2" />
      ) : (
        <p className="text-xl font-black text-white mb-1">{value}</p>
      )}
      <Sparkline value={numVal} />
    </motion.div>
  );
}

// ─── OFFER TO PROMOTE card (image-2 style) ────────────────────────────────────
const OFFER_CATS = [
  "All Categories",
  "FB Apps",
  "ASO",
  "PPC",
  "SEO",
  "In-App",
  "UAC",
  "Influence",
  "TikTok",
];

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  FR: "🇫🇷",
  IT: "🇮🇹",
  PL: "🇵🇱",
  ES: "🇪🇸",
  NL: "🇳🇱",
  NG: "🇳🇬",
  BR: "🇧🇷",
  IN: "🇮🇳",
  AU: "🇦🇺",
  CA: "🇨🇦",
  MX: "🇲🇽",
  JP: "🇯🇵",
  KR: "🇰🇷",
  RU: "🇷🇺",
  TR: "🇹🇷",
  ZA: "🇿🇦",
  EG: "🇪🇬",
  AR: "🇦🇷",
  CL: "🇨🇱",
  CO: "🇨🇴",
};

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  PL: "Poland",
  ES: "Spain",
  NL: "Netherlands",
  NG: "Nigeria",
  BR: "Brazil",
  IN: "India",
  AU: "Australia",
  CA: "Canada",
};

function OfferRow({ offer, onSelect }: { offer: any; onSelect: () => void }) {
  const country = offer.targetCountry ?? offer.geoTargets?.[0] ?? "";
  const flag = COUNTRY_FLAGS[country] ?? "🌍";
  const cname = COUNTRY_NAMES[country] ?? country ?? "Global";

  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0 hover:bg-white/1 transition-colors">
      {/* Logo */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 border border-white/8 flex-shrink-0">
        {offer.logoUrl ? (
          <img
            src={offer.logoUrl}
            alt={offer.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[11px] font-black text-zinc-400">
            {offer.name?.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-zinc-950/80 flex items-center justify-center">
          <Lock className="w-2.5 h-2.5 text-zinc-400" />
        </div>
      </div>

      {/* Name + badge */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/80 text-white uppercase">
            Top
          </span>
          <button
            onClick={onSelect}
            className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors truncate text-left"
          >
            {offer.name}
          </button>
        </div>
        <p className="text-[10px] text-zinc-600">{offer.category}</p>
      </div>

      {/* Payout — showing commission % since we don't have FTD/REG amounts */}
      <div className="w-40 hidden md:block">
        <div className="flex items-center justify-between text-xs mb-0.5">
          <span className="text-zinc-600">Commission</span>
          <span className="text-zinc-300 font-semibold">
            {fmt.pct(offer.commissionPct ?? 10)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-600">Min Dep</span>
          <span className="text-zinc-600">
            {offer.minDeposit ? fmt.usd(offer.minDeposit) : "—"}
          </span>
        </div>
      </div>

      {/* Country */}
      <div className="flex items-center gap-2 w-32 hidden lg:flex">
        <span className="text-base leading-none">{flag}</span>
        <span className="text-xs text-zinc-400">{cname}</span>
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-zinc-700 flex-shrink-0" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  role: AppRole;
  onSelectOffer?: (id: string) => void;
}

export default function PageOverview({ role, onSelectOffer }: Props) {
  const [period, setPeriod] = useState<number>(1);
  const [offerCat, setOfferCat] = useState("All Categories");

  const { from, to } = useMemo(() => periodRange(period), [period]);
  const { data, isLoading } = useReportsOverview({ from, to });
  const { data: offers = [] } = useOffers({
    category: offerCat !== "All Categories" ? offerCat : undefined,
  });

  const topOffers = (offers as any[]).slice(0, 5);

  // ── Quick stats values ─────────────────────────────────────────────────────
  const grossClicks = data?.totalClicks ?? 0;
  const uniqueClicks = data?.uniqueClicks ?? 0;
  const regs = data?.registrations ?? 0;
  const deposits = data?.conversions ?? 0;
  const crToReg = grossClicks > 0 ? fmt.pct((regs / grossClicks) * 100) : "0%";
  const crRegToDep = regs > 0 ? fmt.pct((deposits / regs) * 100) : "0%";
  const totalPayout = data?.totalRevenue ?? 0;
  const approvedPay = data?.approvedBalance ?? 0;

  return (
    <motion.div
      key="overview"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* ── Role-specific hero stats ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {role === ROLES.ADMIN && (
          <>
            <StatCard
              loading={isLoading}
              label="Total Affiliates"
              value={String(data?.totalAffiliates ?? 0)}
              trend="up"
              sub=""
              icon={<Users className="w-4 h-4" />}
            />
            <StatCard
              loading={isLoading}
              label="Total Clicks"
              value={grossClicks.toLocaleString()}
              icon={<MousePointer2 className="w-4 h-4" />}
            />
            <StatCard
              loading={isLoading}
              label="Total Revenue"
              value={fmt.usd(totalPayout)}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <StatCard
              loading={isLoading}
              label="Pending Payouts"
              value={fmt.usd(data?.pendingPayouts ?? 0)}
              icon={<Wallet className="w-4 h-4" />}
            />
          </>
        )}
        {role === ROLES.BASIC && (
          <>
            <StatCard
              loading={isLoading}
              label="Team Size"
              value={String(data?.teamSize ?? 0)}
              icon={<Users className="w-4 h-4" />}
            />
            <StatCard
              loading={isLoading}
              label="Approved Balance"
              value={fmt.usd(approvedPay)}
              icon={<CheckCircle2 className="w-4 h-4" />}
            />
            <StatCard
              loading={isLoading}
              label="Total Commission"
              value={fmt.usd(data?.totalCommission ?? 0)}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <StatCard
              loading={isLoading}
              label="Pending Balance"
              value={fmt.usd(data?.pendingBalance ?? 0)}
              icon={<Clock className="w-4 h-4" />}
            />
          </>
        )}
        {role === ROLES.MANAGER && (
          <>
            <StatCard
              loading={isLoading}
              label="Approved Balance"
              value={fmt.usd(approvedPay)}
              icon={<Wallet className="w-4 h-4" />}
            />
            <StatCard
              loading={isLoading}
              label="Pending Balance"
              value={fmt.usd(data?.pendingBalance ?? 0)}
              icon={<Clock className="w-4 h-4" />}
            />
            <StatCard
              loading={isLoading}
              label="Total Clicks"
              value={grossClicks.toLocaleString()}
              icon={<MousePointer2 className="w-4 h-4" />}
            />
            <StatCard
              loading={isLoading}
              label="Conversions"
              value={String(deposits)}
              icon={<CheckCircle2 className="w-4 h-4" />}
            />
          </>
        )}
      </motion.div>

      {/* ── Quick Stats ── */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-white/6 bg-zinc-900/50 p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-white">Quick Stats</h3>
          <div className="flex items-center gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPeriod(p.days)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  period === p.days
                    ? "bg-zinc-700 text-white border border-white/15"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <QuickCard
            label="Gross Clicks"
            value={grossClicks}
            isLoading={isLoading}
          />
          <QuickCard
            label="Unique Clicks"
            value={uniqueClicks}
            isLoading={isLoading}
          />
          <QuickCard label="Registrations" value={regs} isLoading={isLoading} />
          <QuickCard label="Deposits" value={deposits} isLoading={isLoading} />
          <QuickCard label="CR to Reg" value={crToReg} isLoading={isLoading} />
          <QuickCard
            label="CR Reg to Dep"
            value={crRegToDep}
            isLoading={isLoading}
          />
          <QuickCard
            label="Total Payout"
            value={fmt.usd(totalPayout)}
            isLoading={isLoading}
          />
          <QuickCard
            label="Approved Payout"
            value={fmt.usd(approvedPay)}
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>

      {/* ── Offers to Promote ── */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-white/6 bg-zinc-900/50 p-6"
      >
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-sm font-black text-white">Offers to Promote</h3>
          {onSelectOffer && (
            <button
              onClick={() => {}}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors border border-white/8 rounded-lg px-2.5 py-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-0 border-b border-white/6 mb-4 overflow-x-auto no-scrollbar">
          {OFFER_CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setOfferCat(cat)}
              className={`relative px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                offerCat === cat
                  ? "text-amber-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {cat}
              {offerCat === cat && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {topOffers.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-600">
            No offers available.
          </p>
        ) : (
          <div>
            {topOffers.map((offer: any) => (
              <OfferRow
                key={offer.id}
                offer={offer}
                onSelect={() => onSelectOffer?.(offer.id)}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
