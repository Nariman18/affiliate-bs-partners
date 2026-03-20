"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  ExternalLink,
  Link as LinkIcon,
  Globe,
  MousePointer2,
  Copy,
  TerminalSquare,
  ChevronDown,
} from "lucide-react";
import {
  useCreateLink,
  useOffer,
  useRequestOffer,
  useTeam,
  useOfferRequests,
  useUpdateOfferRequest,
  useMyLinks,
} from "../hooks/useDashboard";
import { ROLES, type AppRole } from "../lib/api";
import {
  Badge,
  fmt,
  pageIn,
  Spinner,
  TabBar,
  TableWrapper,
  Td,
  Th,
  EmptyState,
  TableSkeleton,
  AmberBtn,
  OutlineBtn,
  Modal,
} from "./dashboard/UI";
import { toast } from "sonner";
import { CATEGORIES, COUNTRIES } from "../lib/utils";

interface Props {
  offerId: string;
  role: AppRole;
  onBack: () => void;
}

// Helper to grab token
const getHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── Custom Form Select for Modals ─────────────────────────────────────────────
function FormSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: React.ReactNode }[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find((o) => o.value === value);

  return (
    <div className="relative w-full mb-5" ref={ref}>
      {label && (
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
      >
        <span className="truncate">{selectedOpt?.label || "Select..."}</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl max-h-48 overflow-y-auto py-1"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  value === opt.value
                    ? "text-amber-400 bg-white/5"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PageOfferDetail({ offerId, role, onBack }: Props) {
  const [tab, setTab] = useState("Tracking Links");
  const [showDistribute, setShowDistribute] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");

  const [clicks, setClicks] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  const { data: offer, isLoading, refetch } = useOffer(offerId);
  const createLink = useCreateLink();
  const requestOffer = useRequestOffer();

  const { data: requests = [], isLoading: reqLoading } = useOfferRequests(
    role !== ROLES.MANAGER ? offerId : "",
  );
  const updateReq = useUpdateOfferRequest();

  const { data: team = [], isLoading: teamLoading } = useTeam();
  const { data: myLinks = [] } = useMyLinks();

  const managers = team as any[];

  // Define logic for distributing for Admin vs Basic Sub
  const availableManagers = managers.filter((m: any) => {
    if (m.role !== ROLES.MANAGER) return false;
    // Admins distribute directly to managers who do NOT have a Basic supervisor
    if (role === ROLES.ADMIN) return !m.supervisorId;
    return true; // Basic users already receive only their own team managers from backend
  });

  const TABS =
    role === ROLES.MANAGER
      ? ["Tracking Links", "Goals", "Clicks", "Conversions"]
      : ["Tracking Links", "Access Requests", "Goals", "Clicks", "Conversions"];

  // Fetch stats when Clicks or Conversions tab is active
  useEffect(() => {
    if (tab === "Clicks" || tab === "Conversions") {
      setStatsLoading(true);
      const url = `${process.env.NEXT_PUBLIC_API_URL || "/api"}/offers/${offerId}/${tab.toLowerCase()}`;
      fetch(url, { headers: getHeaders() })
        .then((r) => r.json())
        .then((data) => {
          if (tab === "Clicks") setClicks(data);
          if (tab === "Conversions") setConversions(data);
        })
        .finally(() => setStatsLoading(false));
    }
  }, [tab, offerId]);

  if (isLoading) return <Spinner />;
  if (!offer) return <p className="text-zinc-500 text-sm">Offer not found.</p>;

  const handleDistribute = () => {
    if (!selectedManagerId) return;
    createLink.mutate(
      { offerId: offer.id, affiliateId: selectedManagerId },
      {
        onSuccess: () => {
          setShowDistribute(false);
          setSelectedManagerId("");
          refetch();
        },
      },
    );
  };

  const handleGenerateTestLink = () => {
    createLink.mutate(
      { offerId: offer.id, affiliateId: "", name: `Test Link - ${offer.name}` },
      { onSuccess: () => refetch() },
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const geoData = COUNTRIES.find((c: any) => c.code === offer.targetCountry);
  const displayLinks =
    role === ROLES.MANAGER
      ? myLinks.filter((link: any) => link.offerId === offer.id)
      : offer.links;

  // Dynamically build the sidebar stats depending on the user's role
  const sidebarStats = [
    { label: "Category", value: offer.category ?? "—" },
    ...(role === ROLES.ADMIN || role === ROLES.BASIC
      ? [
          {
            label: "Commission",
            value:
              offer.commissionPct != null ? fmt.pct(offer.commissionPct) : "—",
          },
        ]
      : []),
    { label: "EPC", value: offer.epc ? fmt.usd(offer.epc) : "—" },
    { label: "CR", value: offer.cr ? `${offer.cr}%` : "—" },
    { label: "AR", value: offer.ar ? `${offer.ar}%` : "—" },
    { label: "Session Lifespan", value: "14 days" },
  ];

  return (
    <motion.div
      key="offer-detail"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-white transition-colors mb-5"
      >
        <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to Offers
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-white/8 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xl">
            {offer.logoUrl ? (
              <img
                src={offer.logoUrl}
                alt={offer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-black text-zinc-600">
                {offer.category?.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {offer.isTop && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500/70 text-white uppercase">
                  Top
                </span>
              )}
              {offer.isExclusive && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-fuchsia-500/70 text-white uppercase">
                  Exclusive
                </span>
              )}
              {offer.isNew && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-500/70 text-white uppercase">
                  New
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              {offer.name}
            </h2>
            <div className="flex items-center gap-3">
              {(role === ROLES.ADMIN || role === ROLES.BASIC) &&
                offer.casinoUrl && (
                  <a
                    href={offer.casinoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors bg-sky-400/10 px-2.5 py-1 rounded-lg"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Landing Page
                  </a>
                )}
              {offer.status && (
                <Badge variant={offer.status === "ACTIVE" ? "green" : "yellow"}>
                  {offer.status}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div>
          {role === ROLES.MANAGER && !offer.myRequestStatus && (
            <AmberBtn
              onClick={() => requestOffer.mutate(offer.id)}
              disabled={requestOffer.isPending}
            >
              {requestOffer.isPending ? "Requesting..." : "Request Offer"}
            </AmberBtn>
          )}
          {role === ROLES.MANAGER && offer.myRequestStatus === "PENDING" && (
            <div className="px-4 py-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400 text-sm font-semibold">
              Request Pending
            </div>
          )}
          {role === ROLES.MANAGER && offer.myRequestStatus === "APPROVED" && (
            <div className="px-4 py-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 text-sm font-semibold">
              Access Approved
            </div>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 md:gap-8">
        <div>
          <TabBar tabs={TABS} active={tab} onChange={setTab} />

          {/* ── TRACKING LINKS ── */}
          {tab === "Tracking Links" && (
            <div className="mt-4">
              {(role === ROLES.ADMIN || role === ROLES.BASIC) &&
                offer.status === "ACTIVE" && (
                  <div className="flex gap-3 mb-6">
                    {/* Distribute link action now available for Admin and Basic */}
                    <AmberBtn onClick={() => setShowDistribute(true)}>
                      <LinkIcon className="w-3.5 h-3.5" /> Distribute Link to
                      Manager
                    </AmberBtn>
                    {role === ROLES.ADMIN && (
                      <OutlineBtn
                        onClick={handleGenerateTestLink}
                        disabled={createLink.isPending}
                      >
                        <TerminalSquare className="w-3.5 h-3.5" /> Generate Test
                        Link
                      </OutlineBtn>
                    )}
                  </div>
                )}
              <TableWrapper>
                <thead>
                  <tr>
                    <Th>Name</Th>
                    <Th>Link ID</Th>
                    <Th>Tracking URL</Th>
                  </tr>
                </thead>
                <tbody>
                  {!displayLinks || displayLinks.length === 0 ? (
                    <EmptyState
                      colSpan={3}
                      label={
                        role === ROLES.MANAGER
                          ? "No links assigned yet."
                          : "No tracking links generated yet."
                      }
                    />
                  ) : (
                    displayLinks.map((link: any) => (
                      <tr key={link.id} className="hover:bg-white/2">
                        <Td>{link.name}</Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-amber-400 font-bold">
                              {link.id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(link.id)}
                              className="text-zinc-500 hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <code className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-1 rounded truncate max-w-[200px]">
                              {`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/track/${link.id}`}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/track/${link.id}`,
                                )
                              }
                              className="text-zinc-500 hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </TableWrapper>
              {role === ROLES.ADMIN && (
                <div className="mt-4 p-4 rounded-xl border border-sky-500/20 bg-sky-500/5">
                  <h4 className="text-xs font-bold text-sky-400 mb-2 flex items-center gap-2">
                    <TerminalSquare className="w-3.5 h-3.5" /> How to test
                    postbacks
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    Copy the <strong className="text-amber-400">Link ID</strong>{" "}
                    above and run:
                  </p>
                  <code className="block w-full p-3 rounded-lg bg-black text-[10px] font-mono text-zinc-300 overflow-x-auto whitespace-pre">
                    {`curl -X POST http://localhost:5001/api/track/postback \
-H "Content-Type: application/json" \
-H "x-postback-secret: ${process.env.NEXT_PUBLIC_POSTBACK_SECRET || "your_casino_postback_secret"}" \
-d '{
  "linkId": "PASTE_LINK_ID_HERE",
  "amount": 150.00,
  "currency": "USD"
}'`}
                  </code>
                </div>
              )}
            </div>
          )}

          {/* ── ACCESS REQUESTS ── */}
          {tab === "Access Requests" && (
            <div className="mt-4">
              <TableWrapper>
                <thead>
                  <tr>
                    <Th>Affiliate Manager</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {reqLoading ? (
                    <TableSkeleton rows={3} cols={4} />
                  ) : requests.length === 0 ? (
                    <EmptyState
                      colSpan={4}
                      label="No access requests for this offer yet."
                    />
                  ) : (
                    requests.map((req: any) => (
                      <tr key={req.id} className="hover:bg-white/2">
                        <Td>
                          <div>
                            <div className="font-semibold text-white text-sm">
                              {req.user.username}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {req.user.email}
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <span className="text-xs text-zinc-400">
                            {fmt.date(req.createdAt)}
                          </span>
                        </Td>
                        <Td>
                          {req.status === "APPROVED" && (
                            <Badge variant="green">APPROVED</Badge>
                          )}
                          {req.status === "PENDING" && (
                            <Badge variant="yellow">PENDING</Badge>
                          )}
                          {req.status === "REJECTED" && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                              REJECTED
                            </span>
                          )}
                        </Td>
                        <Td>
                          <div className="flex gap-2">
                            {req.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() =>
                                    updateReq.mutate({
                                      offerId: offer.id,
                                      reqId: req.id,
                                      status: "APPROVED",
                                    })
                                  }
                                  disabled={updateReq.isPending}
                                  className="px-2 py-1 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 hover:bg-emerald-500/25 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    updateReq.mutate({
                                      offerId: offer.id,
                                      reqId: req.id,
                                      status: "REJECTED",
                                    })
                                  }
                                  disabled={updateReq.isPending}
                                  className="px-2 py-1 bg-rose-500/15 text-rose-400 text-[10px] font-bold rounded-lg border border-rose-500/20 hover:bg-rose-500/25 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {req.status === "APPROVED" && (
                              <button
                                onClick={() =>
                                  updateReq.mutate({
                                    offerId: offer.id,
                                    reqId: req.id,
                                    status: "REJECTED",
                                  })
                                }
                                disabled={updateReq.isPending}
                                className="px-2 py-1 bg-rose-500/15 text-rose-400 text-[10px] font-bold rounded-lg border border-rose-500/20 hover:bg-rose-500/25 transition-colors"
                              >
                                Revoke Access
                              </button>
                            )}
                            {req.status === "REJECTED" && (
                              <button
                                onClick={() =>
                                  updateReq.mutate({
                                    offerId: offer.id,
                                    reqId: req.id,
                                    status: "APPROVED",
                                  })
                                }
                                disabled={updateReq.isPending}
                                className="px-2 py-1 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 hover:bg-emerald-500/25 transition-colors"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {/* ── GOALS ── */}
          {tab === "Goals" && (
            <div className="mt-4">
              <TableWrapper>
                <thead>
                  <tr>
                    <Th>Goal</Th>
                    <Th>Type</Th>
                    <Th>Payout</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-white/2">
                    <Td>
                      <span className="font-semibold text-white">REG</span>
                    </Td>
                    <Td>
                      <span className="text-zinc-500 text-xs uppercase tracking-wider">
                        Registration
                      </span>
                    </Td>
                    <Td>
                      <span className="font-bold text-emerald-400">
                        {fmt.usd(offer.regPayout ?? 0)}
                      </span>
                    </Td>
                  </tr>
                  <tr className="hover:bg-white/2">
                    <Td>
                      <span className="font-semibold text-white">FTD</span>
                    </Td>
                    <Td>
                      <span className="text-zinc-500 text-xs uppercase tracking-wider">
                        First Time Deposit
                      </span>
                    </Td>
                    <Td>
                      <span className="font-bold text-emerald-400">
                        {offer.minDeposit ? fmt.usd(offer.minDeposit) : "—"}
                      </span>
                    </Td>
                  </tr>
                </tbody>
              </TableWrapper>
              {offer.description && (
                <div className="mt-6 rounded-2xl border border-white/6 bg-zinc-900/40 p-6">
                  <h3 className="text-sm font-bold text-white mb-3">
                    Offer Description
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {offer.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── CLICKS ── */}
          {tab === "Clicks" && (
            <div className="mt-4">
              <TableWrapper>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>IP Address</Th>
                    <Th>Country</Th>
                    <Th>Device</Th>
                    <Th>OS</Th>
                  </tr>
                </thead>
                <tbody>
                  {statsLoading ? (
                    <TableSkeleton rows={5} cols={5} />
                  ) : clicks.length === 0 ? (
                    <EmptyState colSpan={5} label="No clicks recorded yet." />
                  ) : (
                    clicks.map((click) => (
                      <tr key={click.id} className="hover:bg-white/2">
                        <Td>
                          <span className="text-xs text-zinc-400">
                            {fmt.date(click.createdAt)}
                          </span>
                        </Td>
                        <Td>
                          <span className="font-mono text-xs text-zinc-300">
                            {click.ipAddress}
                          </span>
                        </Td>
                        <Td>
                          <Badge variant="default">{click.country}</Badge>
                        </Td>
                        <Td>
                          <span className="text-xs text-zinc-300">
                            {click.deviceType}
                          </span>
                        </Td>
                        <Td>
                          <span className="text-xs text-zinc-300">
                            {click.os}
                          </span>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {/* ── CONVERSIONS ── */}
          {tab === "Conversions" && (
            <div className="mt-4">
              <TableWrapper>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Sub ID</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {statsLoading ? (
                    <TableSkeleton rows={5} cols={4} />
                  ) : conversions.length === 0 ? (
                    <EmptyState
                      colSpan={4}
                      label="No conversions recorded yet."
                    />
                  ) : (
                    conversions.map((conv) => (
                      <tr key={conv.id} className="hover:bg-white/2">
                        <Td>
                          <span className="text-xs text-zinc-400">
                            {fmt.date(conv.createdAt)}
                          </span>
                        </Td>
                        <Td>
                          <span className="font-mono text-xs text-zinc-300 bg-white/5 px-2 py-1 rounded">
                            {conv.subId || "—"}
                          </span>
                        </Td>
                        <Td>
                          <span className="font-bold text-emerald-400">
                            {fmt.usd(conv.amount)}
                          </span>
                        </Td>
                        <Td>
                          <Badge
                            variant={
                              conv.status === "APPROVED"
                                ? "green"
                                : conv.status === "PENDING"
                                  ? "yellow"
                                  : "default"
                            }
                          >
                            {conv.status}
                          </Badge>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </TableWrapper>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:pt-[52px]">
          <div className="rounded-2xl border border-white/6 bg-zinc-900/60 overflow-hidden">
            {sidebarStats.map(({ label, value }, i) => (
              <div
                key={label}
                className={`flex items-center justify-between p-4 border-b border-white/5 ${i % 2 === 1 ? "bg-white/[0.02]" : ""}`}
              >
                <span className="text-sm font-semibold text-zinc-400">
                  {label}
                </span>
                <span className="font-bold text-zinc-300">{value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/6 bg-zinc-900/60 p-5">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Targeting
            </h3>
            {geoData ? (
              <div className="flex items-center gap-3">
                <span className="text-xl">{geoData.flag}</span>
                <span className="text-sm font-semibold text-white">
                  {geoData.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-zinc-500" />
                <span className="text-sm font-semibold text-white">Global</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/6 bg-zinc-900/60 p-5">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MousePointer2 className="w-4 h-4" /> Traffic Sources
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c: any) => c !== "All").map((ts: any) => (
                <span
                  key={ts}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${offer.category === ts ? "bg-amber-400/10 border-amber-400/30 text-amber-400" : "bg-zinc-800/50 border-white/5 text-zinc-600"}`}
                >
                  {ts}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribute link modal */}
      <AnimatePresence>
        {showDistribute && (
          <Modal onClose={() => setShowDistribute(false)}>
            <h3 className="text-lg font-black text-white mb-2">
              Distribute Tracking Link
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              Select the Affiliate Manager who will use this link.
            </p>
            {teamLoading ? (
              <div className="h-10 bg-zinc-800 rounded-xl animate-pulse mb-5" />
            ) : (
              <FormSelect
                value={selectedManagerId}
                onChange={setSelectedManagerId}
                options={[
                  { value: "", label: "— Select a manager —" },
                  ...availableManagers.map((m: any) => {
                    const isApproved = (requests as any[]).some(
                      (r: any) => r.user.id === m.id && r.status === "APPROVED",
                    );
                    return {
                      value: m.id,
                      label: `${m.displayName ?? m.username} (${m.email})${isApproved ? " ✅" : ""}`,
                    };
                  }),
                ]}
              />
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDistribute(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <AmberBtn
                onClick={handleDistribute}
                disabled={!selectedManagerId || createLink.isPending}
              >
                {createLink.isPending ? "Creating…" : "Create & Assign Link"}
              </AmberBtn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
