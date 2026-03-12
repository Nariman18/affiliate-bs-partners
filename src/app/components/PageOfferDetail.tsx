"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useCreateLink, useOffer, useTeam } from "../hooks/useDashboard";
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
  AmberBtn,
  Modal,
} from "./dashboard/UI";
import { AnimatePresence } from "motion/react";

interface Props {
  offerId: string;
  role: AppRole;
  onBack: () => void;
}

export default function PageOfferDetail({ offerId, role, onBack }: Props) {
  const [tab, setTab] = useState("Goals");
  const [showDistribute, setShowDistribute] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState("");

  const { data: offer, isLoading } = useOffer(offerId);
  const createLink = useCreateLink();

  // Admin/Basic need to pick a Manager to assign the link to
  const { data: team = [], isLoading: teamLoading } = useTeam();
  const managers = (team as any[]).filter(
    (m: any) => m.role === ROLES.MANAGER || !m.role,
  );

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
        },
      },
    );
  };

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

      <div className="grid md:grid-cols-[1fr_260px] gap-6">
        <div>
          {/* Header */}
          <div className="rounded-2xl border border-white/6 bg-zinc-900/60 p-6 mb-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-zinc-800 border border-white/8 flex items-center justify-center text-xs font-bold text-zinc-500 flex-shrink-0">
                {offer.category?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight mb-2">
                  {offer.name}
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  {offer.status && (
                    <Badge
                      variant={offer.status === "ACTIVE" ? "green" : "yellow"}
                    >
                      {offer.status}
                    </Badge>
                  )}
                  {offer.myRequestStatus === "PENDING" && (
                    <Badge variant="yellow">Request pending</Badge>
                  )}
                  {offer.myRequestStatus === "APPROVED" && (
                    <Badge variant="green">Access approved</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <TabBar
            tabs={["Goals", "Clicks", "Conversions"]}
            active={tab}
            onChange={setTab}
          />

          {tab === "Goals" && (
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Goal</Th>
                  <Th>Commission</Th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-white/2">
                  <Td>
                    <span className="font-semibold text-white">
                      Deposit (CPA)
                    </span>
                  </Td>
                  <Td>
                    <span className="font-bold text-emerald-400">
                      {offer.commissionPct ?? 10}% of deposit
                    </span>
                  </Td>
                </tr>
              </tbody>
            </TableWrapper>
          )}

          {(tab === "Clicks" || tab === "Conversions") && (
            <div className="rounded-2xl border border-white/6 bg-zinc-900/50 p-8 text-center">
              <p className="text-zinc-600 text-sm">
                No data for the selected period.
              </p>
            </div>
          )}

          {/* Manager's own tracking links */}
          {role === ROLES.MANAGER && offer.links && offer.links.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-bold text-white mb-3">
                Your Tracking Links
              </h3>
              <TableWrapper>
                <thead>
                  <tr>
                    <Th>Name</Th>
                    <Th>Sub ID</Th>
                    <Th>Tracking URL</Th>
                  </tr>
                </thead>
                <tbody>
                  {offer.links.map((link: any) => (
                    <tr key={link.id} className="hover:bg-white/2">
                      <Td>{link.name}</Td>
                      <Td>
                        <span className="font-mono text-xs text-zinc-500">
                          {link.subId ?? "—"}
                        </span>
                      </Td>
                      <Td>
                        <code className="text-xs font-mono text-sky-400">
                          {`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/track/${link.id}`}
                        </code>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrapper>
            </div>
          )}

          {/* Admin / Basic Sub: distribute a link to a Manager */}
          {(role === ROLES.ADMIN || role === ROLES.BASIC) &&
            offer.status === "ACTIVE" && (
              <div className="mt-5">
                <AmberBtn onClick={() => setShowDistribute(true)}>
                  <LinkIcon className="w-3.5 h-3.5" /> Distribute Link to
                  Manager
                </AmberBtn>
              </div>
            )}

          {offer.description && (
            <div className="mt-5 rounded-2xl border border-white/6 bg-zinc-900/40 p-5">
              <p className="text-xs text-zinc-500 leading-relaxed">
                {offer.description}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/6 bg-zinc-900/60 p-5">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
              Offer Details
            </h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Category", value: offer.category ?? "—" },
                { label: "Commission", value: `${offer.commissionPct ?? 10}%` },
                { label: "Target GEO", value: offer.targetCountry ?? "Global" },
                {
                  label: "Created by",
                  value: offer.createdBy?.username ?? "—",
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-zinc-600">{label}</span>
                  <span className="text-zinc-300 font-semibold">{value}</span>
                </div>
              ))}
              {/* casinoUrl visible only to Admin and Basic Sub */}
              {(role === ROLES.ADMIN || role === ROLES.BASIC) &&
                offer.casinoUrl && (
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                      Casino URL
                    </p>
                    <a
                      href={offer.casinoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors break-all"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {offer.casinoUrl.replace(/^https?:\/\//, "").slice(0, 40)}
                      …
                    </a>
                  </div>
                )}
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
