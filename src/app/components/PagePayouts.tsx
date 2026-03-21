"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  CheckCircle2,
  Wallet,
  XCircle,
  DollarSign,
  Trash2,
  Search,
  ArrowDownRight,
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
  PaginationBar,
} from "./dashboard/UI";
import { useAppDispatch, useAppSelector } from "../store/hook";
import {
  usePayouts,
  usePayoutStats,
  useApprovePayout,
  usePayPayout,
  useTrashPayout,
} from "../hooks/useDashboard";
import { setPayoutStatusFilter } from "../store/slices/uiSlice";
import { ROLES } from "../lib/api";

type ConfirmState = {
  id: string;
  action: "approve" | "pay" | "trash";
  txHash?: string;
  note?: string;
};

export default function PagePayouts() {
  const dispatch = useAppDispatch();
  const { payoutStatusFilter } = useAppSelector((s) => s.ui);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 10;

  const params =
    payoutStatusFilter !== "all" ? { status: payoutStatusFilter } : {};
  const { data: payouts = [], isLoading } = usePayouts(params);
  const { data: stats } = usePayoutStats();

  const approvePayout = useApprovePayout();
  const payPayout = usePayPayout();
  const trashPayout = useTrashPayout();

  const handleAction = () => {
    if (!confirm) return;
    const done = () => setConfirm(null);
    if (confirm.action === "approve")
      approvePayout.mutate(
        { id: confirm.id, note: confirm.note },
        { onSuccess: done },
      );
    else if (confirm.action === "pay")
      payPayout.mutate(
        { id: confirm.id, txHash: confirm.txHash, note: confirm.note },
        { onSuccess: done },
      );
    else
      trashPayout.mutate(
        { id: confirm.id, note: confirm.note },
        { onSuccess: done },
      );
  };

  const isPending =
    approvePayout.isPending || payPayout.isPending || trashPayout.isPending;

  // Filter payouts based on search input mapping through the nested commissions
  const filteredPayouts = useMemo(() => {
    let list = payouts as any[];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        // Search by TxHash
        if (p.txHash?.toLowerCase().includes(q)) return true;
        // Search through recipients
        return p.commissions?.some((c: any) => {
          const r = c.recipient;
          if (!r) return false;
          return (
            r.username?.toLowerCase().includes(q) ||
            r.email?.toLowerCase().includes(q) ||
            r.profile?.displayName?.toLowerCase().includes(q) ||
            c.wallet?.address?.toLowerCase().includes(q)
          );
        });
      });
    }
    return list;
  }, [payouts, search]);

  const totalPages = Math.ceil(filteredPayouts.length / PAGE_SIZE) || 1;
  const paginatedPayouts = filteredPayouts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <motion.div
      key="payouts"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <SectionHeader
          title="Payout Management"
          sub="Review and process withdrawal requests"
        />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7"
      >
        <StatCard
          label="Pending Payouts"
          value={fmt.usd(stats?.pending?.amount ?? 0)}
          sub={`${stats?.pending?.count ?? 0} requests`}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          label="Approved Total"
          value={fmt.usd(stats?.approved?.amount ?? 0)}
          sub={`${stats?.approved?.count ?? 0} requests`}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          label="Paid Out Total"
          value={fmt.usd(stats?.paid?.amount ?? 0)}
          sub={`${stats?.paid?.count ?? 0} requests`}
          icon={<Wallet className="w-4 h-4" />}
        />
      </motion.div>

      <FilterBar>
        {/* Status Filters */}
        <div className="flex items-center gap-2">
          {["all", "PENDING", "APPROVED", "PAID"].map((s) => (
            <button
              key={s}
              onClick={() => {
                dispatch(setPayoutStatusFilter(s));
                setPage(1); // Reset page on filter
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                payoutStatusFilter === s
                  ? "bg-amber-400 text-black"
                  : "border border-white/8 text-zinc-500 hover:text-white"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset page on search
            }}
            placeholder="Search affiliates, emails, wallets..."
            className="pl-8 pr-3 py-1.5 bg-zinc-800/60 border border-white/8 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 w-64"
          />
        </div>
      </FilterBar>

      <TableWrapper>
        <thead>
          <tr>
            <Th>Affiliate (Manager & Sub)</Th>
            <Th>Wallet</Th>
            <Th>Commission</Th>
            <Th>Network</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Tx Hash</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={4} cols={8} />
          ) : paginatedPayouts.length === 0 ? (
            <EmptyState
              colSpan={8}
              label="No payouts found matching your criteria."
            />
          ) : (
            paginatedPayouts.map((p: any) => {
              // Extract the individual commissions to show who is getting paid
              const managerComm = p.commissions?.find(
                (c: any) => c.recipient?.role === ROLES.MANAGER,
              );
              const basicComm = p.commissions?.find(
                (c: any) => c.recipient?.role === ROLES.BASIC,
              );

              return (
                <tr key={p.id} className="hover:bg-white/2 transition-colors">
                  <Td>
                    <div>
                      {managerComm ? (
                        <>
                          <div className="font-semibold text-white text-sm">
                            {managerComm.recipient?.profile?.displayName ??
                              managerComm.recipient?.username}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {managerComm.recipient?.email}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-zinc-500">
                          Unknown Manager
                        </div>
                      )}

                      {/* Show Basic Sub-Affiliate details if they exist on this deposit */}
                      {basicComm && (
                        <div className="mt-1.5 flex items-center gap-1.5 px-2 py-1 bg-sky-500/10 rounded-md border border-sky-500/20 w-fit">
                          <ArrowDownRight className="w-3 h-3 text-sky-400" />
                          <span className="text-[10px] font-semibold text-sky-400">
                            Sub:{" "}
                            {basicComm.recipient?.profile?.displayName ??
                              basicComm.recipient?.username}
                          </span>
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td>
                    {/* Display Manager's wallet by default */}
                    {managerComm?.wallet ? (
                      <span className="font-mono text-xs text-zinc-500">
                        {fmt.shortAddr(managerComm.wallet.address)}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex flex-col gap-0.5">
                      {managerComm && (
                        <span className="font-bold text-amber-400">
                          {fmt.usd(managerComm.amount)}
                        </span>
                      )}
                      {basicComm && (
                        <span className="font-semibold text-sky-400 text-[11px]">
                          + {fmt.usd(basicComm.amount)}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <Badge variant="blue">
                      {managerComm?.wallet?.network ?? "TRC20"}
                    </Badge>
                  </Td>
                  <Td>
                    <span className="text-xs">{fmt.date(p.createdAt)}</span>
                  </Td>
                  <Td>
                    <Badge
                      variant={
                        p.status === "PAID"
                          ? "green"
                          : p.status === "APPROVED"
                            ? "amber"
                            : "yellow"
                      }
                    >
                      {p.status}
                    </Badge>
                    {p.note?.startsWith("[TRASHED]") && (
                      <p className="text-[10px] text-rose-400 mt-0.5">
                        Trashed
                      </p>
                    )}
                  </Td>
                  <Td>
                    {p.txHash ? (
                      <span className="font-mono text-xs text-emerald-400">
                        {fmt.shortAddr(p.txHash)}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      {p.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              setConfirm({ id: p.id, action: "approve" })
                            }
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/25 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() =>
                              setConfirm({ id: p.id, action: "trash" })
                            }
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-400 text-[11px] font-bold hover:bg-rose-500/25 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Trash
                          </button>
                        </>
                      )}
                      {p.status === "APPROVED" && (
                        <button
                          onClick={() =>
                            setConfirm({ id: p.id, action: "pay" })
                          }
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-500/15 border border-sky-500/25 text-sky-400 text-[11px] font-bold hover:bg-sky-500/25 transition-colors"
                        >
                          <DollarSign className="w-3 h-3" /> Mark Paid
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </TableWrapper>

      <PaginationBar
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredPayouts.length}
        pageSize={PAGE_SIZE}
      />

      {/* Confirm modal */}
      <AnimatePresence>
        {confirm && (
          <Modal onClose={() => setConfirm(null)}>
            <h3 className="text-lg font-black text-white mb-2">
              {confirm.action === "approve"
                ? "Approve Payout"
                : confirm.action === "pay"
                  ? "Mark as Paid"
                  : "Trash Payout"}
            </h3>
            <p className="text-sm text-zinc-400 mb-5">
              {confirm.action === "approve" &&
                "Confirm this payout is valid. Funds stay reserved."}
              {confirm.action === "pay" &&
                "Mark as physically sent. This finalises the payout."}
              {confirm.action === "trash" &&
                "Reject this payout and restore the affiliate's balance."}
            </p>

            {confirm.action === "pay" && (
              <div className="mb-4">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                  Tx Hash (optional)
                </label>
                <input
                  placeholder="0x…"
                  value={confirm.txHash ?? ""}
                  onChange={(e) =>
                    setConfirm((c) =>
                      c ? { ...c, txHash: e.target.value } : c,
                    )
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-white/8 bg-zinc-800/60 text-sm font-mono text-zinc-300 focus:outline-none focus:border-amber-400/40"
                />
              </div>
            )}

            <div className="mb-5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                Note {confirm.action === "trash" ? "(reason)" : "(optional)"}
              </label>
              <input
                placeholder={
                  confirm.action === "trash"
                    ? "Reason for rejection…"
                    : "Admin note…"
                }
                value={confirm.note ?? ""}
                onChange={(e) =>
                  setConfirm((c) => (c ? { ...c, note: e.target.value } : c))
                }
                className="w-full px-3 py-2.5 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirm(null)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <AmberBtn onClick={handleAction} disabled={isPending}>
                {isPending
                  ? "Processing…"
                  : confirm.action === "approve"
                    ? "Confirm Approval"
                    : confirm.action === "pay"
                      ? "Confirm Payment"
                      : "Trash Payout"}
              </AmberBtn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
