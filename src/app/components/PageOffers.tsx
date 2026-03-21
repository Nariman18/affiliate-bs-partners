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
  Eye,
  MoreVertical,
  Link as LinkIcon,
  Copy,
  Edit2,
  PauseCircle,
  PlayCircle,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
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
} from "../hooks/useDashboard";
import { ROLES, type AppRole } from "../lib/api";
import { toast } from "sonner";
import { CATEGORIES, COUNTRIES } from "../lib/utils";

// Helper function for quick API calls missing from hooks
const getHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── Image Upload Component ───────────────────────────────────────────────────
function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    setIsUploading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/offers/upload-url`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        },
      );
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, publicUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload image");

      onChange(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
        Logo Image
      </label>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full h-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
          isDragging
            ? "border-amber-400 bg-amber-400/5"
            : value
              ? "border-white/10 bg-zinc-800/40 hover:border-white/20"
              : "border-white/10 bg-zinc-800/60 hover:border-white/20 hover:bg-zinc-800"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
          accept="image/*"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-amber-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Uploading...</span>
          </div>
        ) : value ? (
          <>
            <img
              src={value}
              alt="Logo preview"
              className="w-full h-full object-contain p-2"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5" /> Change Image
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-zinc-400">
            <ImageIcon className="w-5 h-5 mb-0.5 text-zinc-500" />
            <span className="text-sm font-medium">Click or drag & drop</span>
            <span className="text-[10px] text-zinc-500">
              PNG, JPG up to 5MB
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

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

  return (
    <div className="relative" ref={ref}>
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
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 top-8 z-20 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl min-w-[160px] py-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Custom Form Select ───────────────────────────────────────────────────────
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
    <div className="relative" ref={ref}>
      {label && (
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-white/8 bg-zinc-800 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
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

// ─── Action Menu Dropdown (Uses Portal to avoid clipping) ─────────────────────
function ActionMenu({
  offer,
  role,
  onView,
  onEdit,
  onRefresh,
}: {
  offer: any;
  role: AppRole;
  onView: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const requestOffer = useRequestOffer();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      setRect(btnRef.current.getBoundingClientRect());
    }
    setOpen((o) => !o);
  };

  const isAdmin = role === ROLES.ADMIN;

  const handleCopy = (e: React.MouseEvent, type: "link" | "id") => {
    e.stopPropagation();
    setOpen(false);
    if (type === "id") {
      navigator.clipboard.writeText(offer.id);
      toast.success("Offer ID copied to clipboard");
    } else {
      if (offer.casinoUrl) {
        navigator.clipboard.writeText(offer.casinoUrl);
        toast.success("Base Casino URL copied");
      } else {
        toast.info("Navigate to Offer Details to copy specific tracking links");
      }
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    const newStatus = offer.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/offers/${offer.id}`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        toast.success(`Offer marked as ${newStatus}`);
        onRefresh();
      } else throw new Error();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/offers/${offer.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );
      if (res.ok) {
        toast.success("Offer deleted successfully");
        onRefresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete offer");
      }
    } catch {
      toast.error("Failed to delete offer");
    }
  };

  // Check if there is enough space below the button to render the menu.
  // If less than 300px of space, we render it ABOVE the button.
  const placeAbove = rect ? window.innerHeight - rect.bottom < 300 : false;

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggleMenu}
        className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open &&
        rect &&
        createPortal(
          <motion.div
            ref={menuRef}
            // Animate upwards if placeAbove is true, using Y translations
            initial={{
              opacity: 0,
              scale: 0.95,
              y: placeAbove ? "-100%" : 0,
              transformOrigin: placeAbove ? "bottom right" : "top right",
            }}
            animate={{ opacity: 1, scale: 1, y: placeAbove ? "-100%" : 0 }}
            exit={{ opacity: 0, scale: 0.95, y: placeAbove ? "-100%" : 0 }}
            transition={{ duration: 0.1 }}
            style={{
              position: "absolute",
              // If above, place top exactly 4px above the button. If below, place exactly 4px below.
              top: placeAbove
                ? rect.top + window.scrollY - 4
                : rect.bottom + window.scrollY + 4,
              left: rect.right - 192 + window.scrollX, // 192px = w-48
              zIndex: 9999,
            }}
            className="w-48 rounded-xl border border-white/10 bg-zinc-900 shadow-xl py-1"
          >
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Actions
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> View Details
            </button>

            {role === ROLES.MANAGER && !offer.myRequestStatus && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  requestOffer.mutate(offer.id);
                  setOpen(false);
                }}
                disabled={requestOffer.isPending}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-amber-400/10 transition-colors disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> Request Access
              </button>
            )}

            {(offer.myRequestStatus === "APPROVED" ||
              isAdmin ||
              role === ROLES.BASIC) && (
              <>
                <button
                  onClick={(e) => handleCopy(e, "link")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Copy Link
                </button>

                <button
                  onClick={(e) => handleCopy(e, "id")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Offer ID
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <div className="my-1 border-t border-white/5" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Offer
                </button>
                <button
                  onClick={handleToggleStatus}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                    offer.status === "ACTIVE"
                      ? "text-rose-400 hover:bg-rose-400/10"
                      : "text-emerald-400 hover:bg-emerald-400/10"
                  }`}
                >
                  {offer.status === "ACTIVE" ? (
                    <>
                      <PauseCircle className="w-3.5 h-3.5" /> Pause Offer
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3.5 h-3.5" /> Activate Offer
                    </>
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Offer
                </button>
              </>
            )}
          </motion.div>,
          document.body,
        )}
    </>
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
    minDeposit: "", // Maps to FTD
    regPayout: "", // Maps to REG
    logoUrl: "",
    isVisible: true,
    isNew: false,
    isTop: false,
    isExclusive: false,
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.casinoUrl.trim()) return;
    createOffer.mutate(
      {
        ...form,
        commissionPct: Number(form.commissionPct),
        minDeposit: form.minDeposit ? Number(form.minDeposit) : undefined,
        regPayout: form.regPayout ? Number(form.regPayout) : undefined,
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

        <ImageUpload
          value={form.logoUrl}
          onChange={(url) => set("logoUrl", url)}
        />

        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
            Description
          </label>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Offer details…"
            className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-amber-400/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 z-10">
          <FormSelect
            label="Category"
            value={form.category}
            onChange={(v) => set("category", v)}
            options={CATEGORIES.filter((c) => c !== "All").map((c) => ({
              value: c,
              label: c,
            }))}
          />

          <FormSelect
            label="Target Country"
            value={form.targetCountry}
            onChange={(v) => set("targetCountry", v)}
            options={[
              { value: "", label: "🌍 Global" },
              ...COUNTRIES.map((c) => ({
                value: c.code,
                label: `${c.flag} ${c.name}`,
              })),
            ]}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
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
              FTD $
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
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
              REG $
            </label>
            <input
              type="number"
              min="0"
              value={form.regPayout}
              onChange={(e) => set("regPayout", e.target.value)}
              placeholder="optional"
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

// ─── Edit Offer Modal (Admin only) ───────────────────────────────────────────
function EditOfferModal({
  offer,
  onClose,
  onRefresh,
}: {
  offer: any;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [form, setForm] = useState({
    name: offer.name || "",
    category: offer.category || "Facebook",
    description: offer.description || "",
    casinoUrl: offer.casinoUrl || "",
    targetCountry: offer.targetCountry || "",
    commissionPct: offer.commissionPct?.toString() || "10",
    minDeposit: offer.minDeposit?.toString() || "",
    regPayout: offer.regPayout?.toString() || "",
    logoUrl: offer.logoUrl || "",
    isVisible: offer.isVisible ?? true,
    isNew: offer.isNew ?? false,
    isTop: offer.isTop ?? false,
    isExclusive: offer.isExclusive ?? false,
  });
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.casinoUrl.trim()) return;
    setIsPending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "/api"}/offers/${offer.id}`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({
            ...form,
            commissionPct: Number(form.commissionPct),
            minDeposit: form.minDeposit ? Number(form.minDeposit) : null,
            regPayout: form.regPayout ? Number(form.regPayout) : null,
          }),
        },
      );
      if (res.ok) {
        toast.success("Offer updated");
        onRefresh();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update offer");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-black text-white">Edit Offer</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        {[
          { label: "Offer Name *", key: "name" },
          { label: "Casino URL *", key: "casinoUrl" },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
              {label}
            </label>
            <input
              value={(form as any)[key]}
              onChange={(e) => set(key, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
            />
          </div>
        ))}

        <ImageUpload
          value={form.logoUrl}
          onChange={(url) => set("logoUrl", url)}
        />

        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
            Description
          </label>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 z-10">
          <FormSelect
            label="Category"
            value={form.category}
            onChange={(v) => set("category", v)}
            options={CATEGORIES.filter((c) => c !== "All").map((c) => ({
              value: c,
              label: c,
            }))}
          />
          <FormSelect
            label="Target Country"
            value={form.targetCountry}
            onChange={(v) => set("targetCountry", v)}
            options={[
              { value: "", label: "🌍 Global" },
              ...COUNTRIES.map((c) => ({
                value: c.code,
                label: `${c.flag} ${c.name}`,
              })),
            ]}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
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
              FTD $
            </label>
            <input
              type="number"
              min="0"
              value={form.minDeposit}
              onChange={(e) => set("minDeposit", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
              REG $
            </label>
            <input
              type="number"
              min="0"
              value={form.regPayout}
              onChange={(e) => set("regPayout", e.target.value)}
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
          className="px-4 py-2 rounded-xl border border-white/10 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <AmberBtn
          onClick={handleSubmit}
          disabled={!form.name.trim() || !form.casinoUrl.trim() || isPending}
        >
          <Edit2 className="w-3.5 h-3.5" />
          {isPending ? "Saving…" : "Save Changes"}
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
  const [checkStar, setCheckStar] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [countryQ, setCountryQ] = useState("");

  const {
    data: offers = [],
    isLoading,
    refetch,
  } = useOffers({
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

    // Apply Markups and Star Filtering
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
        {/* ADDED flex-wrap here so the filters don't squish out of bounds on mobile */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search offers…"
              className="w-full sm:w-48 pl-8 pr-3 py-1.5 bg-zinc-800/60 border border-white/8 rounded-lg text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40"
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

          {/* Checkboxes for Filters and Star */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 sm:ml-2 text-xs text-zinc-500">
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
            ).map(([label, val, setFn], idx) => (
              <label
                key={idx}
                className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-300"
              >
                <input
                  type="checkbox"
                  checked={val as boolean}
                  onChange={(e) => (setFn as any)(e.target.checked)}
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
        </div>

        <span className="ml-auto text-xs text-zinc-600 hidden sm:block whitespace-nowrap pl-4">
          {filtered.length} results
        </span>
      </FilterBar>

      {/* Table */}
      <TableWrapper>
        <thead>
          <tr>
            <Th> </Th>
            <Th>Offer</Th>
            <Th className="hidden sm:table-cell">Category</Th>
            <Th className="hidden md:table-cell">GEO</Th>
            <Th>Payout</Th>
            <Th>Status</Th>
            <Th className="text-right">Action</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : filtered.length === 0 ? (
            <EmptyState
              colSpan={7}
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
                  className="hover:bg-white/2 transition-colors cursor-pointer group relative"
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
                      {/* Logo */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-white/8 flex-shrink-0">
                        {offer.logoUrl ? (
                          <img
                            src={offer.logoUrl}
                            onClick={() => onSelectOffer(offer.id)}
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
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectOffer(offer.id);
                          }}
                          className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors text-left leading-tight cursor-pointer mt-0.5"
                        >
                          {offer.name}
                        </button>
                      </div>
                    </div>
                  </Td>
                  <Td className="hidden sm:table-cell">
                    <Badge variant="blue">{offer.category}</Badge>
                  </Td>
                  <Td className="hidden md:table-cell">
                    {countryInfo ? (
                      <span className="text-xs text-zinc-300 flex items-center gap-1.5">
                        <span className="text-base">{countryInfo.flag}</span>{" "}
                        {countryInfo.name}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">Global</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase w-6">
                          FTD
                        </span>
                        <span className="text-emerald-400 text-xs font-semibold">
                          {offer.minDeposit
                            ? fmt.usd(offer.minDeposit)
                            : "$0.00"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase w-6">
                          REG
                        </span>
                        <span className="text-zinc-300 text-xs font-semibold">
                          {offer.regPayout ? fmt.usd(offer.regPayout) : "$0.00"}
                        </span>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    {offer.myRequestStatus === "PENDING" ? (
                      <Badge variant="yellow">Requested</Badge>
                    ) : offer.myRequestStatus === "APPROVED" ? (
                      <Badge variant="green">Approved</Badge>
                    ) : offer.myRequestStatus === "REJECTED" ? (
                      <Badge variant="red">Rejected</Badge>
                    ) : !offer.myRequestStatus && role === ROLES.MANAGER ? (
                      <Badge variant="default">Locked</Badge>
                    ) : offer.status === "ACTIVE" ? (
                      <Badge variant="green">Active</Badge>
                    ) : (
                      <Badge variant="default">{offer.status}</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <ActionMenu
                      offer={offer}
                      role={role}
                      onView={() => onSelectOffer(offer.id)}
                      onEdit={() => setEditingOffer(offer)}
                      onRefresh={refetch}
                    />
                  </Td>
                </tr>
              );
            })
          )}
        </tbody>
      </TableWrapper>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateOfferModal onClose={() => setShowCreate(false)} />
        )}
        {editingOffer && (
          <EditOfferModal
            offer={editingOffer}
            onClose={() => setEditingOffer(null)}
            onRefresh={refetch}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
