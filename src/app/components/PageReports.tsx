"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCw,
  Download,
  Calendar,
  ChevronDown,
  X,
  Globe,
  Tag,
} from "lucide-react";
import {
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
  Badge,
} from "./dashboard/UI";
import {
  useReportGeneral,
  useReportByOffer,
  useReportByCountry,
  useReportByDevice,
  useOffers,
} from "../hooks/useDashboard";
import { type AppRole } from "../lib/api";

// ─── Report tabs ──────────────────────────────────────────────────────────────
const REPORT_TABS = [
  "General",
  "Daily",
  "Monthly",
  "Offer",
  "Country",
  "Device Type",
  "Device OS",
  "Smart Links",
  "Referrals",
];

// ─── Date range presets ───────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

const PRESETS = [
  { label: "Today", from: today(), to: today() },
  { label: "Yesterday", from: daysAgo(1), to: daysAgo(1) },
  { label: "Last 7 days", from: daysAgo(7), to: today() },
  { label: "Last 30 days", from: daysAgo(30), to: today() },
  { label: "Last 90 days", from: daysAgo(90), to: today() },
  {
    label: "This month",
    from: new Date().toISOString().slice(0, 8) + "01",
    to: today(),
  },
];

// ─── Date Range Picker ────────────────────────────────────────────────────────
function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dFrom, setDFrom] = useState(from);
  const [dTo, setDTo] = useState(to);

  const apply = () => {
    onChange(dFrom, dTo);
    setOpen(false);
  };

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
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setDFrom(p.from);
                      setDTo(p.to);
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      dFrom === p.from && dTo === p.to
                        ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                        : "border border-white/8 text-zinc-500 hover:text-white"
                    }`}
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
                    value={dFrom}
                    onChange={(e) => setDFrom(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-white/8 bg-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-400/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 block">
                    To
                  </label>
                  <input
                    type="date"
                    value={dTo}
                    onChange={(e) => setDTo(e.target.value)}
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
                  onClick={apply}
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

// ─── Generic filter dropdown ──────────────────────────────────────────────────
function FilterDrop({
  label,
  options,
  value,
  onChange,
  icon,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const sel = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-zinc-800/40 text-xs font-semibold text-zinc-400 hover:border-white/20 hover:text-white transition-all"
      >
        {icon}
        {sel?.label ?? label}
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
              className="absolute left-0 top-9 z-20 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl min-w-[160px] max-h-52 overflow-y-auto py-1"
            >
              {options.map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === o.value ? "text-amber-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                >
                  {o.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  role: AppRole;
}

export default function PageReports({ role: _role }: Props) {
  const [activeTab, setActiveTab] = useState("General");
  const [dateFrom, setDateFrom] = useState(daysAgo(30));
  const [dateTo, setDateTo] = useState(today());
  const [offerId, setOfferId] = useState("");
  const [country, setCountry] = useState("");

  const params = useMemo(
    () => ({ from: dateFrom, to: dateTo }),
    [dateFrom, dateTo],
  );

  const general = useReportGeneral(params);
  const byOffer = useReportByOffer(params);
  const byCountry = useReportByCountry(params);
  const byDevice = useReportByDevice(params);
  const { data: allOffers = [] } = useOffers();

  const offerOptions = useMemo(
    () => [
      { value: "", label: "All Offers" },
      ...(allOffers as any[]).map((o: any) => ({ value: o.id, label: o.name })),
    ],
    [allOffers],
  );

  const rows = (() => {
    switch (activeTab) {
      case "Offer":
        return (byOffer.data ?? []).filter(
          (r: any) => !offerId || r.offerId === offerId,
        );
      case "Country":
        return (byCountry.data ?? []).filter(
          (r: any) => !country || r.country === country,
        );
      default:
        return general.data?.rows ?? [];
    }
  })();

  const totals = general.data?.totals;
  const isLoad =
    general.isLoading ||
    byOffer.isLoading ||
    byCountry.isLoading ||
    byDevice.isLoading;

  // Safe percentage calculation
  const safePct = (num: number, denom: number) =>
    denom > 0 ? fmt.pct((Number(num) / Number(denom)) * 100) : "0%";

  return (
    <motion.div
      key="reports"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <SectionHeader title="Reports" />
        <OutlineBtn onClick={() => general.refetch()}>
          <RefreshCw className="w-3 h-3" /> Refresh
        </OutlineBtn>
      </div>

      <TabBar tabs={REPORT_TABS} active={activeTab} onChange={setActiveTab} />

      {/* ── Filter row ── */}
      <FilterBar>
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={(f, t) => {
            setDateFrom(f);
            setDateTo(t);
          }}
        />

        {(activeTab === "Offer" ||
          activeTab === "General" ||
          activeTab === "Daily") && (
          <FilterDrop
            label="Offer"
            icon={<Tag className="w-3 h-3" />}
            options={offerOptions}
            value={offerId}
            onChange={setOfferId}
          />
        )}

        {activeTab === "Country" && (
          <FilterDrop
            label="Country"
            icon={<Globe className="w-3 h-3" />}
            options={[
              { value: "", label: "All Countries" },
              ...[
                "US",
                "GB",
                "DE",
                "FR",
                "IT",
                "PL",
                "ES",
                "NL",
                "BR",
                "CA",
                "AU",
                "NG",
                "IN",
                "TR",
                "RU",
              ].map((c) => ({ value: c, label: c })),
            ]}
            value={country}
            onChange={setCountry}
          />
        )}

        {(country || offerId) && (
          <button
            onClick={() => {
              setCountry("");
              setOfferId("");
            }}
            className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-rose-400 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-600">{rows.length} rows</span>
          <OutlineBtn>
            <Download className="w-3 h-3" /> Export
          </OutlineBtn>
        </div>
      </FilterBar>

      {/* ── Offer table ── */}
      {activeTab === "Offer" && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Offer</Th>
              <Th>Clicks</Th>
              <Th>Unique</Th>
              <Th>Conversions</Th>
              <Th>Revenue</Th>
              <Th>Commission</Th>
            </tr>
          </thead>
          <tbody>
            {isLoad ? (
              <TableSkeleton rows={3} cols={6} />
            ) : rows.length === 0 ? (
              <EmptyState colSpan={6} />
            ) : (
              rows.map((r: any, i: number) => (
                <tr key={i} className="hover:bg-white/2">
                  <Td>
                    <span className="font-semibold text-white">
                      {r.offerName ?? r.offer?.name ?? "—"}
                    </span>
                  </Td>
                  <Td>{r.clicks ?? 0}</Td>
                  <Td>{r.unique ?? 0}</Td>
                  <Td>
                    <span className="text-emerald-400">
                      {r.conversions ?? 0}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-semibold text-emerald-400">
                      {fmt.usd(r.revenue ?? 0)}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-semibold text-amber-400">
                      {fmt.usd(r.commission ?? 0)}
                    </span>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrapper>
      )}

      {/* ── Country table ── */}
      {activeTab === "Country" && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Country</Th>
              <Th>Clicks (Gross)</Th>
              <Th>Unique</Th>
              <Th>Conversions</Th>
            </tr>
          </thead>
          <tbody>
            {byCountry.isLoading ? (
              <TableSkeleton rows={3} cols={4} />
            ) : rows.length === 0 ? (
              <EmptyState colSpan={4} />
            ) : (
              rows.map((r: any, i: number) => (
                <tr key={i} className="hover:bg-white/2">
                  <Td>
                    <span className="font-semibold text-zinc-300">
                      {r.country ?? "—"}
                    </span>
                  </Td>
                  <Td>{r.clicks ?? 0}</Td>
                  <Td>{r.unique ?? 0}</Td>
                  <Td>
                    <span className="text-emerald-400">
                      {r.conversions ?? 0}
                    </span>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrapper>
      )}

      {/* ── Device / OS table ── */}
      {(activeTab === "Device Type" || activeTab === "Device OS") && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>{activeTab === "Device Type" ? "Device" : "OS"}</Th>
              <Th>Clicks</Th>
              <Th>Share</Th>
            </tr>
          </thead>
          <tbody>
            {byDevice.isLoading ? (
              <TableSkeleton rows={3} cols={3} />
            ) : (
              (() => {
                const map =
                  activeTab === "Device Type"
                    ? byDevice.data?.byDevice
                    : byDevice.data?.byOS;
                if (!map || Object.keys(map).length === 0)
                  return <EmptyState colSpan={3} />;
                const total = Object.values(map).reduce(
                  (s: number, v) => s + Number(v),
                  0,
                );
                return Object.entries(map).map(([k, v], i) => (
                  <tr key={i} className="hover:bg-white/2">
                    <Td>
                      <Badge variant="blue">{k}</Badge>
                    </Td>
                    <Td>{String(v)}</Td>
                    <Td>
                      <span className="text-zinc-400">
                        {safePct(Number(v), total)}
                      </span>
                    </Td>
                  </tr>
                ));
              })()
            )}
          </tbody>
        </TableWrapper>
      )}

      {/* ── Smart Links placeholder ── */}
      {activeTab === "Smart Links" && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Link</Th>
              <Th>Clicks</Th>
              <Th>Conversions</Th>
              <Th>Commission</Th>
            </tr>
          </thead>
          <tbody>
            {isLoad ? (
              <TableSkeleton rows={3} cols={4} />
            ) : (
              <EmptyState
                colSpan={4}
                label="No smart links data for this period."
              />
            )}
          </tbody>
        </TableWrapper>
      )}

      {/* ── Referrals placeholder ── */}
      {activeTab === "Referrals" && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>Referral</Th>
              <Th>Joined</Th>
              <Th>Commission</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {isLoad ? (
              <TableSkeleton rows={3} cols={4} />
            ) : (
              <EmptyState
                colSpan={4}
                label="No referral data for this period."
              />
            )}
          </tbody>
        </TableWrapper>
      )}

      {/* ── General / Daily / Monthly table ── */}
      {![
        "Offer",
        "Country",
        "Device Type",
        "Device OS",
        "Smart Links",
        "Referrals",
      ].includes(activeTab) && (
        <TableWrapper>
          <thead>
            <tr>
              <Th>
                {activeTab === "Daily"
                  ? "Day"
                  : activeTab === "Monthly"
                    ? "Month"
                    : "Date"}
              </Th>
              <Th>Clicks (Gross)</Th>
              <Th>Clicks (Unique)</Th>
              <Th>Invalid</Th>
              <Th>Approved</Th>
              <Th>CR Approved</Th>
              <Th>Pending</Th>
              <Th>CR Pending</Th>
              <Th>Rejected</Th>
              <Th>Revenue</Th>
              <Th>Commission</Th>
            </tr>
          </thead>
          <tbody>
            {isLoad ? (
              <TableSkeleton rows={5} cols={11} />
            ) : rows.length === 0 ? (
              <EmptyState colSpan={11} />
            ) : (
              <>
                {rows.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-white/2">
                    <Td>
                      <span className="font-semibold text-zinc-300">
                        {r.date ?? r.month ?? "—"}
                      </span>
                    </Td>
                    <Td>{Number(r.gross ?? 0)}</Td>
                    <Td>{Number(r.unique ?? 0)}</Td>
                    <Td>
                      <span className="text-rose-400">
                        {Number(r.invalid ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-emerald-400">
                        {Number(r.approved ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      {safePct(Number(r.approved ?? 0), Number(r.gross ?? 0))}
                    </Td>
                    <Td>
                      <span className="text-yellow-400">
                        {Number(r.pending ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      {safePct(Number(r.pending ?? 0), Number(r.gross ?? 0))}
                    </Td>
                    <Td>
                      <span className="text-rose-400">
                        {Number(r.rejected ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-emerald-400">
                        {fmt.usd(r.revenue ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-amber-400">
                        {fmt.usd(r.commission ?? 0)}
                      </span>
                    </Td>
                  </tr>
                ))}
                {totals && (
                  <tr className="bg-zinc-900/50 border-t border-white/8">
                    <Td>
                      <span className="font-black text-white">Total</span>
                    </Td>
                    <Td>
                      <span className="font-bold">
                        {Number(totals.gross ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-bold">
                        {Number(totals.unique ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-bold text-rose-400">
                        {Number(totals.invalid ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-bold text-emerald-400">
                        {Number(totals.approved ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      {safePct(
                        Number(totals.approved ?? 0),
                        Number(totals.gross ?? 0),
                      )}
                    </Td>
                    <Td>
                      <span className="font-bold text-yellow-400">
                        {Number(totals.pending ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      {safePct(
                        Number(totals.pending ?? 0),
                        Number(totals.gross ?? 0),
                      )}
                    </Td>
                    <Td>
                      <span className="font-bold text-rose-400">
                        {Number(totals.rejected ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-bold text-emerald-400">
                        {fmt.usd(totals.revenue ?? 0)}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-bold text-amber-400">
                        {fmt.usd(totals.commission ?? 0)}
                      </span>
                    </Td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </TableWrapper>
      )}
    </motion.div>
  );
}
