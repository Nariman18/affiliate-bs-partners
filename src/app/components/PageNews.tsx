"use client";

import React from "react";
import { motion } from "motion/react";
import { Badge, fadeUp, pageIn, SectionHeader } from "./dashboard/UI";

export default function PageNews() {
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
        {[
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
        ].map((item, i) => (
          <motion.div
            key={i}
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
    </motion.div>
  );
}
