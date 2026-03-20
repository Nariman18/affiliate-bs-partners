"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Badge,
  fadeUp,
  pageIn,
  SectionHeader,
  PaginationBar,
} from "./dashboard/UI";

const ALL_NEWS = [
  {
    title: "New high-converting offer: BetNow Canada – $200 FTD CPA",
    date: "07.03.2026",
    tag: "New Offer",
    body: "We've added BetNow CA with an exclusive $200 FTD CPA rate. Limited spots available — request access now before it fills up.",
  },
  {
    title: "Platform Update: Sub-ID tracking enhanced",
    date: "05.03.2026",
    tag: "Platform",
    body: "Sub-ID 2 & 3 now support dynamic macros for improved funnel tracking. Check the API docs for the updated parameter list.",
  },
  {
    title: "Payout processing window change",
    date: "01.03.2026",
    tag: "Billing",
    body: "Starting April 1, 2026, all payout requests submitted before the 25th of the month will be processed within 3 business days.",
  },
  {
    title: "New GEO unlocked: Brazil — R$50 FTD minimum",
    date: "28.02.2026",
    tag: "New Offer",
    body: "Brazil is now available across all active offers. Minimum FTD threshold set at R$50. Creatives available in the media kit.",
  },
  {
    title: "Affiliate Manager dashboard improvements",
    date: "25.02.2026",
    tag: "Platform",
    body: "The Manager dashboard now displays real-time click data and a 30-day revenue chart. Offer detail pages have been redesigned.",
  },
  {
    title: "Sub-Affiliate commission rate update",
    date: "20.02.2026",
    tag: "Billing",
    body: "Effective March 1st, the default commission rate for Basic Sub-Affiliates increases from 8% to 10% on all confirmed deposits.",
  },
  {
    title: "New offer: 1xBet – PL market exclusive",
    date: "15.02.2026",
    tag: "New Offer",
    body: "1xBet Poland is now live with an exclusive $35 FTD CPA. Polish traffic only. Request access via the Offers page.",
  },
  {
    title: "Tracking link format updated",
    date: "10.02.2026",
    tag: "Platform",
    body: "All new tracking links now use the CUID2 format for improved uniqueness. Existing links remain fully active.",
  },
  {
    title: "Referral program: Basic Sub invite rewards",
    date: "05.02.2026",
    tag: "Platform",
    body: "Basic Sub-Affiliates who successfully onboard a new manager will receive a $10 bonus credited to their approved balance.",
  },
  {
    title: "KYC/AML policy update for payouts",
    date: "01.02.2026",
    tag: "Billing",
    body: "Payout requests above $500 now require identity verification. Upload your documents in Billing → Payment Methods.",
  },
];

const PAGE_SIZE = 5;

export default function PageNews() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(ALL_NEWS.length / PAGE_SIZE);
  const paginated = ALL_NEWS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <motion.div
      key="news"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <SectionHeader
        title="News & Updates"
        sub="Latest platform announcements and partner news"
      />
      <div className="space-y-4">
        {paginated.map((item, i) => (
          <motion.div
            key={`${page}-${i}`}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-white/6 bg-zinc-900/60 p-5 hover:border-amber-400/20 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="amber">{item.tag}</Badge>
                <span className="text-xs text-zinc-600">{item.date}</span>
              </div>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">{item.body}</p>
          </motion.div>
        ))}
      </div>
      <PaginationBar
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={ALL_NEWS.length}
        pageSize={PAGE_SIZE}
      />
    </motion.div>
  );
}
