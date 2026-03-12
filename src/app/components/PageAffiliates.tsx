"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Users,
  CheckCircle2,
  TrendingUp,
  Wallet,
  MoreVertical,
} from "lucide-react";
import {
  Badge,
  StatCard,
  TableWrapper,
  Th,
  Td,
  EmptyState,
  TableSkeleton,
  AmberBtn,
  Modal,
  stagger,
  pageIn,
  SectionHeader,
  fmt,
} from "./dashboard/UI";
import { useAffiliates, useReferralLink } from "../hooks/useDashboard";

export default function PageAffiliates() {
  const { data: affiliates = [], isLoading } = useAffiliates();
  const { data: linkData } = useReferralLink();
  const [copied, setCopied] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);

  const referralLink = linkData?.link ?? "";

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Aggregate stats from team data
  const totalRevenue = affiliates.reduce(
    (s: number, a: any) => s + (a.depositVolume ?? a.revenue ?? 0),
    0,
  );
  const totalCommission = affiliates.reduce(
    (s: number, a: any) => s + (a.totalCommission ?? a.commission ?? 0),
    0,
  );
  const active = affiliates.filter(
    (a: any) => (a.clicks ?? 0) > 0 || (a.depositCount ?? 0) > 0,
  ).length;

  return (
    <motion.div
      key="affiliates"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          title="Affiliate Managers"
          sub="Your network performance"
        />
        <div className="flex items-center gap-2">
          {referralLink && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
            >
              {copied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied!" : "Copy Invite Link"}
            </button>
          )}
        </div>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-4 gap-4 mb-7"
      >
        <StatCard
          label="Total Affiliates"
          value={String(affiliates.length)}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Active"
          value={String(active)}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          label="Total Revenue"
          value={fmt.usd(totalRevenue)}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="Total Commissions"
          value={fmt.usd(totalCommission)}
          icon={<Wallet className="w-4 h-4" />}
        />
      </motion.div>

      <TableWrapper>
        <thead>
          <tr>
            <Th>Affiliate</Th>
            <Th>Clicks</Th>
            <Th>Conversions</Th>
            <Th>Revenue</Th>
            <Th>Commission</Th>
            <Th>Default Wallet</Th>
            <Th>Joined</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={4} cols={8} />
          ) : affiliates.length === 0 ? (
            <EmptyState
              label="No affiliate managers yet. Share your invite link to get started."
              colSpan={8}
            />
          ) : (
            affiliates.map((aff: any) => (
              <tr
                key={aff.id}
                className="hover:bg-white/2 transition-colors cursor-pointer"
                onClick={() => setDetail(aff)}
              >
                <Td>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {aff.displayName ?? aff.username}
                    </div>
                    <div className="text-xs text-zinc-600">{aff.email}</div>
                  </div>
                </Td>
                <Td>{(aff.clicks ?? 0).toLocaleString()}</Td>
                <Td>{aff.depositCount ?? aff.conversions ?? 0}</Td>
                <Td>
                  <span className="font-semibold text-emerald-400">
                    {fmt.usd(aff.depositVolume ?? aff.revenue ?? 0)}
                  </span>
                </Td>
                <Td>
                  <span className="font-semibold text-amber-400">
                    {fmt.usd(aff.totalCommission ?? aff.commission ?? 0)}
                  </span>
                </Td>
                <Td>
                  {aff.defaultWallet ? (
                    <span className="font-mono text-xs text-zinc-500">
                      {fmt.shortAddr(aff.defaultWallet.address)}
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-xs">No wallet</span>
                  )}
                </Td>
                <Td>
                  <span className="text-xs">{fmt.date(aff.joinedAt)}</span>
                </Td>
                <Td>
                  <button
                    className="text-zinc-600 hover:text-zinc-300 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrapper>

      {/* ── Member detail modal ── */}
      <AnimatePresence>
        {detail && (
          <Modal onClose={() => setDetail(null)}>
            <h3 className="text-lg font-black text-white mb-1">
              {detail.displayName ?? detail.username}
            </h3>
            <p className="text-xs text-zinc-600 mb-5">{detail.email}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                {
                  label: "Pending Balance",
                  value: fmt.usd(detail.pendingBalance ?? 0),
                  color: "text-zinc-400",
                },
                {
                  label: "Approved Balance",
                  value: fmt.usd(detail.approvedBalance ?? 0),
                  color: "text-amber-400",
                },
                {
                  label: "Total Revenue",
                  value: fmt.usd(detail.depositVolume ?? detail.revenue ?? 0),
                  color: "text-emerald-400",
                },
                {
                  label: "Commission",
                  value: fmt.usd(
                    detail.totalCommission ?? detail.commission ?? 0,
                  ),
                  color: "text-amber-400",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="p-3 rounded-xl border border-white/6 bg-zinc-900/60"
                >
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                    {label}
                  </p>
                  <p className={`text-lg font-black ${color}`}>{value}</p>
                </div>
              ))}
            </div>
            {detail.defaultWallet && (
              <div className="p-3 rounded-xl border border-white/6 bg-zinc-900/60 mb-4">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                  Default Wallet
                </p>
                <p className="font-mono text-xs text-zinc-400">
                  {detail.defaultWallet.address}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  {detail.defaultWallet.network} ·{" "}
                  {detail.defaultWallet.currency}
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setDetail(null)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
