"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
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
  pageIn,
  SectionHeader,
  FilterBar,
  fmt,
} from "./dashboard/UI";
import {
  useCommissions,
  useCommissionStats,
  useRequestCommissionApproval,
  useApproveCommission,
  usePayCommission,
  useBulkApproveCommissions,
  useBulkPayCommissions,
} from "../hooks/useDashboard";
import { ROLES, type AppRole } from "../lib/api";

interface Props {
  role: AppRole;
}

type StatusFilter = "all" | "PENDING" | "APPROVED" | "PAID";

// ─────────────────────────────────────────────────────────────────────────────
// Admin view — approval inbox with bulk controls
// ─────────────────────────────────────────────────────────────────────────────
function AdminView() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<
    "bulk-approve" | "bulk-pay" | null
  >(null);

  const params = statusFilter !== "all" ? { status: statusFilter as any } : {};
  const { data: result, isLoading, refetch } = useCommissions(params);
  const items = result?.items ?? [];

  const bulkApprove = useBulkApproveCommissions();
  const bulkPay = useBulkPayCommissions();
  const approve = useApproveCommission();
  const pay = usePayCommission();

  const toggleAll = () =>
    setSelected(
      selected.size === items.length
        ? new Set()
        : new Set(items.map((i: any) => i.id)),
    );
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleBulkAction = () => {
    const ids = Array.from(selected);
    if (confirmAction === "bulk-approve")
      bulkApprove.mutate(
        { ids },
        {
          onSuccess: () => {
            setConfirmAction(null);
            setSelected(new Set());
          },
        },
      );
    else
      bulkPay.mutate(
        { ids },
        {
          onSuccess: () => {
            setConfirmAction(null);
            setSelected(new Set());
          },
        },
      );
  };

  return (
    <div>
      <FilterBar>
        {(["all", "PENDING", "APPROVED", "PAID"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? "bg-amber-400 text-black" : "border border-white/8 text-zinc-500 hover:text-white"}`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {selected.size > 0 && (
            <>
              {statusFilter === "PENDING" && (
                <button
                  onClick={() => setConfirmAction("bulk-approve")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve{" "}
                  {selected.size}
                </button>
              )}
              {statusFilter === "APPROVED" && (
                <button
                  onClick={() => setConfirmAction("bulk-pay")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/25 text-sky-400 text-xs font-bold hover:bg-sky-500/25 transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Pay {selected.size}
                </button>
              )}
            </>
          )}
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg border border-white/8 text-zinc-500 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </FilterBar>

      <TableWrapper>
        <thead>
          <tr>
            <Th>
              <input
                type="checkbox"
                checked={selected.size === items.length && items.length > 0}
                onChange={toggleAll}
                className="rounded accent-amber-400"
              />
            </Th>
            <Th>Recipient</Th>
            <Th>Offer</Th>
            <Th>Deposit</Th>
            <Th>Commission</Th>
            <Th>Pct</Th>
            <Th>Flagged</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={5} cols={9} />
          ) : items.length === 0 ? (
            <EmptyState
              colSpan={9}
              label={`No ${statusFilter !== "all" ? statusFilter.toLowerCase() : ""} commissions.`}
            />
          ) : (
            items.map((c: any) => (
              <tr
                key={c.id}
                className={`hover:bg-white/2 transition-colors ${selected.has(c.id) ? "bg-amber-400/4" : ""}`}
              >
                <Td>
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleOne(c.id)}
                    className="rounded accent-amber-400"
                  />
                </Td>
                <Td>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {c.recipient?.username}
                    </div>
                    <div className="text-[10px] text-zinc-600">
                      {c.recipient?.role === ROLES.MANAGER
                        ? "Manager"
                        : "Basic Sub"}
                    </div>
                  </div>
                </Td>
                <Td>
                  <span className="text-zinc-400 text-xs">
                    {c.deposit?.link?.offer?.name ?? "—"}
                  </span>
                </Td>
                <Td>
                  <span className="font-semibold text-emerald-400">
                    {fmt.usd(c.deposit?.amount ?? 0)}
                  </span>
                </Td>
                <Td>
                  <span className="font-bold text-amber-400">
                    {fmt.usd(c.amount)}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-zinc-500">{c.percentage}%</span>
                </Td>
                <Td>
                  {c.requestedApproval ? (
                    <Badge variant="amber">Flagged</Badge>
                  ) : (
                    <span className="text-zinc-700 text-xs">—</span>
                  )}
                </Td>
                <Td>
                  <Badge
                    variant={
                      c.status === "PAID"
                        ? "green"
                        : c.status === "APPROVED"
                          ? "amber"
                          : "yellow"
                    }
                  >
                    {c.status}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex gap-1.5">
                    {c.status === "PENDING" && (
                      <button
                        onClick={() => approve.mutate({ id: c.id })}
                        disabled={approve.isPending}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold hover:bg-emerald-500/25 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {c.status === "APPROVED" && (
                      <button
                        onClick={() => pay.mutate({ id: c.id })}
                        disabled={pay.isPending}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/25 text-sky-400 font-bold hover:bg-sky-500/25 transition-colors"
                      >
                        Pay
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrapper>

      <AnimatePresence>
        {confirmAction && (
          <Modal onClose={() => setConfirmAction(null)}>
            <h3 className="text-lg font-black text-white mb-2">
              {confirmAction === "bulk-approve"
                ? `Approve ${selected.size} commissions`
                : `Mark ${selected.size} commissions as PAID`}
            </h3>
            <p className="text-sm text-zinc-400 mb-5">
              {confirmAction === "bulk-approve"
                ? "This will move the selected PENDING commissions to APPROVED and update affiliate balances."
                : "This will finalize payment for the selected APPROVED commissions."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <AmberBtn
                onClick={handleBulkAction}
                disabled={bulkApprove.isPending || bulkPay.isPending}
              >
                {bulkApprove.isPending || bulkPay.isPending
                  ? "Processing…"
                  : "Confirm"}
              </AmberBtn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Basic Sub view — see team commissions + request-approval
// ─────────────────────────────────────────────────────────────────────────────
function BasicSubView() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const params = statusFilter !== "all" ? { status: statusFilter as any } : {};
  const { data: result, isLoading } = useCommissions(params);
  const items = result?.items ?? [];

  const requestApproval = useRequestCommissionApproval();

  const pendingItems = items.filter(
    (c: any) => c.status === "PENDING" && !c.requestedApproval,
  );
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected(
      selected.size === pendingItems.length
        ? new Set()
        : new Set(pendingItems.map((i: any) => i.id)),
    );

  const handleRequest = () => {
    const ids = Array.from(selected);
    requestApproval.mutate(ids, { onSuccess: () => setSelected(new Set()) });
  };

  return (
    <div>
      <FilterBar>
        {(["all", "PENDING", "APPROVED", "PAID"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? "bg-amber-400 text-black" : "border border-white/8 text-zinc-500 hover:text-white"}`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
        {selected.size > 0 && (
          <button
            onClick={handleRequest}
            disabled={requestApproval.isPending}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-bold hover:bg-amber-400/25 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            {requestApproval.isPending
              ? "Requesting…"
              : `Request Approval for ${selected.size}`}
          </button>
        )}
      </FilterBar>

      <TableWrapper>
        <thead>
          <tr>
            {statusFilter === "PENDING" && (
              <Th>
                <input
                  type="checkbox"
                  onChange={toggleAll}
                  checked={
                    selected.size === pendingItems.length &&
                    pendingItems.length > 0
                  }
                  className="rounded accent-amber-400"
                />
              </Th>
            )}
            <Th>Recipient</Th>
            <Th>Offer</Th>
            <Th>Deposit</Th>
            <Th>Commission</Th>
            <Th>Date</Th>
            <Th>Flagged</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={5} cols={statusFilter === "PENDING" ? 8 : 7} />
          ) : items.length === 0 ? (
            <EmptyState colSpan={statusFilter === "PENDING" ? 8 : 7} />
          ) : (
            items.map((c: any) => (
              <tr
                key={c.id}
                className={`hover:bg-white/2 transition-colors ${selected.has(c.id) ? "bg-amber-400/4" : ""}`}
              >
                {statusFilter === "PENDING" && (
                  <Td>
                    {!c.requestedApproval && (
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleOne(c.id)}
                        className="rounded accent-amber-400"
                      />
                    )}
                  </Td>
                )}
                <Td>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {c.recipient?.username}
                    </div>
                    <div className="text-[10px] text-zinc-600">
                      {c.recipient?.role === ROLES.MANAGER
                        ? "Manager"
                        : "Yourself"}
                    </div>
                  </div>
                </Td>
                <Td>
                  <span className="text-zinc-400 text-xs">
                    {c.deposit?.link?.offer?.name ?? "—"}
                  </span>
                </Td>
                <Td>
                  <span className="font-semibold text-emerald-400">
                    {fmt.usd(c.deposit?.amount ?? 0)}
                  </span>
                </Td>
                <Td>
                  <span className="font-bold text-amber-400">
                    {fmt.usd(c.amount)}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-zinc-500">
                    {fmt.date(c.createdAt)}
                  </span>
                </Td>
                <Td>
                  {c.requestedApproval ? (
                    <Badge variant="amber">Pending admin review</Badge>
                  ) : (
                    <span className="text-zinc-700 text-xs">—</span>
                  )}
                </Td>
                <Td>
                  <Badge
                    variant={
                      c.status === "PAID"
                        ? "green"
                        : c.status === "APPROVED"
                          ? "amber"
                          : "yellow"
                    }
                  >
                    {c.status}
                  </Badge>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrapper>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Manager view — personal commission history
// ─────────────────────────────────────────────────────────────────────────────
function ManagerView() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const params = statusFilter !== "all" ? { status: statusFilter as any } : {};
  const { data: result, isLoading } = useCommissions(params);
  const items = result?.items ?? [];

  return (
    <div>
      <FilterBar>
        {(["all", "PENDING", "APPROVED", "PAID"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? "bg-amber-400 text-black" : "border border-white/8 text-zinc-500 hover:text-white"}`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </FilterBar>
      <TableWrapper>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Offer</Th>
            <Th>Deposit</Th>
            <Th>Commission</Th>
            <Th>Pct</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : items.length === 0 ? (
            <EmptyState
              colSpan={6}
              label="No commissions yet. Start generating traffic to earn."
            />
          ) : (
            items.map((c: any) => (
              <tr key={c.id} className="hover:bg-white/2 transition-colors">
                <Td>
                  <span className="text-xs">{fmt.dateTime(c.createdAt)}</span>
                </Td>
                <Td>
                  <span className="text-zinc-300 text-sm">
                    {c.deposit?.link?.offer?.name ?? "—"}
                  </span>
                </Td>
                <Td>
                  <span className="font-semibold text-emerald-400">
                    {fmt.usd(c.deposit?.amount ?? 0)}
                  </span>
                </Td>
                <Td>
                  <span className="font-bold text-2xl text-amber-400">
                    {fmt.usd(c.amount)}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-zinc-500">{c.percentage}%</span>
                </Td>
                <Td>
                  <Badge
                    variant={
                      c.status === "PAID"
                        ? "green"
                        : c.status === "APPROVED"
                          ? "amber"
                          : "yellow"
                    }
                  >
                    {c.status}
                  </Badge>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </TableWrapper>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root component
// ─────────────────────────────────────────────────────────────────────────────
export default function PageCommissions({ role }: Props) {
  const { data: stats, isLoading: statsLoading } = useCommissionStats();

  const subtitle =
    role === ROLES.ADMIN
      ? "Platform-wide approval inbox"
      : role === ROLES.BASIC
        ? "Your team's commission feed"
        : "Your personal earnings history";

  return (
    <motion.div
      key="commissions"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <SectionHeader title="Commissions" sub={subtitle} />

      {/* Three-bucket stat cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-3 gap-4 mb-7"
      >
        <StatCard
          label="Pending"
          value={statsLoading ? "—" : fmt.usd(stats?.pending?.amount ?? 0)}
          sub={`${stats?.pending?.count ?? 0} commissions`}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          label="Approved"
          value={statsLoading ? "—" : fmt.usd(stats?.approved?.amount ?? 0)}
          sub={`${stats?.approved?.count ?? 0} commissions`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          trend="up"
        />
        <StatCard
          label="Paid Out"
          value={statsLoading ? "—" : fmt.usd(stats?.paid?.amount ?? 0)}
          sub={`${stats?.paid?.count ?? 0} commissions`}
          icon={<DollarSign className="w-4 h-4" />}
        />
      </motion.div>

      {/* Role-scoped main content */}
      {role === ROLES.ADMIN && <AdminView />}
      {role === ROLES.BASIC && <BasicSubView />}
      {role === ROLES.MANAGER && <ManagerView />}
    </motion.div>
  );
}
