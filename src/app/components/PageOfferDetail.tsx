"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  ExternalLink,
  Link as LinkIcon,
  Globe,
  MousePointer2,
  Copy,
  TerminalSquare,
  UserCheck,
} from "lucide-react";
import {
  useCreateLink,
  useOffer,
  useRequestOffer,
  useTeam,
  useOfferRequests,
  useUpdateOfferRequest,
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

interface Props {
  offerId: string;
  role: AppRole;
  onBack: () => void;
}

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
];

const ALL_TRAFFIC_SOURCES = [
  "Facebook",
  "ASO",
  "PPC",
  "SEO",
  "In-App",
  "Email",
  "Push",
  "UAC",
  "FB Apps",
];

export default function PageOfferDetail({ offerId, role, onBack }: Props) {
  const [tab, setTab] = useState("Tracking Links");
  const [showDistribute, setShowDistribute] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");

  const { data: offer, isLoading, refetch } = useOffer(offerId);
  const createLink = useCreateLink();
  const requestOffer = useRequestOffer();

  // Only fetch requests if the user is an Admin or Basic Sub to avoid 403 errors
  const { data: requests = [], isLoading: reqLoading } = useOfferRequests(
    role !== ROLES.MANAGER ? offerId : "",
  );
  const updateReq = useUpdateOfferRequest();

  const { data: team = [], isLoading: teamLoading } = useTeam();
  const managers = (team as any[]).filter(
    (m: any) => m.role === ROLES.MANAGER || !m.role,
  );

  const TABS =
    role === ROLES.MANAGER
      ? ["Tracking Links", "Goals", "Clicks", "Conversions"]
      : ["Tracking Links", "Access Requests", "Goals", "Clicks", "Conversions"];

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
          refetch(); // Reload to show the new link
        },
      },
    );
  };

  const handleGenerateTestLink = () => {
    createLink.mutate(
      // FIXED: Passed affiliateId as empty string to satisfy TypeScript
      { offerId: offer.id, affiliateId: "", name: `Test Link - ${offer.name}` },
      { onSuccess: () => refetch() },
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const geoData = COUNTRIES.find((c) => c.code === offer.targetCountry);

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

      {/* Main Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-5">
          {/* Logo */}
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
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500/70 text-white uppercase tracking-wider">
                  Top
                </span>
              )}
              {offer.isExclusive && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-fuchsia-500/70 text-white uppercase tracking-wider">
                  Exclusive
                </span>
              )}
              {offer.isNew && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-500/70 text-white uppercase tracking-wider">
                  New
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              {offer.name}
            </h2>

            <div className="flex items-center gap-3">
              {offer.casinoUrl && (
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

        {/* Action Button Container */}
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
            <div className="px-4 py-2 rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-400 text-sm font-semibold flex items-center gap-2">
              Request Pending
            </div>
          )}
          {role === ROLES.MANAGER && offer.myRequestStatus === "APPROVED" && (
            <div className="px-4 py-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 text-sm font-semibold flex items-center gap-2">
              Access Approved
            </div>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid md:grid-cols-[1fr_280px] gap-8">
        <div>
          <TabBar tabs={TABS} active={tab} onChange={setTab} />

          {/* ── TRACKING LINKS TAB ── */}
          {tab === "Tracking Links" && (
            <div className="mt-4">
              {(role === ROLES.ADMIN || role === ROLES.BASIC) &&
                offer.status === "ACTIVE" && (
                  <div className="flex gap-3 mb-6">
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
                    <Th>Link ID (SubID)</Th>
                    <Th>Tracking URL</Th>
                  </tr>
                </thead>
                <tbody>
                  {!offer.links || offer.links.length === 0 ? (
                    <EmptyState
                      colSpan={3}
                      label="No tracking links generated yet."
                    />
                  ) : (
                    offer.links.map((link: any) => (
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
                              {`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5001"}/track/${link.id}`}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5001"}/track/${link.id}`,
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
                    from the table above. Open your terminal and run the
                    following curl command to simulate a successful Casino
                    deposit:
                  </p>
                  <code className="block w-full p-3 rounded-lg bg-black text-[10px] font-mono text-zinc-300 overflow-x-auto whitespace-pre">
                    {`curl -X POST http://localhost:5001/api/track/postback \\
-H "Content-Type: application/json" \\
-H "x-postback-secret: secret" \\
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

          {/* ── ACCESS REQUESTS TAB ── */}
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
                          {/* FIXED: Removed "rose" Badge constraint, used a custom span for rejected */}
                          {req.status === "APPROVED" && (
                            <Badge variant="green">APPROVED</Badge>
                          )}
                          {req.status === "PENDING" && (
                            <Badge variant="yellow">PENDING</Badge>
                          )}
                          {req.status === "REJECTED" && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                              REJECTED
                            </span>
                          )}
                        </Td>
                        <Td>
                          {req.status === "PENDING" ? (
                            <div className="flex gap-2">
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
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-600">—</span>
                          )}
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {/* ── GOALS TAB ── */}
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
              <div className="mt-8">
                <h3 className="text-sm font-bold text-white mb-3">
                  Offer Description
                </h3>
                <div className="rounded-2xl border border-white/6 bg-zinc-900/40 p-6">
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {offer.description || (
                      <span className="text-zinc-600 italic">
                        No description provided for this offer.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {(tab === "Clicks" || tab === "Conversions") && (
            <div className="mt-4 rounded-2xl border border-white/6 bg-zinc-900/50 p-8 text-center">
              <p className="text-zinc-600 text-sm">
                No data for the selected period.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 pt-[52px]">
          {/* Stats Box */}
          <div className="rounded-2xl border border-white/6 bg-zinc-900/60 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <span className="text-sm font-semibold text-zinc-400">
                Category
              </span>
              <span className="text-sm font-bold text-white">
                {offer.category ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/5">
              <span className="text-sm font-semibold text-zinc-400">EPC</span>
              <span className="font-bold text-zinc-300">
                {offer.epc ? fmt.usd(offer.epc) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <span className="text-sm font-semibold text-zinc-400">CR</span>
              <span className="font-bold text-zinc-300">
                {offer.cr ? `${offer.cr}%` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/5">
              <span className="text-sm font-semibold text-zinc-400">AR</span>
              <span className="font-bold text-zinc-300">
                {offer.ar ? `${offer.ar}%` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-semibold text-zinc-400 leading-tight">
                Click Session
                <br />
                Lifespan
              </span>
              <span className="font-bold text-zinc-300">14 days</span>
            </div>
          </div>

          {/* Geo Targeting Box */}
          <div className="rounded-2xl border border-white/6 bg-zinc-900/60 p-5">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Targeting
            </h3>
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              Conversions are accepted with the following targeting:
            </p>
            {geoData ? (
              <div className="flex items-center gap-3">
                <span className="text-xl drop-shadow-sm">{geoData.flag}</span>
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

          {/* Traffic Sources Box */}
          <div className="rounded-2xl border border-white/6 bg-zinc-900/60 p-5">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MousePointer2 className="w-4 h-4" /> Traffic
            </h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              By using prohibited traffic sources your account may be blocked.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_TRAFFIC_SOURCES.map((ts) => (
                <span
                  key={ts}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    offer.category === ts
                      ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                      : "bg-zinc-800/50 border-white/5 text-zinc-600"
                  }`}
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
              Select the Affiliate Manager who will use this link. Note: You
              should approve their request first if they sent one!
            </p>
            {teamLoading ? (
              <div className="h-10 bg-zinc-800 rounded-xl animate-pulse mb-5" />
            ) : (
              <select
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40 mb-5"
              >
                <option value="">— Select a manager —</option>
                {managers.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName ?? m.username} ({m.email})
                  </option>
                ))}
              </select>
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
