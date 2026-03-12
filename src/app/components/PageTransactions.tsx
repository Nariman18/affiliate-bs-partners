"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Settings,
  Calendar,
  ChevronDown,
  Tag,
  X,
} from "lucide-react";
import {
  Badge,
  TabBar,
  TableWrapper,
  Th,
  Td,
  EmptyState,
  TableSkeleton,
  OutlineBtn,
  FilterBar,
  pageIn,
  SectionHeader,
  fmt,
} from "./dashboard/UI";
import {
  useClicks,
  useConversions,
  usePostbacks,
  useOffers,
} from "../hooks/useDashboard";
import { type AppRole } from "../lib/api";

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
const PRESETS = [
  { label: "Today", from: today(), to: today() },
  { label: "Yesterday", from: daysAgo(1), to: daysAgo(1) },
  { label: "Last 7 days", from: daysAgo(7), to: today() },
  { label: "Last 30 days", from: daysAgo(30), to: today() },
  { label: "Last 90 days", from: daysAgo(90), to: today() },
];

function DatePicker({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (f: string, t: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [df, setDf] = useState(from);
  const [dt, setDt] = useState(to);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-zinc-800/40 text-xs font-semibold text-zinc-400 hover:border-white/20 hover:text-white transition-all"
      >
        <Calendar className="w-3 h-3" />
        {from} – {to}
        <ChevronDown className="w-3 h-3 ml-0.5" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 top-9 z-20 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl p-4 w-72"
            >
              <div className="flex flex-wrap gap-1.5 mb-4">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setDf(p.from);
                      setDt(p.to);
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${df === p.from && dt === p.to ? "bg-amber-400/20 text-amber-400 border border-amber-400/30" : "border border-white/8 text-zinc-500 hover:text-white"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 block">
                    From
                  </label>
                  <input
                    type="date"
                    value={df}
                    onChange={(e) => setDf(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-white/8 bg-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-400/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 block">
                    To
                  </label>
                  <input
                    type="date"
                    value={dt}
                    onChange={(e) => setDt(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-white/8 bg-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-400/40"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onChange(df, dt);
                    setOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function OfferFilter({
  value,
  onChange,
  offers,
}: {
  value: string;
  onChange: (v: string) => void;
  offers: any[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const sel = (offers as any[]).find((o: any) => o.id === value)?.name;
  const list = useMemo(
    () =>
      (offers as any[]).filter((o: any) =>
        o.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [offers, q],
  );
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-zinc-800/40 text-xs font-semibold text-zinc-400 hover:border-white/20 hover:text-white transition-all max-w-[200px]"
      >
        <Tag className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{sel ?? "All Offers"}</span>
        <ChevronDown className="w-3 h-3 ml-0.5 flex-shrink-0" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 top-9 z-20 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl w-56 py-1"
            >
              <div className="px-2 pb-1">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  autoFocus
                  className="w-full px-2 py-1 bg-zinc-800 border border-white/8 rounded-lg text-xs text-zinc-300 focus:outline-none"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${!value ? "text-amber-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                >
                  All Offers
                </button>
                {list.map((o: any) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      onChange(o.id);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs truncate transition-colors ${value === o.id ? "text-amber-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                  >
                    {o.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PageTransactions({ role: _role }: { role: AppRole }) {
  const [tab, setTab] = useState("Conversions");
  const [dateFrom, setDateFrom] = useState(daysAgo(30));
  const [dateTo, setDateTo] = useState(today());
  const [offerId, setOfferId] = useState("");

  const params = useMemo(
    () => ({ from: dateFrom, to: dateTo }),
    [dateFrom, dateTo],
  );
  const conversions = useConversions({
    ...params,
    offerId: offerId || undefined,
  });
  const clicks = useClicks(params);
  const postbacks = usePostbacks(params);
  const { data: allOffers = [] } = useOffers();

  const totalResults =
    tab === "Conversions"
      ? (conversions.data?.total ?? conversions.data?.data?.length ?? 0)
      : tab === "Clicks"
        ? (clicks.data?.total ?? clicks.data?.data?.length ?? 0)
        : tab === "Invalid Clicks"
          ? (clicks.data?.data ?? []).filter((c: any) => c.isInvalid).length
          : (postbacks.data?.length ?? 0);

  return (
    <motion.div
      key="transactions"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <SectionHeader title="Transactions" />
      <TabBar
        tabs={[
          "Conversions",
          "Clicks",
          "Invalid Clicks",
          "Affiliates Postbacks",
        ]}
        active={tab}
        onChange={setTab}
      />

      <FilterBar>
        <DatePicker
          from={dateFrom}
          to={dateTo}
          onChange={(f, t) => {
            setDateFrom(f);
            setDateTo(t);
          }}
        />
        <OfferFilter
          value={offerId}
          onChange={setOfferId}
          offers={allOffers as any[]}
        />
        {offerId && (
          <button
            onClick={() => setOfferId("")}
            className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-rose-400 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-600">{totalResults} results</span>
          <OutlineBtn>
            <Download className="w-3 h-3" />
            Export
          </OutlineBtn>
          <OutlineBtn>
            <Settings className="w-3 h-3" />
            Columns
          </OutlineBtn>
        </div>
      </FilterBar>

      {/* ── Conversions ── */}
      {tab === "Conversions" && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Offer</Th>
              <Th>Deposit</Th>
              <Th>Commission</Th>
              <Th>Sub ID</Th>
              <Th>Link</Th>
            </tr>
          </thead>
          <tbody>
            {conversions.isLoading ? (
              <TableSkeleton rows={5} cols={7} />
            ) : (conversions.data?.data ?? []).length === 0 ? (
              <EmptyState colSpan={7} />
            ) : (
              (conversions.data?.data ?? []).map((d: any) => (
                <tr key={d.id} className="hover:bg-white/2">
                  <Td>
                    <span className="text-xs">{fmt.dateTime(d.createdAt)}</span>
                  </Td>
                  <Td>
                    <Badge
                      variant={
                        d.status === "confirmed" || d.status === "CONFIRMED"
                          ? "green"
                          : "yellow"
                      }
                    >
                      {d.status}
                    </Badge>
                  </Td>
                  <Td>
                    <span className="text-zinc-300 text-xs">
                      {d.link?.offer?.name ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-semibold text-emerald-400">
                      {fmt.usd(d.amount)}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-semibold text-amber-400">
                      {fmt.usd(d.commissions?.[0]?.amount ?? 0)}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs text-zinc-500">
                      {d.subId ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-zinc-500 truncate max-w-[100px] block">
                      {d.link?.name ?? "—"}
                    </span>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrapper>
      )}

      {/* ── Clicks ── */}
      {tab === "Clicks" && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Offer</Th>
              <Th>Link</Th>
              <Th>Click ID</Th>
              <Th>Sub ID</Th>
              <Th>Device</Th>
              <Th>IP</Th>
              <Th>Unique</Th>
            </tr>
          </thead>
          <tbody>
            {clicks.isLoading ? (
              <TableSkeleton rows={5} cols={8} />
            ) : (
              (() => {
                const rows = (clicks.data?.data ?? []).filter(
                  (c: any) => !c.isInvalid,
                );
                return rows.length === 0 ? (
                  <EmptyState colSpan={8} />
                ) : (
                  rows.map((c: any) => (
                    <tr key={c.id} className="hover:bg-white/2">
                      <Td>
                        <span className="text-xs">
                          {fmt.dateTime(c.createdAt)}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-xs text-zinc-300">
                          {c.link?.offer?.name ?? "—"}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-xs text-zinc-400">
                          {c.link?.name ?? "—"}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-mono text-xs text-zinc-500">
                          {c.id.slice(-12)}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-mono text-xs text-zinc-500">
                          {c.link?.subId ?? "—"}
                        </span>
                      </Td>
                      <Td>
                        <Badge variant="blue">
                          {c.deviceType ?? "unknown"}
                        </Badge>
                      </Td>
                      <Td>
                        <span className="text-xs text-zinc-500">
                          {c.ipAddress ?? "—"}
                        </span>
                      </Td>
                      <Td>
                        <Badge variant={c.isUnique ? "green" : "yellow"}>
                          {c.isUnique ? "Unique" : "Dupe"}
                        </Badge>
                      </Td>
                    </tr>
                  ))
                );
              })()
            )}
          </tbody>
        </TableWrapper>
      )}

      {/* ── Invalid Clicks ── */}
      {tab === "Invalid Clicks" && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Offer</Th>
              <Th>Link</Th>
              <Th>Click ID</Th>
              <Th>Device</Th>
              <Th>IP</Th>
              <Th>Reason</Th>
            </tr>
          </thead>
          <tbody>
            {clicks.isLoading ? (
              <TableSkeleton rows={5} cols={7} />
            ) : (
              (() => {
                const rows = (clicks.data?.data ?? []).filter(
                  (c: any) => c.isInvalid,
                );
                return rows.length === 0 ? (
                  <EmptyState colSpan={7} label="No invalid clicks." />
                ) : (
                  rows.map((c: any) => (
                    <tr key={c.id} className="hover:bg-white/2">
                      <Td>
                        <span className="text-xs">
                          {fmt.dateTime(c.createdAt)}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-xs text-zinc-300">
                          {c.link?.offer?.name ?? "—"}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-xs text-zinc-400">
                          {c.link?.name ?? "—"}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-mono text-xs text-zinc-500">
                          {c.id.slice(-12)}
                        </span>
                      </Td>
                      <Td>
                        <Badge variant="blue">
                          {c.deviceType ?? "unknown"}
                        </Badge>
                      </Td>
                      <Td>
                        <span className="text-xs text-zinc-500">
                          {c.ipAddress ?? "—"}
                        </span>
                      </Td>
                      <Td>
                        <Badge variant="red">Invalid</Badge>
                      </Td>
                    </tr>
                  ))
                );
              })()
            )}
          </tbody>
        </TableWrapper>
      )}

      {/* ── Postbacks ── */}
      {tab === "Affiliates Postbacks" && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Offer</Th>
              <Th>Link</Th>
              <Th>Sub ID</Th>
              <Th>Amount</Th>
              <Th>Commission</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {postbacks.isLoading ? (
              <TableSkeleton rows={5} cols={7} />
            ) : (postbacks.data ?? []).length === 0 ? (
              <EmptyState colSpan={7} />
            ) : (
              (postbacks.data ?? []).map((p: any) => (
                <tr key={p.id} className="hover:bg-white/2">
                  <Td>
                    <span className="text-xs">{fmt.dateTime(p.createdAt)}</span>
                  </Td>
                  <Td>
                    <span className="text-xs text-zinc-300">
                      {p.link?.offer?.name ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-zinc-400">
                      {p.link?.name ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs text-zinc-500">
                      {p.subId ?? "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-semibold text-emerald-400">
                      {fmt.usd(p.amount)}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-semibold text-amber-400">
                      {fmt.usd(p.commissions?.[0]?.amount ?? 0)}
                    </span>
                  </Td>
                  <Td>
                    <Badge
                      variant={p.status === "confirmed" ? "green" : "yellow"}
                    >
                      {p.status}
                    </Badge>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrapper>
      )}
    </motion.div>
  );
}
