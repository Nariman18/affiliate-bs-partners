"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Globe,
  ChevronDown,
  Lock,
  Star,
  X,
  Plus,
  Eye,
  BarChart3,
  CheckCircle2,
  MousePointer2,
} from "lucide-react";
import {
  Badge,
  TabBar,
  TableWrapper,
  Th,
  Td,
  EmptyState,
  TableSkeleton,
  AmberBtn,
  OutlineBtn,
  Modal,
  FilterBar,
  pageIn,
  SectionHeader,
  stagger,
  fadeUp,
  fmt,
} from "./dashboard/UI";
import {
  useOffers,
  useRequestOffer,
  useCreateOffer,
} from "../hooks/useDashboard";
import { ROLES, type AppRole } from "../lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
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

// ─── Dropdown wrapper ─────────────────────────────────────────────────────────
function DropBtn({
  label,
  children,
  icon,
}: {
  label: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 bg-zinc-800/40 text-xs font-semibold text-zinc-400 hover:border-white/20 hover:text-white transition-all"
      >
        {icon}
        {label}
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
              className="absolute left-0 top-8 z-20 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl min-w-[160px] py-1"
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Create Offer Modal (Admin only) ─────────────────────────────────────────
function CreateOfferModal({ onClose }: { onClose: () => void }) {
  const createOffer = useCreateOffer();
  const [form, setForm] = useState({
    name: "",
    category: "Facebook",
    description: "",
    casinoUrl: "",
    targetCountry: "",
    commissionPct: "10",
    minDeposit: "",
    logoUrl: "",
    isVisible: true,
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.casinoUrl.trim()) return;
    createOffer.mutate(
      {
        ...form,
        commissionPct: Number(form.commissionPct),
        minDeposit: form.minDeposit ? Number(form.minDeposit) : undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-black text-white">Create New Offer</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        {[
          {
            label: "Offer Name *",
            key: "name",
            placeholder: "e.g. Mostbet – PL March 2025",
          },
          {
            label: "Casino URL *",
            key: "casinoUrl",
            placeholder: "https://casino.com/lp",
          },
          {
            label: "Logo URL",
            key: "logoUrl",
            placeholder: "https://storage.googleapis.com/…",
          },
          {
            label: "Description",
            key: "description",
            placeholder: "Offer details…",
          },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
              {label}
            </label>
            <input
              value={(form as any)[key]}
              onChange={(e) => set(key, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-amber-400/40"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
            >
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
              Target Country
            </label>
            <select
              value={form.targetCountry}
              onChange={(e) => set("targetCountry", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
            >
              <option value="">Global</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
              Commission %
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.commissionPct}
              onChange={(e) => set("commissionPct", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
              Min Deposit $
            </label>
            <input
              type="number"
              min="0"
              value={form.minDeposit}
              onChange={(e) => set("minDeposit", e.target.value)}
              placeholder="optional"
              className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => set("isVisible", e.target.checked)}
              className="accent-amber-400 w-3.5 h-3.5"
            />
            <span className="text-xs text-zinc-400">Visible to managers</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-5">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <AmberBtn
          onClick={handleSubmit}
          disabled={
            !form.name.trim() || !form.casinoUrl.trim() || createOffer.isPending
          }
        >
          <Plus className="w-3.5 h-3.5" />
          {createOffer.isPending ? "Creating…" : "Create Offer"}
        </AmberBtn>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  role: AppRole;
  onSelectOffer: (id: string) => void;
}

export default function PageOffers({ role, onSelectOffer }: Props) {
  const [tab, setTab] = useState("All Offers");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [country, setCountry] = useState("");
  const [avail, setAvail] = useState<"" | "available" | "approval">("");
  const [checkNew, setCheckNew] = useState(false);
  const [checkTop, setCheckTop] = useState(false);
  const [checkExcl, setCheckExcl] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [countryQ, setCountryQ] = useState("");

  const { data: offers = [], isLoading } = useOffers({
    category: category !== "All" ? category : undefined,
    country: country || undefined,
  });
  const requestOffer = useRequestOffer();

  const filtered = useMemo(() => {
    let list = offers as any[];

    if (search)
      list = list.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase()),
      );

    if (tab === "My Offers") list = list.filter((o) => !!o.myRequestStatus);

    if (avail === "available")
      list = list.filter(
        (o) => !o.myRequestStatus || o.myRequestStatus === "APPROVED",
      );
    else if (avail === "approval")
      list = list.filter(
        (o) => !o.myRequestStatus || o.myRequestStatus !== "APPROVED",
      );

    return list;
  }, [offers, search, tab, avail]);

  const countryResults = useMemo(
    () =>
      COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(countryQ.toLowerCase()),
      ),
    [countryQ],
  );

  const isAdmin = role === ROLES.ADMIN;

  return (
    <motion.div
      key="offers"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <SectionHeader
          title="Offers"
          sub={`${filtered.length} offer${filtered.length !== 1 ? "s" : ""}`}
        />
        {isAdmin && (
          <AmberBtn onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5" /> Create Offer
          </AmberBtn>
        )}
      </div>

      {/* Tabs */}
      <TabBar
        tabs={["All Offers", "My Offers"]}
        active={tab}
        onChange={setTab}
      />

      {/* Filter row */}
      <FilterBar>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offers…"
            className="pl-8 pr-3 py-1.5 bg-zinc-800/60 border border-white/8 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 w-48"
          />
        </div>

        {/* Availability */}
        <DropBtn
          label={
            avail === "available"
              ? "Available"
              : avail === "approval"
                ? "Requires Approval"
                : "Availability"
          }
        >
          {[
            ["", "All"],
            ["available", "Available"],
            ["approval", "Requires Approval"],
          ].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setAvail(val as any)}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${avail === val ? "text-amber-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
            >
              {lbl}
            </button>
          ))}
        </DropBtn>

        {/* Category */}
        <DropBtn label={category !== "All" ? category : "Category"}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${category === c ? "text-amber-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
            >
              {c}
            </button>
          ))}
        </DropBtn>

        {/* Country */}
        <DropBtn
          label={
            country
              ? (COUNTRIES.find((c) => c.code === country)?.name ?? country)
              : "Country"
          }
          icon={<Globe className="w-3 h-3" />}
        >
          <div className="px-2 pb-1">
            <input
              value={countryQ}
              onChange={(e) => setCountryQ(e.target.value)}
              placeholder="Search country…"
              className="w-full px-2 py-1 bg-zinc-800 border border-white/8 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-44 overflow-y-auto">
            <button
              onClick={() => setCountry("")}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${!country ? "text-amber-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
            >
              🌍 All Countries
            </button>
            {countryResults.map((c) => (
              <button
                key={c.code}
                onClick={() => setCountry(c.code)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${country === c.code ? "text-amber-400" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
              >
                <span>{c.flag}</span>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </DropBtn>

        {/* Checkboxes */}
        <div className="flex items-center gap-4 ml-2 text-xs text-zinc-500">
          {(
            [
              ["New", checkNew, setCheckNew],
              ["Top", checkTop, setCheckTop],
              ["Exclusive", checkExcl, setCheckExcl],
            ] as const
          ).map(([label, val, set]) => (
            <label
              key={label as string}
              className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-300"
            >
              <input
                type="checkbox"
                checked={val as boolean}
                onChange={(e) => (set as any)(e.target.checked)}
                className="accent-amber-400 w-3 h-3"
              />
              {label}
            </label>
          ))}
        </div>

        {(search || country || category !== "All" || avail) && (
          <button
            onClick={() => {
              setSearch("");
              setCountry("");
              setCategory("All");
              setAvail("");
            }}
            className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-rose-400 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}

        <span className="ml-auto text-xs text-zinc-600">
          {filtered.length} results
        </span>
      </FilterBar>

      {/* Table */}
      <TableWrapper>
        <thead>
          <tr>
            <Th> </Th>
            <Th>Offer</Th>
            <Th>Category</Th>
            <Th>Commission</Th>
            <Th>Min Deposit</Th>
            <Th>Geo</Th>
            <Th>Links</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={5} cols={9} />
          ) : filtered.length === 0 ? (
            <EmptyState
              colSpan={9}
              label="No offers match the current filters."
            />
          ) : (
            filtered.map((offer: any) => {
              const countryInfo = COUNTRIES.find(
                (c) => c.code === offer.targetCountry,
              );
              return (
                <tr
                  key={offer.id}
                  className="hover:bg-white/2 transition-colors cursor-pointer group"
                  onClick={() => onSelectOffer(offer.id)}
                >
                  <Td>
                    <Star className="w-3.5 h-3.5 text-zinc-700 hover:text-amber-400 cursor-pointer transition-colors" />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      {/* Logo */}
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-zinc-800 border border-white/8 flex-shrink-0">
                        {offer.logoUrl ? (
                          <img
                            src={offer.logoUrl}
                            alt={offer.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] font-black text-zinc-400">
                            {offer.name?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        {!offer.myRequestStatus && role === ROLES.MANAGER && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Lock className="w-3 h-3 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="px-1 py-0.5 rounded text-[9px] font-black bg-rose-500/70 text-white uppercase">
                            Top
                          </span>
                          {offer.status === "ACTIVE" && (
                            <Badge variant="green">Active</Badge>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOffer(offer.id);
                          }}
                          className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors text-left leading-tight"
                        >
                          {offer.name}
                        </button>
                      </div>
                    </div>
                  </Td>
                  <Td className="hidden sm:table-cell">
                    <Badge variant="blue">{offer.category}</Badge>
                  </Td>
                  <Td>
                    <span className="font-bold text-amber-400">
                      {fmt.pct(offer.commissionPct ?? 10)}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-zinc-400">
                      {offer.minDeposit ? fmt.usd(offer.minDeposit) : "—"}
                    </span>
                  </Td>
                  <Td className="hidden md:table-cell">
                    {countryInfo ? (
                      <span className="text-xs text-zinc-300">
                        {countryInfo.flag} {countryInfo.name}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">Global</span>
                    )}
                  </Td>
                  <Td>
                    <span className="text-zinc-400">
                      {offer._count?.links ?? 0}
                    </span>
                  </Td>
                  <Td>
                    {offer.myRequestStatus === "PENDING" && (
                      <Badge variant="yellow">Requested</Badge>
                    )}
                    {offer.myRequestStatus === "APPROVED" && (
                      <Badge variant="green">Approved</Badge>
                    )}
                    {offer.myRequestStatus === "REJECTED" && (
                      <Badge variant="red">Rejected</Badge>
                    )}
                    {!offer.myRequestStatus && role === ROLES.MANAGER && (
                      <Badge variant="default">Locked</Badge>
                    )}
                  </Td>
                  <Td>
                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {role === ROLES.MANAGER && !offer.myRequestStatus && (
                        <button
                          onClick={() => requestOffer.mutate(offer.id)}
                          disabled={requestOffer.isPending}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/25 text-amber-400 text-[11px] font-bold hover:bg-amber-400/25 transition-colors disabled:opacity-50"
                        >
                          Request
                        </button>
                      )}
                      {(role === ROLES.ADMIN || role === ROLES.BASIC) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOffer(offer.id);
                          }}
                          className="p-1.5 rounded-lg border border-white/8 text-zinc-500 hover:text-white transition-colors"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

      {/* Create offer modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateOfferModal onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
