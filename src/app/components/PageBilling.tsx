"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Wallet,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  BadgeCheck,
  Pencil,
  Trash2,
  Star,
  X,
} from "lucide-react";
import {
  useBalance,
  usePaymentMethods,
  useAddPaymentMethod,
  useDeletePaymentMethod,
  useInvoices,
  useCreatePayout,
} from "../hooks/useDashboard";
import {
  Badge,
  TableWrapper,
  Th,
  Td,
  EmptyState,
  TableSkeleton,
  AmberBtn,
  OutlineBtn,
  Modal,
  pageIn,
  SectionHeader,
  fmt,
} from "./dashboard/UI";

import { api } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function useUpdateMethod() {
  const qc = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const mutate = async (
    {
      id,
      label,
      isDefault,
    }: { id: string; label?: string; isDefault?: boolean },
    opts?: { onSuccess?: () => void },
  ) => {
    setIsPending(true);
    try {
      await api.patch(`/billing/methods/${id}`, { label, isDefault });
      qc.invalidateQueries({ queryKey: ["billing", "methods"] });
      toast.success("Wallet updated");
      opts?.onSuccess?.();
    } catch {
      toast.error("Failed to update wallet");
    } finally {
      setIsPending(false);
    }
  };
  return { mutate, isPending };
}

function WalletModal({
  onClose,
  editing,
}: {
  onClose: () => void;
  editing?: {
    id: string;
    currency: string;
    network: string;
    address: string;
    label: string;
    isDefault: boolean;
  };
}) {
  const isEdit = !!editing;
  const [form, setForm] = useState({
    currency: editing?.currency ?? "USDT",
    network: editing?.network ?? "TRC20",
    address: editing?.address ?? "",
    label: editing?.label ?? "",
    isDefault: editing?.isDefault ?? false,
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const addMethod = useAddPaymentMethod();
  const updateMethod = useUpdateMethod();

  const handleSave = () => {
    if (!isEdit) {
      if (!form.address.trim()) return;
      addMethod.mutate(form, { onSuccess: onClose });
    } else {
      updateMethod.mutate(
        { id: editing!.id, label: form.label, isDefault: form.isDefault },
        { onSuccess: onClose },
      );
    }
  };

  const isBusy = addMethod.isPending || updateMethod.isPending;

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-black text-white">
          {isEdit ? "Edit Wallet" : "Add Payment Method"}
        </h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {!isEdit && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                >
                  {["USDT", "USDC", "TRX"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                  Network
                </label>
                <select
                  value={form.network}
                  onChange={(e) => set("network", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                >
                  {["TRC20", "ERC20", "BEP20"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                Wallet Address <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Paste your TRC20 USDT address…"
                className="w-full px-3 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-amber-400/40 resize-none h-20 font-mono"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
            Label (optional)
          </label>
          <input
            value={form.label}
            onChange={(e) => set("label", e.target.value)}
            placeholder="e.g. Main, Binance"
            className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-amber-400/40"
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => set("isDefault", e.target.checked)}
            className="accent-amber-400 w-3.5 h-3.5"
          />
          <span className="text-xs text-zinc-400">
            Set as default payment method
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3 justify-end mt-5">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <AmberBtn
          onClick={handleSave}
          disabled={isBusy || (!isEdit && !form.address.trim())}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {isBusy ? "Saving…" : isEdit ? "Save Changes" : "Add Wallet"}
        </AmberBtn>
      </div>
    </Modal>
  );
}

export default function PageBilling() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any | null>(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { data: balance, isLoading: balLoading } = useBalance();
  const { data: methods = [], isLoading: methodsLoading } = usePaymentMethods();
  const { data: invoices = [], isLoading: invLoading } = useInvoices();
  const deleteMethod = useDeletePaymentMethod();
  const updateMethod = useUpdateMethod();
  const createPayout = useCreatePayout();

  const defaultWallet = (methods as any[]).find((m: any) => m.isDefault);

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > (balance as any)?.approvedBalance) {
      toast.error("Amount exceeds approved balance");
      return;
    }

    createPayout.mutate(
      { amount, paymentMethodId: defaultWallet?.id },
      {
        onSuccess: () => {
          setShowWithdraw(false);
          setWithdrawAmount("");
        },
      },
    );
  };

  return (
    <motion.div
      key="billing"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <SectionHeader
        title="Billing"
        sub="Manage your wallets and request payouts"
      />

      <div className="grid md:grid-cols-[1fr_260px] gap-6">
        <div className="space-y-6">
          {/* ── Balance Cards ── */}
          <div className="rounded-2xl border border-white/6 bg-zinc-900/60 p-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
              Your Balance
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Pending",
                  key: "pendingBalance",
                  color: "text-zinc-300",
                  icon: <Clock className="w-3.5 h-3.5" />,
                  note: "Awaiting verification",
                  dot: "bg-zinc-500/80",
                },
                {
                  label: "Approved",
                  key: "approvedBalance",
                  color: "text-amber-400",
                  icon: <BadgeCheck className="w-3.5 h-3.5" />,
                  note: "Ready to withdraw",
                  dot: "bg-amber-400/80",
                },
                {
                  label: "Paid Out",
                  key: "paidBalance",
                  color: "text-emerald-400",
                  icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                  note: "Sent to wallet",
                  dot: "bg-emerald-400/80",
                },
              ].map(({ label, key, color, icon, note, dot }) => (
                <div
                  key={key}
                  className="rounded-xl border border-white/6 bg-zinc-900/40 p-4"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className={`w-2 h-2 rounded-sm ${dot}`} />
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                      {label}
                    </p>
                  </div>
                  {balLoading ? (
                    <div className="h-7 w-20 bg-zinc-800 rounded-lg animate-pulse" />
                  ) : (
                    <p className={`text-xl font-black ${color}`}>
                      {fmt.usd((balance as any)?.[key] ?? 0)}
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-600 mt-1.5 flex items-center gap-1">
                    {icon}
                    {note}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowWithdraw(true)}
              disabled={
                !(balance as any)?.approvedBalance ||
                (balance as any)?.approvedBalance <= 0
              }
              className="mt-5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Request withdrawal <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── Payment Methods Table ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Payment Methods</h3>
              <AmberBtn onClick={() => setShowAddModal(true)} small>
                <Plus className="w-3.5 h-3.5" /> Add Wallet
              </AmberBtn>
            </div>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Currency</Th>
                  <Th>Wallet Address</Th>
                  <Th>Network</Th>
                  <Th>Label</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {methodsLoading ? (
                  <TableSkeleton rows={2} cols={6} />
                ) : (methods as any[]).length === 0 ? (
                  <EmptyState
                    label="No payment methods. Add a USDT TRC20 wallet to receive payouts."
                    colSpan={6}
                  />
                ) : (
                  (methods as any[]).map((m: any) => (
                    <tr
                      key={m.id}
                      className="hover:bg-white/2 transition-colors"
                    >
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                            <Wallet className="w-3 h-3 text-sky-400" />
                          </div>
                          <span className="font-bold text-white text-xs">
                            {m.currency}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <span className="text-xs font-mono text-zinc-400">
                          {fmt.shortAddr(m.address)}
                        </span>
                      </Td>
                      <Td>
                        <Badge variant="blue">{m.network}</Badge>
                      </Td>
                      <Td>
                        <span className="text-xs text-zinc-500">
                          {m.label || "—"}
                        </span>
                      </Td>
                      <Td>
                        {m.isDefault ? (
                          <Badge variant="amber">Default</Badge>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          {!m.isDefault && (
                            <button
                              onClick={() =>
                                updateMethod.mutate({
                                  id: m.id,
                                  isDefault: true,
                                })
                              }
                              title="Set as default"
                              className="p-1.5 rounded-lg border border-white/8 text-zinc-600 hover:text-amber-400 hover:border-amber-400/30 transition-colors"
                            >
                              <Star className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingWallet(m)}
                            title="Edit"
                            className="p-1.5 rounded-lg border border-white/8 text-zinc-600 hover:text-sky-400 hover:border-sky-400/30 transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteMethod.mutate(m.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg border border-white/8 text-zinc-600 hover:text-rose-400 hover:border-rose-400/30 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </TableWrapper>
          </div>

          {/* ── Payout History Table ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Payout History</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">
                  {(invoices as any[]).length} records
                </span>
              </div>
            </div>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Amount</Th>
                  <Th>Wallet</Th>
                  <Th>Tx Hash</Th>
                  <Th>Note</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {invLoading ? (
                  <TableSkeleton rows={3} cols={6} />
                ) : (invoices as any[]).length === 0 ? (
                  <EmptyState colSpan={6} label="No payout history yet." />
                ) : (
                  (invoices as any[]).map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-white/2">
                      <Td>
                        <span className="text-xs">
                          {fmt.dateTime(inv.createdAt ?? inv.updatedAt)}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-semibold text-emerald-400">
                          {fmt.usd(inv.amount)}
                        </span>
                      </Td>
                      <Td>
                        {inv.paymentMethod ? (
                          <span className="font-mono text-xs text-zinc-500">
                            {fmt.shortAddr(inv.paymentMethod.address)}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </Td>
                      <Td>
                        {inv.txHash ? (
                          <span className="font-mono text-xs text-emerald-400">
                            {fmt.shortAddr(inv.txHash)}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </Td>
                      <Td>
                        {inv.note ? (
                          <span
                            className="text-xs text-zinc-400 max-w-[150px] truncate block"
                            title={inv.note}
                          >
                            {inv.note}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </Td>
                      <Td>
                        <Badge
                          variant={
                            inv.status === "PAID"
                              ? "green"
                              : inv.status === "APPROVED"
                                ? "amber"
                                : "yellow"
                          }
                        >
                          {inv.status}
                        </Badge>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </TableWrapper>
          </div>
        </div>

        {/* ── Sidebar Info ── */}
        <div className="rounded-2xl border border-white/6 bg-zinc-900/60 p-5 h-fit space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2">
            Payment Info
          </h3>
          {[
            ["Accepted Currency", "USDT"],
            ["Network", "TRC20 (TRON)"],
            ["Min Withdrawal", "$10.00"],
            ["Processing", "1–3 business days"],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">
                {l}
              </p>
              <p className="text-sm font-semibold text-zinc-300">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && <WalletModal onClose={() => setShowAddModal(false)} />}
        {editingWallet && (
          <WalletModal
            key={editingWallet.id}
            editing={editingWallet}
            onClose={() => setEditingWallet(null)}
          />
        )}

        {/* Withdraw Modal */}
        {showWithdraw && (
          <Modal onClose={() => setShowWithdraw(false)}>
            <h3 className="text-lg font-black text-white mb-2">
              Request Withdrawal
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              Available:{" "}
              <span className="text-white font-bold">
                {fmt.usd((balance as any)?.approvedBalance ?? 0)}
              </span>
            </p>
            {!defaultWallet ? (
              <p className="text-sm font-bold text-rose-400 mb-4 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                Please add and set a default payment method first.
              </p>
            ) : (
              <>
                <div className="mb-4 p-3 rounded-xl border border-white/8 bg-zinc-800/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">
                      Sending to
                    </p>
                    <p className="text-xs font-mono font-bold text-zinc-300">
                      {fmt.shortAddr(defaultWallet.address)}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {defaultWallet.network} · {defaultWallet.currency}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
                    Amount to withdraw (USD)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g. 500.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-zinc-900 text-lg font-bold text-white focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 mb-5"
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowWithdraw(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              {defaultWallet && (
                <AmberBtn
                  onClick={handleWithdraw}
                  disabled={createPayout.isPending || !withdrawAmount}
                >
                  {createPayout.isPending ? "Submitting…" : "Submit Request"}
                </AmberBtn>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
