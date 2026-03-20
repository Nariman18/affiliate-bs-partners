"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AtSign,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRegister } from "../hooks/useAuth";
import { ROLES } from "../lib/api";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function validate(
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
): Record<string, string> {
  const e: Record<string, string> = {};
  if (!username.trim()) {
    e.username = "Username is required";
  } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    e.username = "3–30 chars: letters, numbers or underscores only";
  }
  if (!email.trim()) {
    e.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    e.email = "Enter a valid email address";
  }
  if (!password) {
    e.password = "Password is required";
  } else if (password.length < 8) {
    e.password = "Minimum 8 characters";
  }
  if (!confirmPassword) {
    e.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    e.confirmPassword = "Passwords do not match";
  }
  return e;
}

const ROLE_LABELS: Record<string, string> = {
  [ROLES.MANAGER]: "Affiliate Manager",
  [ROLES.BASIC]: "Basic Sub-Affiliate",
  [ROLES.ADMIN]: "Admin Sub-Affiliate",
};

// ─── Extracted Inner Component ────────────────────────────────────────────────
function RegisterForm() {
  const searchParams = useSearchParams();
  const refId = searchParams.get("ref") ?? undefined;
  const roleFromUrl = searchParams.get("role") ?? ROLES.MANAGER;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(roleFromUrl);

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((p) => ({ ...p, [f]: true }));
  const touchAll = () =>
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

  const errors = validate(username, email, password, confirmPassword);
  const fieldErr = (f: string) => (touched[f] ? errors[f] : undefined);

  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    touchAll();
    if (Object.keys(errors).length > 0) return;
    registerMutation.mutate({
      username,
      email,
      password,
      confirmPassword,
      role: selectedRole,
      ref: refId,
    });
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#080808] text-zinc-100 flex flex-col lg:flex-row selection:bg-amber-400 selection:text-black">
      {/* ── Left Side: Form ── */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative z-10">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <div className="w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          className="w-full max-w-md relative z-10 flex flex-col justify-center"
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Link href="/" className="relative w-28 h-12 block">
              <Image
                alt="CatLogo"
                src="/LogoCat.png"
                fill
                className="object-contain"
              />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/8 bg-zinc-900/60 backdrop-blur-xl p-6 lg:px-8 lg:py-6 shadow-2xl">
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">
              Create Account
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Join the elite iGaming infrastructure.
            </p>

            {/* Referral / role banner */}
            <AnimatePresence>
              {refId && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-4 px-3 py-2 rounded-xl border border-amber-400/20 bg-amber-400/8"
                >
                  <p className="text-[11px] text-amber-300 font-semibold">
                    🔗 Invited as{" "}
                    <span className="text-amber-400">
                      {ROLE_LABELS[roleFromUrl] ?? roleFromUrl}
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
              {/* Custom Role Selection Dropdown */}
              {!refId && (
                <div className="flex flex-col space-y-1.5 mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Account Type
                  </label>
                  <RoleSelect value={selectedRole} onChange={setSelectedRole} />
                </div>
              )}

              {/* Username */}
              <Field
                label="Username"
                error={fieldErr("username")}
                icon={<AtSign className="w-4 h-4" />}
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => touch("username")}
                  placeholder="your_handle"
                  className={inputCls(!!fieldErr("username"))}
                />
              </Field>

              {/* Email */}
              <Field
                label="Email"
                error={fieldErr("email")}
                icon={<Mail className="w-4 h-4" />}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => touch("email")}
                  placeholder="you@example.com"
                  className={inputCls(!!fieldErr("email"))}
                />
              </Field>

              {/* Password */}
              <Field
                label="Password"
                error={fieldErr("password")}
                icon={<Lock className="w-4 h-4" />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              >
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => touch("password")}
                  placeholder="Min. 8 characters"
                  className={inputCls(!!fieldErr("password"))}
                />
              </Field>

              {/* Confirm Password */}
              <Field
                label="Confirm Password"
                error={fieldErr("confirmPassword")}
                icon={<Lock className="w-4 h-4" />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              >
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => touch("confirmPassword")}
                  placeholder="Repeat your password"
                  className={inputCls(!!fieldErr("confirmPassword"))}
                />
              </Field>

              {/* Server error */}
              <AnimatePresence>
                {registerMutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium"
                  >
                    {(registerMutation.error as any).response?.data?.error ||
                      "Registration failed. Please try again."}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={registerMutation.isPending}
                className={`w-full mt-2 group flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-400 text-black font-bold text-sm shadow-[0_0_40px_rgba(251,191,36,0.2)] transition-all ${
                  registerMutation.isPending
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-amber-300"
                }`}
              >
                {registerMutation.isPending
                  ? "Initializing…"
                  : "Register Account"}
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </motion.button>
            </form>

            <div className="mt-5 text-center pt-5 border-t border-white/5">
              <p className="text-xs text-zinc-500 font-medium">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Right Side: Image ── */}
      <div className="hidden lg:block lg:w-1/2 relative h-full">
        <Image
          alt="CatLoginRegister"
          src="/CatLoginRegister.png"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-transparent to-transparent opacity-80 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Main Default Export with Suspense ─────────────────────────────────────────

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-[#080808] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

// ─── Custom Role Select Component ─────────────────────────────────────────────

function RoleSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const rolesList = [
    { id: ROLES.MANAGER, label: ROLE_LABELS[ROLES.MANAGER] },
    { id: ROLES.BASIC, label: ROLE_LABELS[ROLES.BASIC] },
    { id: ROLES.ADMIN, label: ROLE_LABELS[ROLES.ADMIN] },
  ];

  const selectedLabel =
    rolesList.find((r) => r.id === value)?.label || "Select Role";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full bg-zinc-800/50 border rounded-xl py-2.5 px-4 text-sm text-white text-left focus:outline-none transition-all cursor-pointer relative ${
          open
            ? "border-amber-400/50 ring-1 ring-amber-400/50"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <span className="truncate block pr-6">{selectedLabel}</span>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
          <ChevronDown
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl py-1.5 overflow-hidden flex flex-col"
            >
              {rolesList.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    onChange(role.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    value === role.id
                      ? "text-amber-400 bg-white/5 font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Input Styling & Field Wrapper ────────────────────────────────────────────

const inputCls = (hasError: boolean) =>
  `w-full bg-zinc-800/50 border rounded-xl py-2.5 pl-11 pr-10 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600 ${
    hasError
      ? "border-rose-500/50 focus:border-rose-400/70 focus:ring-1 focus:ring-rose-400/30"
      : "border-white/10 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50"
  }`;

function Field({
  label,
  error,
  icon,
  suffix,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
          {icon}
        </span>
        {children}
        {suffix}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[10px] text-rose-400 font-medium pl-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
