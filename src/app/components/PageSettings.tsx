"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Shield,
  Send,
  ExternalLink,
  CheckCircle2,
  UploadCloud,
  X,
  Code2,
} from "lucide-react";
import { AmberBtn, pageIn, SectionHeader, Spinner } from "./dashboard/UI";
import {
  useChangePassword,
  useMe,
  useUpdateProfile,
} from "../hooks/useDashboard";
import { authEndpoints } from "../lib/api";
import { toast } from "sonner";

export default function PageSettings() {
  const [subTab, setSubTab] = useState("Personal Preferences");
  const { data: me, isLoading } = useMe();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [displayName, setDisplayName] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [postbackUrl, setPostbackUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // Pre-fill existing data when 'me' loads
  useEffect(() => {
    if (me) {
      if ((me as any).postbackUrl) {
        setPostbackUrl((me as any).postbackUrl);
      }
    }
  }, [me]);

  if (isLoading) return <Spinner />;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setIsUploadingAvatar(true);
    try {
      const { uploadUrl, publicUrl } = await authEndpoints.avatarUploadUrl({
        filename: avatarFile.name,
        contentType: avatarFile.type,
      });
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": avatarFile.type },
        body: avatarFile,
      });
      if (!res.ok) throw new Error("Upload failed");
      updateProfile.mutate({ avatarUrl: publicUrl });
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch {
      toast.error("Avatar upload failed.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = () => {
    const payload: any = {};
    if (displayName.trim()) payload.displayName = displayName.trim();
    if (telegramHandle.trim()) payload.telegramHandle = telegramHandle.trim();
    if (!Object.keys(payload).length) return;
    updateProfile.mutate(payload, {
      onSuccess: () => {
        setDisplayName("");
        setTelegramHandle("");
      },
    });
  };

  const handleSavePostback = () => {
    updateProfile.mutate({ postbackUrl: postbackUrl.trim() });
  };

  const handleChangePassword = () => {
    if (newPw !== confirmPw) {
      toast.error("Passwords don't match.");
      return;
    }
    if (newPw.length < 8) {
      toast.error("Minimum 8 characters.");
      return;
    }
    changePassword.mutate(
      { currentPassword: currentPw, newPassword: newPw },
      {
        onSuccess: () => {
          setCurrentPw("");
          setNewPw("");
          setConfirmPw("");
        },
      },
    );
  };

  const currentAvatar = avatarPreview ?? (me as any)?.avatarUrl ?? null;
  const initials = (me?.displayName ?? me?.email ?? "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      key="settings"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <SectionHeader title="Profile & Settings" />
      <div className="grid md:grid-cols-[200px_1fr] gap-4 md:gap-6">
        {/* Sub-nav */}
        <div className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0">
          {[
            "Personal Preferences",
            "Billing Details",
            "Global Postbacks",
            "Security",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setSubTab(item)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${subTab === item ? "bg-amber-400/15 text-amber-400 border border-amber-400/20" : "text-zinc-500 hover:text-white hover:bg-white/4"}`}
            >
              {item === "Global Postbacks" && (
                <Send className="w-3.5 h-3.5 inline-block mr-2 -mt-0.5" />
              )}
              {item}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="rounded-2xl border border-white/6 bg-zinc-900/60 p-4 sm:p-7">
          {/* ── Personal Preferences ── */}
          {subTab === "Personal Preferences" && (
            <div>
              <h3 className="text-lg font-black text-white mb-6">
                Personal Preferences
              </h3>

              {/* Avatar upload */}
              <div className="flex items-start gap-3 sm:gap-5 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-white/5">
                <div className="relative flex-shrink-0">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-dashed border-white/10 hover:border-amber-400/50 flex items-center justify-center overflow-hidden cursor-pointer transition-colors group relative"
                  >
                    {currentAvatar ? (
                      <img
                        src={currentAvatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-black text-zinc-400 group-hover:text-amber-400 transition-colors">
                        {initials}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                      <UploadCloud className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-1">
                    Profile Photo
                  </p>
                  <p className="text-xs text-zinc-500 mb-3">
                    Click avatar to upload. PNG, JPG or WebP up to 5MB.
                  </p>
                  <div className="flex items-center gap-2">
                    <AmberBtn
                      onClick={handleSaveAvatar}
                      disabled={
                        !avatarFile ||
                        isUploadingAvatar ||
                        updateProfile.isPending
                      }
                      small
                    >
                      {isUploadingAvatar ? "Uploading…" : "Save Photo"}
                    </AmberBtn>
                    {avatarFile && (
                      <button
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                        }}
                        className="text-xs text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Read-only info */}
              <div className="space-y-0 mb-6">
                {[
                  { label: "Username", value: me?.username ?? "—" },
                  { label: "Email", value: me?.email ?? "—" },
                  { label: "Role", value: me?.role ?? "—" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3.5 border-b border-white/5"
                  >
                    <span className="text-sm text-zinc-500 w-36">{label}</span>
                    <span className="flex-1 text-sm text-zinc-300 font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Editable fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5 block">
                    Display Name
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={me?.displayName ?? "Your display name"}
                    className="w-full px-3 py-2.5 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5 block">
                    Telegram Handle
                  </label>
                  <input
                    value={telegramHandle}
                    onChange={(e) => setTelegramHandle(e.target.value)}
                    placeholder={
                      (me as any)?.telegramHandle ?? "@your_telegram"
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                  />
                </div>
                <AmberBtn
                  onClick={handleSaveProfile}
                  disabled={
                    updateProfile.isPending ||
                    (!displayName.trim() && !telegramHandle.trim())
                  }
                >
                  {updateProfile.isPending ? "Saving…" : "Save Changes"}
                </AmberBtn>
              </div>
            </div>
          )}

          {/* ── Billing Details ── */}
          {subTab === "Billing Details" && (
            <div>
              <h3 className="text-lg font-black text-white mb-6">
                Billing Details
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Email", value: me?.email ?? "" },
                  { label: "Payment Terms", value: "None" },
                  {
                    label: "Invoice Generation",
                    value: "By Affiliate Request",
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                      {label}
                    </label>
                    <input
                      defaultValue={value}
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                    />
                  </div>
                ))}
                <AmberBtn>Save Changes</AmberBtn>
              </div>
            </div>
          )}

          {/* ── Global Postbacks ── */}
          {subTab === "Global Postbacks" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">
                  S2S Global Postback
                </h3>
              </div>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                Configure your global Server-to-Server (S2S) postback URL to
                receive real-time conversion data directly into your external
                tracker (Keitaro, Binom, Voluum, etc).
              </p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5 block">
                    Postback URL
                  </label>
                  <input
                    value={postbackUrl}
                    onChange={(e) => setPostbackUrl(e.target.value)}
                    placeholder="https://your-tracker.com/postback?cid={click_id}&payout={payout}"
                    className="w-full px-4 py-3 rounded-xl border border-white/8 bg-zinc-900 font-mono text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                  />
                </div>

                <div className="p-5 rounded-xl border border-white/5 bg-black/40">
                  <div className="flex items-center gap-2 mb-4">
                    <Code2 className="w-4 h-4 text-zinc-500" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">
                      Available Macros
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      {
                        macro: "{click_id}",
                        desc: "Unique BadCat click identifier",
                      },
                      {
                        macro: "{sub_id}",
                        desc: "Your custom Sub ID passed in tracking link",
                      },
                      { macro: "{payout}", desc: "Your commission amount" },
                      {
                        macro: "{currency}",
                        desc: "Payout currency (e.g., USD)",
                      },
                      {
                        macro: "{status}",
                        desc: "Conversion status (e.g., PENDING)",
                      },
                    ].map(({ macro, desc }) => (
                      <div
                        key={macro}
                        className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 border-b border-white/5 pb-2"
                      >
                        <span className="font-mono text-xs text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0">
                          {macro}
                        </span>
                        <span className="text-xs text-zinc-500">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <AmberBtn
                  onClick={handleSavePostback}
                  disabled={updateProfile.isPending}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {updateProfile.isPending ? "Saving…" : "Save Postback URL"}
                </AmberBtn>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {subTab === "Security" && (
            <div>
              <h3 className="text-lg font-black text-white mb-6">Security</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">
                      Account is secure
                    </p>
                    <p className="text-xs text-zinc-500">
                      Signed in as {me?.email}
                    </p>
                  </div>
                </div>
                {[
                  {
                    label: "Current Password",
                    val: currentPw,
                    set: setCurrentPw,
                    ph: "••••••••",
                  },
                  {
                    label: "New Password",
                    val: newPw,
                    set: setNewPw,
                    ph: "Min. 8 characters",
                  },
                  {
                    label: "Confirm New Password",
                    val: confirmPw,
                    set: setConfirmPw,
                    ph: "Repeat new password",
                  },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                      {label}
                    </label>
                    <input
                      type="password"
                      placeholder={ph}
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      className="mt-1 w-full px-3 py-2.5 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                    />
                  </div>
                ))}
                <AmberBtn
                  onClick={handleChangePassword}
                  disabled={
                    changePassword.isPending ||
                    !currentPw ||
                    !newPw ||
                    !confirmPw
                  }
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {changePassword.isPending ? "Updating…" : "Update Password"}
                </AmberBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
