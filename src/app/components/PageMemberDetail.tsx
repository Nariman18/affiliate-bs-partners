"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ChevronRight,
  MousePointer2,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle2,
  Link as LinkIcon,
  Users,
  Mail,
  Send,
  ExternalLink,
} from "lucide-react";
import {
  Badge,
  StatCard,
  TableWrapper,
  Th,
  Td,
  EmptyState,
  TableSkeleton,
  TabBar,
  pageIn,
  stagger,
  fadeUp,
  SectionHeader,
  Spinner,
  fmt,
} from "./dashboard/UI";
import { useTeamMember } from "../hooks/useDashboard";
import { ROLES, type AppRole } from "../lib/api";

interface Props {
  memberId: string;
  role: AppRole; // viewer's role (admin or basic)
  onBack: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.BASIC]: "Basic Sub-Affiliate",
  [ROLES.MANAGER]: "Affiliate Manager",
};

export default function PageMemberDetail({ memberId, role, onBack }: Props) {
  const { data: member, isLoading } = useTeamMember(memberId);
  const [tab, setTab] = useState("Overview");

  if (isLoading) return <Spinner />;
  if (!member)
    return (
      <p className="text-zinc-500 text-sm py-10 text-center">
        Member not found.
      </p>
    );

  const isBasicMember = member.role === ROLES.BASIC;

  return (
    <motion.div
      key="member-detail"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-white transition-colors mb-5"
      >
        <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to Team
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-white/6 bg-zinc-900/60 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* FIX: Avatar Display Logic Added Here */}
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/8 flex items-center justify-center overflow-hidden flex-shrink-0">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.displayName ?? member.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-black text-amber-400">
                  {(member.displayName ?? member.username)
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {member.displayName ?? member.username}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-zinc-700/60 text-zinc-300 border-white/8">
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-sky-400 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  {member.email}
                </a>
                {member.telegramHandle && (
                  <a
                    href={`https://t.me/${member.telegramHandle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-sky-400 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    {member.telegramHandle}
                  </a>
                )}
                {member.supervisorName && (
                  <span className="text-xs text-zinc-600">
                    Supervisor:{" "}
                    <span className="text-zinc-400">
                      {member.supervisorName}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Balance summary */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {[
              {
                label: "Pending",
                value: member.pendingBalance ?? 0,
                color: "text-zinc-300",
                dot: "bg-zinc-500/80",
              },
              {
                label: "Approved",
                value: member.approvedBalance ?? 0,
                color: "text-amber-400",
                dot: "bg-amber-400/80",
              },
              {
                label: "Paid",
                value: member.paidBalance ?? 0,
                color: "text-emerald-400",
                dot: "bg-emerald-400/80",
              },
            ].map(({ label, value, color, dot }) => (
              <div
                key={label}
                className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-white/6 bg-zinc-900/60 text-center min-w-[75px] sm:min-w-[90px]"
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <div className={`w-1.5 h-1.5 rounded-sm ${dot}`} />
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                    {label}
                  </p>
                </div>
                <p className={`text-xs sm:text-sm font-black ${color}`}>
                  {fmt.usd(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6"
      >
        <StatCard
          label="Total Clicks"
          value={(member.totalClicks ?? 0).toLocaleString()}
          icon={<MousePointer2 className="w-4 h-4" />}
        />
        <StatCard
          label="Total Deposits"
          value={String(member.totalDeposits ?? 0)}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          label="Total Revenue"
          value={fmt.usd(member.totalRevenue ?? 0)}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="30d Revenue"
          value={fmt.usd(member.revenue30d ?? 0)}
          sub={`${member.deposits30d ?? 0} deposits`}
          icon={<Clock className="w-4 h-4" />}
        />
      </motion.div>

      {/* Tabs */}
      <TabBar
        tabs={
          isBasicMember
            ? ["Deposits", "Links", "Managers"]
            : ["Deposits", "Links"]
        }
        active={tab}
        onChange={setTab}
      />

      {/* Recent Deposits */}
      {tab === "Deposits" && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Offer</Th>
              <Th>Amount</Th>
              <Th>Currency</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {(member.recentDeposits ?? []).length === 0 ? (
              <EmptyState colSpan={5} label="No deposits yet." />
            ) : (
              (member.recentDeposits ?? []).map((d: any) => (
                <tr key={d.id} className="hover:bg-white/2">
                  <Td>
                    <span className="text-xs">{fmt.dateTime(d.createdAt)}</span>
                  </Td>
                  <Td>
                    <span className="text-xs text-zinc-300">
                      {d.link?.offer?.name ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-semibold text-emerald-400">
                      {fmt.usd(d.amount)}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-zinc-500">{d.currency}</span>
                  </Td>
                  <Td>
                    <Badge
                      variant={d.status === "confirmed" ? "green" : "yellow"}
                    >
                      {d.status}
                    </Badge>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrapper>
      )}

      {/* Tracking Links */}
      {tab === "Links" && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Offer</Th>
              <Th>Link Name</Th>
              <Th>Sub ID</Th>
              <Th>Clicks</Th>
              <Th>Deposits</Th>
              <Th>Tracking URL</Th>
            </tr>
          </thead>
          <tbody>
            {(member.links ?? []).length === 0 ? (
              <EmptyState colSpan={6} label="No tracking links yet." />
            ) : (
              (member.links ?? []).map((link: any) => (
                <tr key={link.id} className="hover:bg-white/2">
                  <Td>
                    <div>
                      <div className="text-sm font-semibold text-zinc-300">
                        {link.offer?.name ?? "—"}
                      </div>
                      <div className="text-xs text-zinc-600">
                        {link.offer?.category ?? ""}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span className="text-xs text-zinc-300">{link.name}</span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs text-zinc-500">
                      {link.subId ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-zinc-300">
                      {link._count?.clicks ?? 0}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-emerald-400">
                      {link._count?.deposits ?? 0}
                    </span>
                  </Td>
                  <Td>
                    <code className="text-[10px] font-mono text-sky-400">
                      {`/track/${link.id}`}
                    </code>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrapper>
      )}

      {/* Sub-team (for BASIC members only) */}
      {tab === "Managers" && isBasicMember && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Manager</Th>
              <Th>Role</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {(member.subordinates ?? []).length === 0 ? (
              <EmptyState
                colSpan={3}
                label="No managers under this sub-affiliate yet."
              />
            ) : (
              (member.subordinates ?? []).map((sub: any) => (
                <tr key={sub.id} className="hover:bg-white/2">
                  <Td>
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {sub.username}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge variant="blue">Manager</Badge>
                  </Td>
                  <Td>
                    <span className="text-xs">{fmt.date(sub.createdAt)}</span>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrapper>
      )}

      {/* Default wallet */}
      {member.defaultWallet && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-5 rounded-2xl border border-white/6 bg-zinc-900/40 p-4"
        >
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
            Default Payout Wallet
          </p>
          <div className="flex items-center gap-3">
            <Wallet className="w-4 h-4 text-sky-400" />
            <div>
              <p className="font-mono text-xs text-zinc-300">
                {member.defaultWallet.address}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">
                {member.defaultWallet.network} · {member.defaultWallet.currency}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
