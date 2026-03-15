"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Shield,
  User,
  Pencil,
  Send,
  Layers,
  Smartphone,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import {
  useMe,
  useUpdateProfile,
  useChangePassword,
} from "../hooks/useDashboard";
import { AmberBtn, pageIn, SectionHeader } from "./dashboard/UI";

export default function PageSettings() {
  const [subTab, setSubTab] = useState("Personal Preferences");
  const { data: me } = useMe();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [displayName, setDisplayName] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  return (
    <motion.div
      key="settings"
      variants={pageIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <SectionHeader title="Profile & Settings" />

      <div className="grid md:grid-cols-[220px_1fr] gap-6">
        {/* Sub-nav */}
        <div className="space-y-1">
          {["Personal Preferences", "Billing Details", "Security"].map(
            (item) => (
              <button
                key={item}
                onClick={() => setSubTab(item)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${subTab === item ? "bg-amber-400/15 text-amber-400 border border-amber-400/20" : "text-zinc-500 hover:text-white hover:bg-white/4"}`}
              >
                {item}
              </button>
            ),
          )}
          <div className="pt-3 border-t border-white/6 space-y-1">
            {[
              {
                label: "Global Postbacks",
                icon: <Send className="w-3.5 h-3.5" />,
              },
              { label: "API", icon: <Layers className="w-3.5 h-3.5" /> },
              {
                label: "Mobile App",
                icon: <Smartphone className="w-3.5 h-3.5" />,
              },
            ].map(({ label, icon }) => (
              <button
                key={label}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:text-white hover:bg-white/4 transition-all"
              >
                <div className="flex items-center gap-2">
                  {icon}
                  {label}
                </div>
                <ExternalLink className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>

        {/* Content panel */}
        <div className="rounded-2xl border border-white/6 bg-zinc-900/60 p-7">
          {subTab === "Personal Preferences" && (
            <div>
              <h3 className="text-lg font-black text-white mb-6">
                Personal Preferences
              </h3>
              <div className="w-16 h-16 rounded-full bg-zinc-700 border border-white/10 flex items-center justify-center mb-7">
                <User className="w-7 h-7 text-zinc-500" />
              </div>
              <div className="space-y-0">
                {[
                  { label: "Display Name", value: me?.displayName ?? "—" },
                  { label: "Email", value: me?.email ?? "—" },
                  { label: "Role", value: me?.role ?? "—" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-4 border-b border-white/5"
                  >
                    <span className="text-sm text-zinc-500 w-36">{label}</span>
                    <span className="flex-1 text-sm text-zinc-300">
                      {value}
                    </span>
                    <button className="text-zinc-600 hover:text-amber-400 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5 block">
                  Update Display Name
                </label>
                <div className="flex gap-3">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={me?.displayName ?? "Your display name"}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                  />
                  <AmberBtn
                    onClick={() => updateProfile.mutate({ displayName })}
                    disabled={updateProfile.isPending || !displayName}
                  >
                    {updateProfile.isPending ? "Saving…" : "Save"}
                  </AmberBtn>
                </div>
              </div>
            </div>
          )}

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
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-white/8 bg-zinc-800/60 text-sm text-zinc-300 focus:outline-none focus:border-amber-400/40"
                  />
                </div>
                <AmberBtn
                  onClick={() =>
                    changePassword.mutate(
                      { currentPassword: currentPw, newPassword: newPw },
                      {
                        onSuccess: () => {
                          setCurrentPw("");
                          setNewPw("");
                        },
                      },
                    )
                  }
                  disabled={changePassword.isPending || !currentPw || !newPw}
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
