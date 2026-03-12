"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  TrendingUp,
  Wallet,
  Link as LinkIcon,
  ChevronRight,
  Copy,
  CheckCircle2,
  Plus,
  X,
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
  OutlineBtn,
  Modal,
  stagger,
  fadeUp,
  pageIn,
  SectionHeader,
  fmt,
} from "./dashboard/UI";
import {
  useTeam,
  useTeamMember,
  useReferralLink,
  useOffers,
  useCreateLink,
} from "../hooks/useDashboard";
import { ROLES, type AppRole } from "../lib/api";

interface Props {
  role: AppRole;
  userId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Member detail drawer
// ─────────────────────────────────────────────────────────────────────────────
function MemberDrawer({
  memberId,
  onClose,
  role,
}: {
  memberId: string;
  onClose: () => void;
  role: AppRole;
}) {
  const { data: member, isLoading } = useTeamMember(memberId);
  const { data: offers = [] } = useOffers();
  const createLink = useCreateLink();
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [linkSub, setLinkSub] = useState("");
  const [linkName, setLinkName] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);

  const handleCreateLink = () => {
    if (!selectedOfferId) return;
    createLink.mutate(
      {
        offerId: selectedOfferId,
        affiliateId: memberId,
        name: linkName || undefined,
        subId: linkSub || undefined,
      },
      {
        onSuccess: () => {
          setShowLinkForm(false);
          setSelectedOfferId("");
          setLinkSub("");
          setLinkName("");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="flex-1 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="w-[420px] bg-zinc-950 border-l border-white/8 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-[420px] bg-zinc-950 border-l border-white/8 overflow-y-auto flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/6">
          <div>
            <h3 className="font-black text-white">
              {member.displayName ?? member.username}
            </h3>
            <p className="text-xs text-zinc-500">{member.email}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Balances */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "Pending",
                value: member.pendingBalance,
                color: "text-zinc-400",
              },
              {
                label: "Approved",
                value: member.approvedBalance,
                color: "text-amber-400",
              },
              {
                label: "Paid",
                value: member.paidBalance,
                color: "text-emerald-400",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-xl border border-white/6 bg-zinc-900/60 p-3 text-center"
              >
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                  {label}
                </p>
                <p className={`text-sm font-black ${color}`}>
                  {fmt.usd(value ?? 0)}
                </p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-white/6 bg-zinc-900/40 p-4 space-y-2">
            {[
              ["Clicks", member.clicks],
              ["Deposits", member.recentDeposits?.length ?? 0],
              ["Joined", fmt.date(member.joinedAt)],
            ].map(([l, v]) => (
              <div
                key={l as string}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-600">{l}</span>
                <span className="text-zinc-300 font-semibold">{v}</span>
              </div>
            ))}
            {member.defaultWallet && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Default Wallet</span>
                <span className="font-mono text-xs text-zinc-400">
                  {fmt.shortAddr(member.defaultWallet.address)}
                </span>
              </div>
            )}
          </div>

          {/* Distribute link (Admin / Basic only) */}
          {(role === ROLES.ADMIN || role === ROLES.BASIC) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Assign Tracking Link
                </h4>
                {!showLinkForm && (
                  <button
                    onClick={() => setShowLinkForm(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> New Link
                  </button>
                )}
              </div>
              <AnimatePresence>
                {showLinkForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl border border-white/8 bg-zinc-900/60 p-4 space-y-3"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 block">
                        Offer *
                      </label>
                      <select
                        value={selectedOfferId}
                        onChange={(e) => setSelectedOfferId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                      >
                        <option value="">— Select offer —</option>
                        {(offers as any[]).map((o: any) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 block">
                          Link Name
                        </label>
                        <input
                          value={linkName}
                          onChange={(e) => setLinkName(e.target.value)}
                          placeholder="e.g. Instagram"
                          className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 block">
                          Sub ID
                        </label>
                        <input
                          value={linkSub}
                          onChange={(e) => setLinkSub(e.target.value)}
                          placeholder="optional"
                          className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowLinkForm(false)}
                        className="px-3 py-2 rounded-xl border border-white/8 text-xs font-semibold text-zinc-500 hover:text-white transition-colors flex-1"
                      >
                        Cancel
                      </button>
                      <AmberBtn
                        onClick={handleCreateLink}
                        disabled={!selectedOfferId || createLink.isPending}
                      >
                        <LinkIcon className="w-3 h-3" />
                        {createLink.isPending ? "Creating…" : "Create"}
                      </AmberBtn>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Recent deposits */}
          {member.recentDeposits?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Recent Deposits
              </h4>
              <div className="space-y-1.5">
                {member.recentDeposits.slice(0, 5).map((d: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-xl border border-white/6 bg-zinc-900/40"
                  >
                    <span className="text-xs text-zinc-500">
                      {fmt.dateTime(d.createdAt)}
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      {fmt.usd(d.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function PageTeam({ role, userId }: Props) {
  const { data: team = [], isLoading } = useTeam();
  const { data: linkData } = useReferralLink();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const referralLink = linkData?.link ?? "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalRevenue = (team as any[]).reduce(
    (s, m) => s + (m.depositVolume ?? 0),
    0,
  );
  const totalCommission = (team as any[]).reduce(
    (s, m) => s + (m.totalCommission ?? 0),
    0,
  );
  const active = (team as any[]).filter(
    (m) => (m.depositCount ?? 0) > 0,
  ).length;

  const isAdmin = role === ROLES.ADMIN;
  const tableTitle = isAdmin ? "Sub-Affiliates" : "Your Affiliate Managers";

  return (
    <motion.div
      key="team"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Team" sub={tableTitle} />
        {referralLink && (
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-bold hover:bg-amber-400/20 transition-colors"
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy Invite Link"}
          </button>
        )}
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-4 gap-4 mb-7"
      >
        <StatCard
          label="Team Size"
          value={String((team as any[]).length)}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Active Members"
          value={String(active)}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          label="Total Revenue"
          value={fmt.usd(totalRevenue)}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <StatCard
          label="Total Commission"
          value={fmt.usd(totalCommission)}
          icon={<Wallet className="w-4 h-4" />}
        />
      </motion.div>

      <TableWrapper>
        <thead>
          <tr>
            <Th>Member</Th>
            {isAdmin && <Th>Managers</Th>}
            <Th>Clicks</Th>
            <Th>Deposits</Th>
            <Th>Revenue</Th>
            <Th>Commission</Th>
            <Th>Balances</Th>
            <Th>Joined</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={4} cols={isAdmin ? 9 : 8} />
          ) : (team as any[]).length === 0 ? (
            <EmptyState
              label={
                isAdmin
                  ? "No Basic Sub-Affiliates yet."
                  : "No managers in your team yet."
              }
              colSpan={isAdmin ? 9 : 8}
            />
          ) : (
            (team as any[]).map((member: any) => (
              <tr
                key={member.id}
                className="hover:bg-white/2 transition-colors cursor-pointer group"
                onClick={() => setSelectedId(member.id)}
              >
                <Td>
                  <div>
                    <div className="font-semibold text-white text-sm group-hover:text-amber-300 transition-colors">
                      {member.displayName ?? member.username}
                    </div>
                    <div className="text-xs text-zinc-600">{member.email}</div>
                  </div>
                </Td>
                {isAdmin && (
                  <Td>
                    <span className="text-sm font-bold text-zinc-300">
                      {member.managerCount ?? 0}
                    </span>
                  </Td>
                )}
                <Td>{(member.clicks ?? 0).toLocaleString()}</Td>
                <Td>
                  <span className="text-zinc-300">
                    {member.depositCount ?? 0}
                  </span>
                </Td>
                <Td>
                  <span className="font-semibold text-emerald-400">
                    {fmt.usd(member.depositVolume ?? 0)}
                  </span>
                </Td>
                <Td>
                  <span className="font-semibold text-amber-400">
                    {fmt.usd(member.totalCommission ?? 0)}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-zinc-600">
                        P:{" "}
                        <span className="text-zinc-400">
                          {fmt.usd(member.pendingBalance ?? 0)}
                        </span>
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        A:{" "}
                        <span className="text-amber-400">
                          {fmt.usd(member.approvedBalance ?? 0)}
                        </span>
                      </span>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span className="text-xs">{fmt.date(member.joinedAt)}</span>
                </Td>
                <Td>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-amber-400 transition-colors" />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrapper>

      {/* Member detail drawer */}
      <AnimatePresence>
        {selectedId && (
          <MemberDrawer
            key={selectedId}
            memberId={selectedId}
            role={role}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
