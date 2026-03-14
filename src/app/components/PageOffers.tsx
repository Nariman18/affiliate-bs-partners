"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Globe,
  ChevronDown,
  Lock,
  Star,
  X,
  Plus,
  UploadCloud,
  MoreHorizontal,
  Eye,
  BarChart3,
  Activity,
  MousePointer2,
  Edit3,
  Trash2,
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
  Modal,
  FilterBar,
  pageIn,
  SectionHeader,
  fmt,
} from "./dashboard/UI";
import {
  useOffers,
  useRequestOffer,
  useCreateOffer,
  useToggleStarOffer,
  useUpdateOffer,
  useDeleteOffer,
} from "../hooks/useDashboard";
import { offersEndpoints, ROLES, type AppRole } from "../lib/api";
import { toast } from "sonner";

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

// ─── Helper Components ────────────────────────────────────────────────────────
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

function SettingsMenu({
  offer,
  role,
  onSelectOffer,
  onEditOffer,
  onDeleteOffer,
}: {
  offer: any;
  role: AppRole;
  onSelectOffer: (id: string) => void;
  onEditOffer: (offer: any) => void;
  onDeleteOffer: (offer: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const isAdmin = role === ROLES.ADMIN;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.right - 160 });
    }
    setOpen(!open);
  };

  useEffect(() => {
    if (!open) return;
    const handleClose = () => setOpen(false);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="p-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 text-zinc-500 hover:text-white transition-all focus:outline-none"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[99]"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              style={{ top: coords.top, left: coords.left }}
              className="fixed z-[100] w-40 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl py-1.5 flex flex-col overflow-hidden"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onSelectOffer(offer.id);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
              >
                <Eye className="w-3.5 h-3.5 text-zinc-400" /> Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  toast.info("Navigating to Reports");
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
              >
                <BarChart3 className="w-3.5 h-3.5 text-zinc-400" /> Reports
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  toast.info("Navigating to Conversions");
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
              >
                <Activity className="w-3.5 h-3.5 text-zinc-400" /> Conversions
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  toast.info("Navigating to Clicks");
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
              >
                <MousePointer2 className="w-3.5 h-3.5 text-zinc-400" /> Clicks
              </button>

              {isAdmin && (
                <>
                  <div className="h-px bg-white/10 my-1 mx-2" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(false);
                      onEditOffer(offer);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-sky-400" /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(false);
                      onDeleteOffer(offer);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-400/10 transition-colors w-full text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </>
              )}
            </motion.div>
          </>,
          document.body,
        )}
    </>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function CreateOfferModal({ onClose }: { onClose: () => void }) {
  const createOffer = useCreateOffer();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    category: "Facebook",
    description: "",
    casinoUrl: "",
    targetCountry: "",
    regPayout: "",
    minDeposit: "",
    logoUrl: "",
    isVisible: true,
    isNew: false,
    isTop: false,
    isExclusive: false,
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.casinoUrl.trim()) {
      toast.error("Please fill in both the Offer Name and Casino URL!");
      return;
    }
    let finalLogoUrl = form.logoUrl;
    if (logoFile) {
      setIsUploading(true);
      try {
        const { uploadUrl, publicUrl } = await offersEndpoints.getUploadUrl({
          filename: logoFile.name,
          contentType: logoFile.type,
        });
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": logoFile.type },
          body: logoFile,
        });
        if (!uploadResponse.ok)
          throw new Error(`Upload failed. Status: ${uploadResponse.status}`);
        finalLogoUrl = publicUrl;
      } catch (error) {
        toast.error("Upload failed! If you just set CORS, wait 5 minutes.");
        setIsUploading(false);
        return;
      }
    }
    createOffer.mutate(
      {
        ...form,
        regPayout: form.regPayout ? Number(form.regPayout) : 0,
        minDeposit: form.minDeposit ? Number(form.minDeposit) : undefined,
        logoUrl: finalLogoUrl,
      },
      { onSuccess: onClose, onSettled: () => setIsUploading(false) },
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

      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-6">
        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
            Offer Logo
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 rounded-xl border-2 border-dashed border-white/10 hover:border-amber-400/50 bg-zinc-800/40 flex items-center justify-center cursor-pointer overflow-hidden relative transition-colors"
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Preview"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center text-zinc-500">
                <UploadCloud className="w-6 h-6 mb-1 opacity-70" />
                <span className="text-xs font-semibold">
                  Click to upload logo
                </span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          {logoPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLogoPreview(null);
                setLogoFile(null);
              }}
              className="text-[10px] text-rose-400 mt-1 hover:underline"
            >
              Remove image
            </button>
          )}
        </div>

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
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
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

        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
            Offer Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Enter KPIs, rules, restrictions..."
            rows={4}
            className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-amber-400/40 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
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
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
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
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
              REG Payout $
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.regPayout}
              onChange={(e) => set("regPayout", e.target.value)}
              placeholder="e.g. 2.50"
              className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
              Deposit Payout $
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minDeposit}
              onChange={(e) => set("minDeposit", e.target.value)}
              placeholder="e.g. 25.00"
              className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => set("isVisible", e.target.checked)}
              className="accent-amber-400 w-3.5 h-3.5"
            />
            <span className="text-xs text-zinc-400">Visible to managers</span>
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => set("isNew", e.target.checked)}
                className="accent-amber-400 w-3.5 h-3.5"
              />
              <span className="text-xs text-blue-400 font-semibold">
                Mark as New
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isTop}
                onChange={(e) => set("isTop", e.target.checked)}
                className="accent-amber-400 w-3.5 h-3.5"
              />
              <span className="text-xs text-rose-400 font-semibold">
                Mark as Top
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isExclusive}
                onChange={(e) => set("isExclusive", e.target.checked)}
                className="accent-amber-400 w-3.5 h-3.5"
              />
              <span className="text-xs text-fuchsia-400 font-semibold">
                Mark as Exclusive
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-5">
        <button
          onClick={onClose}
          disabled={isUploading}
          className="px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <AmberBtn
          onClick={handleSubmit}
          disabled={!form.name.trim() || createOffer.isPending || isUploading}
        >
          {isUploading
            ? "Uploading Logo..."
            : createOffer.isPending
              ? "Creating…"
              : "Create Offer"}
        </AmberBtn>
      </div>
    </Modal>
  );
}

function EditOfferModal({
  offer,
  onClose,
}: {
  offer: any;
  onClose: () => void;
}) {
  const updateOffer = useUpdateOffer();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(offer.logoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: offer.name || "",
    category: offer.category || "Facebook",
    description: offer.description || "",
    casinoUrl: offer.casinoUrl || "",
    targetCountry: offer.targetCountry || "",
    regPayout: offer.regPayout?.toString() || "",
    minDeposit: offer.minDeposit?.toString() || "",
    logoUrl: offer.logoUrl || "",
    isVisible: offer.isVisible ?? true,
    isNew: offer.isNew ?? false,
    isTop: offer.isTop ?? false,
    isExclusive: offer.isExclusive ?? false,
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.casinoUrl.trim()) {
      toast.error("Please fill in both the Offer Name and Casino URL!");
      return;
    }

    let finalLogoUrl = form.logoUrl;

    if (logoFile) {
      setIsUploading(true);
      try {
        const { uploadUrl, publicUrl } = await offersEndpoints.getUploadUrl({
          filename: logoFile.name,
          contentType: logoFile.type,
        });
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": logoFile.type },
          body: logoFile,
        });
        if (!uploadResponse.ok)
          throw new Error(`Upload failed. Status: ${uploadResponse.status}`);
        finalLogoUrl = publicUrl;
      } catch (error) {
        toast.error("Upload failed! If you just set CORS, wait 5 minutes.");
        setIsUploading(false);
        return;
      }
    }

    updateOffer.mutate(
      {
        id: offer.id,
        ...form,
        regPayout: form.regPayout ? Number(form.regPayout) : 0,
        minDeposit: form.minDeposit ? Number(form.minDeposit) : null,
        logoUrl: finalLogoUrl,
      },
      { onSuccess: onClose, onSettled: () => setIsUploading(false) },
    );
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-black text-white">Edit Offer</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
            Offer Logo
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 rounded-xl border-2 border-dashed border-white/10 hover:border-amber-400/50 bg-zinc-800/40 flex items-center justify-center cursor-pointer overflow-hidden relative transition-colors"
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Preview"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center text-zinc-500">
                <UploadCloud className="w-6 h-6 mb-1 opacity-70" />
                <span className="text-xs font-semibold">
                  Click to upload logo
                </span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          {logoPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLogoPreview(null);
                setLogoFile(null);
                set("logoUrl", "");
              }}
              className="text-[10px] text-rose-400 mt-1 hover:underline"
            >
              Remove image
            </button>
          )}
        </div>

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

        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
            Offer Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Enter KPIs, rules, restrictions..."
            rows={4}
            className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-amber-400/40 resize-none"
          />
        </div>

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
              REG Payout $
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.regPayout}
              onChange={(e) => set("regPayout", e.target.value)}
              placeholder="e.g. 2.50"
              className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
              Deposit Payout $
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minDeposit}
              onChange={(e) => set("minDeposit", e.target.value)}
              placeholder="e.g. 25.00"
              className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => set("isVisible", e.target.checked)}
              className="accent-amber-400 w-3.5 h-3.5"
            />
            <span className="text-xs text-zinc-400">Visible to managers</span>
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => set("isNew", e.target.checked)}
                className="accent-amber-400 w-3.5 h-3.5"
              />
              <span className="text-xs text-blue-400 font-semibold">
                Mark as New
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isTop}
                onChange={(e) => set("isTop", e.target.checked)}
                className="accent-amber-400 w-3.5 h-3.5"
              />
              <span className="text-xs text-rose-400 font-semibold">
                Mark as Top
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isExclusive}
                onChange={(e) => set("isExclusive", e.target.checked)}
                className="accent-amber-400 w-3.5 h-3.5"
              />
              <span className="text-xs text-fuchsia-400 font-semibold">
                Mark as Exclusive
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-5">
        <button
          onClick={onClose}
          disabled={updateOffer.isPending || isUploading}
          className="px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <AmberBtn
          onClick={handleSubmit}
          disabled={!form.name.trim() || updateOffer.isPending || isUploading}
        >
          {isUploading
            ? "Uploading Logo..."
            : updateOffer.isPending
              ? "Saving…"
              : "Save Changes"}
        </AmberBtn>
      </div>
    </Modal>
  );
}

function DeleteOfferModal({
  offer,
  onClose,
}: {
  offer: any;
  onClose: () => void;
}) {
  const deleteOffer = useDeleteOffer();

  const handleDelete = () => {
    deleteOffer.mutate(offer.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-black text-white">Delete Offer</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
        Are you sure you want to delete{" "}
        <span className="font-bold text-white">{offer.name}</span>? This action
        cannot be undone.
      </p>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          disabled={deleteOffer.isPending}
          className="px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteOffer.isPending}
          className="flex items-center justify-center font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors rounded-xl px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleteOffer.isPending ? "Deleting..." : "Delete Offer"}
        </button>
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

  // Filters
  const [checkNew, setCheckNew] = useState(false);
  const [checkTop, setCheckTop] = useState(false);
  const [checkExcl, setCheckExcl] = useState(false);
  const [checkStar, setCheckStar] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [offerToEdit, setOfferToEdit] = useState<any>(null);
  const [offerToDelete, setOfferToDelete] = useState<any>(null);
  const [countryQ, setCountryQ] = useState("");

  const { data: offers = [], isLoading } = useOffers({
    category: category !== "All" ? category : undefined,
    country: country || undefined,
  });
  const requestOffer = useRequestOffer();
  const toggleStar = useToggleStarOffer();

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

    if (checkNew) list = list.filter((o) => o.isNew);
    if (checkTop) list = list.filter((o) => o.isTop);
    if (checkExcl) list = list.filter((o) => o.isExclusive);
    if (checkStar) list = list.filter((o) => o.isStarred);

    return list;
  }, [offers, search, tab, avail, checkNew, checkTop, checkExcl, checkStar]);

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
      <div className="flex items-center justify-between mb-6">
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

      <TabBar
        tabs={["All Offers", "My Offers"]}
        active={tab}
        onChange={setTab}
      />

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

        {/* Availability & Category */}
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
              className="w-full px-2 py-1 bg-zinc-800 border border-white/8 rounded-lg text-xs text-zinc-300 focus:outline-none"
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
              [
                <Star
                  key="star-icon"
                  className={`w-3.5 h-3.5 cursor-pointer transition-colors ${checkStar ? "text-amber-400 fill-amber-400" : "text-zinc-500"}`}
                />,
                checkStar,
                setCheckStar,
              ],
            ] as const
          ).map(([label, val, set], idx) => (
            <label
              key={idx}
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

        {(search ||
          country ||
          category !== "All" ||
          avail ||
          checkNew ||
          checkTop ||
          checkExcl ||
          checkStar) && (
          <button
            onClick={() => {
              setSearch("");
              setCountry("");
              setCategory("All");
              setAvail("");
              setCheckNew(false);
              setCheckTop(false);
              setCheckExcl(false);
              setCheckStar(false);
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

      <TableWrapper>
        <thead>
          <tr>
            <Th>{""}</Th>
            <Th>Offer</Th>
            <Th>Category</Th>
            <Th>Payout</Th>
            <Th>Metrics</Th>
            <Th>Geo</Th>
            <Th>Actions</Th>
            <Th>{""}</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={5} cols={8} />
          ) : filtered.length === 0 ? (
            <EmptyState
              colSpan={8}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar.mutate(offer.id);
                      }}
                      className="focus:outline-none p-1 rounded-md hover:bg-white/5"
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${offer.isStarred ? "text-amber-400 fill-amber-400" : "text-zinc-700 hover:text-amber-400/50"}`}
                      />
                    </button>
                  </Td>

                  <Td>
                    <div className="flex items-center gap-3 min-w-[200px]">
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
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          {offer.isTop && (
                            <span className="px-1 py-0.5 rounded text-[9px] font-black bg-rose-500/70 text-white uppercase tracking-wider">
                              Top
                            </span>
                          )}
                          {offer.isExclusive && (
                            <span className="px-1 py-0.5 rounded text-[9px] font-black bg-fuchsia-500/70 text-white uppercase tracking-wider">
                              Exclusive
                            </span>
                          )}
                          {offer.isNew && (
                            <span className="px-1 py-0.5 rounded text-[9px] font-black bg-blue-500/70 text-white uppercase tracking-wider">
                              New
                            </span>
                          )}
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

                  <Td>
                    <Badge variant="blue">{offer.category}</Badge>
                  </Td>

                  <Td>
                    <div className="flex flex-col gap-0.5 text-[11px] font-mono whitespace-nowrap">
                      <span className="text-zinc-400">
                        REG:{" "}
                        <span className="font-bold text-white">
                          {fmt.usd(offer.regPayout ?? 0)}
                        </span>
                      </span>
                      <span className="text-zinc-500">
                        DEP:{" "}
                        <span className="font-bold text-emerald-400">
                          {offer.minDeposit ? fmt.usd(offer.minDeposit) : "—"}
                        </span>
                      </span>
                    </div>
                  </Td>

                  <Td>
                    <div className="flex flex-col gap-0.5 text-[10px] font-mono whitespace-nowrap text-zinc-500 uppercase tracking-widest">
                      <span>
                        EPC:{" "}
                        <span className="text-zinc-300 font-bold">
                          {offer.epc ? fmt.usd(offer.epc) : "$0.00"}
                        </span>
                      </span>
                      <span>
                        CR:{" "}
                        <span className="text-zinc-300 font-bold">
                          {offer.cr ? `${offer.cr}%` : "0.00%"}
                        </span>
                      </span>
                      <span>
                        AR:{" "}
                        <span className="text-zinc-300 font-bold">
                          {offer.ar ? `${offer.ar}%` : "0.00%"}
                        </span>
                      </span>
                    </div>
                  </Td>

                  <Td>
                    {countryInfo ? (
                      <span className="text-xs text-zinc-300">
                        {countryInfo.flag} {countryInfo.name}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">Global</span>
                    )}
                  </Td>

                  <Td>
                    <div
                      className="flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {role === ROLES.MANAGER ? (
                        !offer.myRequestStatus ? (
                          <AmberBtn
                            onClick={() => requestOffer.mutate(offer.id)}
                            disabled={requestOffer.isPending}
                            small
                          >
                            {requestOffer.isPending
                              ? "Requesting..."
                              : "Request"}
                          </AmberBtn>
                        ) : offer.myRequestStatus === "PENDING" ? (
                          <span className="text-[11px] font-semibold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-md">
                            Pending
                          </span>
                        ) : offer.myRequestStatus === "APPROVED" ? (
                          <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
                            Approved
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-md">
                            Rejected
                          </span>
                        )
                      ) : (
                        <div className="w-16 h-6"></div>
                      )}
                    </div>
                  </Td>

                  <Td>
                    <SettingsMenu
                      offer={offer}
                      role={role}
                      onSelectOffer={onSelectOffer}
                      onEditOffer={(o) => setOfferToEdit(o)}
                      onDeleteOffer={(o) => setOfferToDelete(o)}
                    />
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </TableWrapper>

      <AnimatePresence>
        {showCreate && (
          <CreateOfferModal onClose={() => setShowCreate(false)} />
        )}
        {offerToEdit && (
          <EditOfferModal
            offer={offerToEdit}
            onClose={() => setOfferToEdit(null)}
          />
        )}
        {offerToDelete && (
          <DeleteOfferModal
            offer={offerToDelete}
            onClose={() => setOfferToDelete(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
