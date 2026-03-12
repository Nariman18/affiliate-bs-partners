"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Copy,
  CheckCircle2,
  Package,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  Badge,
  StatCard,
  TableWrapper,
  Th,
  Td,
  EmptyState,
  TableSkeleton,
  stagger,
  pageIn,
  SectionHeader,
  fmt,
} from "./dashboard/UI";
import {
  useMyReferrals,
  useReferralLink,
  useReferralStats,
} from "../hooks/useDashboard";

export default function PageReferrals() {
  const [copied, setCopied] = useState(false);
  const { data: linkData } = useReferralLink();
  const { data: referrals = [], isLoading } = useMyReferrals();
  const { data: stats } = useReferralStats();

  const referralLink = linkData?.link ?? "";
  const targetRole = linkData?.targetRole ?? "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      key="referrals"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <SectionHeader
        title="Referrals"
        sub="Manage your team and track referral performance"
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7"
      >
        <StatCard
          label="Total Referrals"
          value={String(stats?.totalReferrals ?? 0)}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Total Earned"
          value={fmt.usd(stats?.totalEarned ?? 0)}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="Pending Balance"
          value={fmt.usd(stats?.pendingBalance ?? 0)}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          label="Approved"
          value={fmt.usd(stats?.approvedBalance ?? 0)}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
      </motion.div>

      {/* Invite link banner */}
      <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/8 via-zinc-900/40 to-zinc-900/60 p-7 mb-7 flex items-center justify-between">
        <div className="max-w-lg">
          <h3 className="text-xl font-black text-white mb-2">
            Invite{" "}
            <span className="text-amber-400">
              {targetRole === "AFFILIATE_MANAGER"
                ? "Affiliate Managers"
                : "Basic Sub-Affiliates"}
            </span>{" "}
            to your team
          </h3>
          <p className="text-sm text-zinc-500 mb-4">
            Share your unique invite link. When they register and start
            generating traffic, you earn commission from every deposit they
            bring in.
          </p>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Your Invite Link
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-zinc-800/60 font-mono text-xs text-zinc-400 truncate">
                {referralLink || "Loading…"}
              </div>
              <button
                onClick={handleCopy}
                disabled={!referralLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all disabled:opacity-50"
              >
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
        <div className="hidden md:flex w-28 h-28 rounded-2xl bg-amber-400/10 border border-amber-400/20 items-center justify-center">
          <Package className="w-12 h-12 text-amber-400/60" />
        </div>
      </div>

      {/* Referrals table */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">Your Referrals</h3>
        <span className="text-xs text-zinc-600">
          {referrals.length} results
        </span>
      </div>
      <TableWrapper>
        <thead>
          <tr>
            <Th>User</Th>
            <Th>Role</Th>
            <Th>Joined</Th>
            <Th>Their 30d Commission</Th>
            <Th>My 30d Earnings</Th>
            <Th>Total Earned</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={3} cols={6} />
          ) : referrals.length === 0 ? (
            <EmptyState
              label="No referrals yet. Share your invite link to get started."
              colSpan={6}
            />
          ) : (
            referrals.map((r: any) => (
              <tr key={r.id} className="hover:bg-white/2 transition-colors">
                <Td>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {r.displayName ?? r.username}
                    </div>
                    <div className="text-xs text-zinc-600">{r.email}</div>
                  </div>
                </Td>
                <Td>
                  <Badge
                    variant={r.role === "AFFILIATE_MANAGER" ? "blue" : "amber"}
                  >
                    {r.role === "AFFILIATE_MANAGER" ? "Manager" : "Basic Sub"}
                  </Badge>
                </Td>
                <Td>
                  <span className="text-xs">{fmt.date(r.joinedAt)}</span>
                </Td>
                <Td>
                  <span className="text-zinc-300">
                    {fmt.usd(r.thirtyDaySubCommission ?? 0)}
                  </span>
                </Td>
                <Td>
                  <span className="font-semibold text-amber-400">
                    {fmt.usd(r.myThirtyDayEarnings ?? 0)}
                  </span>
                </Td>
                <Td>
                  <span className="font-semibold text-emerald-400">
                    {fmt.usd(r.totalEarned ?? 0)}
                  </span>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrapper>
    </motion.div>
  );
}
