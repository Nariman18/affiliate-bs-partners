"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users,
  TrendingUp,
  Wallet,
  ChevronRight,
  Copy,
  CheckCircle2,
  Search,
  X,
} from "lucide-react";
import {
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
  PaginationBar,
} from "./dashboard/UI";
import { useTeam, useReferralLink } from "../hooks/useDashboard";
import { ROLES, type AppRole } from "../lib/api";
import { useAppDispatch } from "../store/hook";
import { openMemberDetail } from "../store/slices/uiSlice";

interface Props {
  role: AppRole;
  userId: string;
}

// ─── Role badge ────────────────────────────────────────────────────────────────
function RoleTag({ role }: { role: string }) {
  if (role === ROLES.BASIC)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide bg-sky-500/15 text-sky-400 border border-sky-500/20 whitespace-nowrap">
        Sub-Affiliate
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide bg-zinc-700/60 text-zinc-300 whitespace-nowrap">
      Manager
    </span>
  );
}

// ─── Admin view — all BASIC + MANAGER users ────────────────────────────────────
function AdminTeamView() {
  const dispatch = useAppDispatch();
  const { data: team = [], isLoading } = useTeam();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "basic" | "manager">(
    "all",
  );
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const filtered = useMemo(() => {
    let list = team as any[];
    if (roleFilter === "basic")
      list = list.filter((m) => m.role === ROLES.BASIC);
    if (roleFilter === "manager")
      list = list.filter((m) => m.role === ROLES.MANAGER);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.username.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.displayName ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [team, search, roleFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalRevenue = (team as any[]).reduce(
    (s, m) => s + (m.depositVolume ?? 0),
    0,
  );
  const basicCount = (team as any[]).filter(
    (m) => m.role === ROLES.BASIC,
  ).length;
  const managerCount = (team as any[]).filter(
    (m) => m.role === ROLES.MANAGER,
  ).length;

  return (
    <>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7"
      >
        <StatCard
          label="Total Members"
          value={String((team as any[]).length)}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Sub-Affiliates"
          value={String(basicCount)}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          label="Managers"
          value={String(managerCount)}
          icon={<Users className="w-4 h-4" />}
        />
        <StatCard
          label="Total Revenue"
          value={fmt.usd(totalRevenue)}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </motion.div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Search */}
        <div className="relative flex-grow sm:flex-grow-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username or email…"
            className="w-full sm:w-60 pl-8 pr-3 py-1.5 bg-zinc-800/60 border border-white/8 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {(["all", "basic", "manager"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                roleFilter === r
                  ? "bg-amber-400 text-black"
                  : "border border-white/8 text-zinc-500 hover:text-white"
              }`}
            >
              {r === "all"
                ? "All"
                : r === "basic"
                  ? "Sub-Affiliates"
                  : "Managers"}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-zinc-600 hidden sm:block pl-2">
          {filtered.length} members
        </span>
      </div>

      <TableWrapper>
        <thead>
          <tr>
            <Th className="whitespace-nowrap">Member</Th>
            <Th className="whitespace-nowrap">Role</Th>
            <Th className="whitespace-nowrap">Managers</Th>
            <Th className="whitespace-nowrap">Clicks</Th>
            <Th className="whitespace-nowrap">Deposits</Th>
            <Th className="whitespace-nowrap">Revenue</Th>
            <Th className="whitespace-nowrap">Balances</Th>
            <Th className="whitespace-nowrap">Joined</Th>
            <Th> </Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={6} cols={9} />
          ) : filtered.length === 0 ? (
            <EmptyState
              label={
                search ? `No members match "${search}"` : "No members yet."
              }
              colSpan={9}
            />
          ) : (
            paginated.map((member: any) => (
              <tr
                key={member.id}
                className="hover:bg-white/2 transition-colors cursor-pointer group"
                onClick={() => dispatch(openMemberDetail(member.id))}
              >
                <Td>
                  <div className="flex items-center gap-3 min-w-[150px]">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-zinc-500">
                          {(member.displayName ?? member.username)
                            ?.slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm group-hover:text-amber-300 transition-colors whitespace-nowrap">
                        {member.displayName ?? member.username}
                      </div>
                      <div className="text-xs text-zinc-600 whitespace-nowrap">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <RoleTag role={member.role} />
                </Td>
                <Td>
                  <span className="text-sm font-bold text-zinc-300">
                    {member.managerCount ?? 0}
                  </span>
                </Td>
                <Td>
                  <span className="text-zinc-300">
                    {(member.clicks ?? 0).toLocaleString()}
                  </span>
                </Td>
                <Td>
                  <span className="text-zinc-300">
                    {member.depositCount ?? 0}
                  </span>
                </Td>
                <Td>
                  <span className="font-semibold text-emerald-400 whitespace-nowrap">
                    {fmt.usd(member.depositVolume ?? 0)}
                  </span>
                </Td>
                <Td>
                  <div className="flex flex-col gap-0.5 whitespace-nowrap">
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
                </Td>
                <Td>
                  <span className="text-xs whitespace-nowrap">
                    {fmt.date(member.joinedAt)}
                  </span>
                </Td>
                <Td>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-amber-400 transition-colors" />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrapper>
      <PaginationBar
        currentPage={page}
        totalPages={Math.ceil(filtered.length / PAGE_SIZE) || 1}
        onPageChange={setPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}

// ─── Basic Sub view — their managers ──────────────────────────────────────────
function BasicTeamView() {
  const dispatch = useAppDispatch();
  const { data: team = [], isLoading } = useTeam();
  const { data: linkData } = useReferralLink();
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const referralLink = linkData?.link ?? "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    if (!search.trim()) return team as any[];
    const q = search.toLowerCase();
    return (team as any[]).filter(
      (m) =>
        m.username.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.displayName ?? "").toLowerCase().includes(q),
    );
  }, [team, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRevenue = (team as any[]).reduce(
    (s, m) => s + (m.depositVolume ?? 0),
    0,
  );
  const active = (team as any[]).filter(
    (m) => (m.depositCount ?? 0) > 0,
  ).length;

  return (
    <>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7"
      >
        <StatCard
          label="Team Size"
          value={String((team as any[]).length)}
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
          label="Total Deposits"
          value={String(
            (team as any[]).reduce((s, m) => s + (m.depositCount ?? 0), 0),
          )}
          icon={<Wallet className="w-4 h-4" />}
        />
      </motion.div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-grow sm:flex-grow-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username or email…"
            className="w-full sm:w-60 pl-8 pr-3 py-1.5 bg-zinc-800/60 border border-white/8 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {referralLink && (
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-400 text-xs font-bold hover:bg-amber-400/20 transition-colors whitespace-nowrap"
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy Invite Link"}
          </button>
        )}

        <span className="ml-auto text-xs text-zinc-600 hidden sm:block pl-2">
          {filtered.length} managers
        </span>
      </div>

      <TableWrapper>
        <thead>
          <tr>
            <Th className="whitespace-nowrap">Member</Th>
            <Th className="whitespace-nowrap">Clicks</Th>
            <Th className="whitespace-nowrap">Deposits</Th>
            <Th className="whitespace-nowrap">Revenue</Th>
            <Th className="whitespace-nowrap">Balances</Th>
            <Th className="whitespace-nowrap">Default Wallet</Th>
            <Th className="whitespace-nowrap">Joined</Th>
            <Th> </Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={4} cols={8} />
          ) : filtered.length === 0 ? (
            <EmptyState
              label={
                search
                  ? `No managers match "${search}"`
                  : "No managers yet. Share your invite link to get started."
              }
              colSpan={8}
            />
          ) : (
            paginated.map((member: any) => (
              <tr
                key={member.id}
                className="hover:bg-white/2 transition-colors cursor-pointer group"
                onClick={() => dispatch(openMemberDetail(member.id))}
              >
                <Td>
                  <div className="flex items-center gap-3 min-w-[150px]">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-zinc-500">
                          {(member.displayName ?? member.username)
                            ?.slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm group-hover:text-amber-300 transition-colors whitespace-nowrap">
                        {member.displayName ?? member.username}
                      </div>
                      <div className="text-xs text-zinc-600 whitespace-nowrap">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span className="text-zinc-300">
                    {(member.clicks ?? 0).toLocaleString()}
                  </span>
                </Td>
                <Td>
                  <span className="text-zinc-300">
                    {member.depositCount ?? 0}
                  </span>
                </Td>
                <Td>
                  <span className="font-semibold text-emerald-400 whitespace-nowrap">
                    {fmt.usd(member.depositVolume ?? 0)}
                  </span>
                </Td>
                <Td>
                  <div className="flex flex-col gap-0.5 whitespace-nowrap">
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
                </Td>
                <Td>
                  {member.defaultWallet ? (
                    <span className="font-mono text-xs text-zinc-500 whitespace-nowrap">
                      {fmt.shortAddr(member.defaultWallet.address)}
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-xs whitespace-nowrap">
                      No wallet
                    </span>
                  )}
                </Td>
                <Td>
                  <span className="text-xs whitespace-nowrap">
                    {fmt.date(member.joinedAt)}
                  </span>
                </Td>
                <Td>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-amber-400 transition-colors" />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrapper>
      <PaginationBar
        currentPage={page}
        totalPages={Math.ceil(filtered.length / PAGE_SIZE) || 1}
        onPageChange={setPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function PageTeam({ role, userId }: Props) {
  const isAdmin = role === ROLES.ADMIN;
  const tableTitle = isAdmin
    ? "All Platform Members"
    : "Your Affiliate Managers";

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
      </div>

      {isAdmin ? <AdminTeamView /> : <BasicTeamView />}
    </motion.div>
  );
}
