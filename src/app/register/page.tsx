"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Lock, Mail, Eye, EyeOff, AtSign } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRegister } from "../hooks/useAuth";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// ── Inline client-side validation ─────────────────────────────────────────────
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

// FIX: Extracted your main logic into a child component
function RegisterContent() {
  const searchParams = useSearchParams();
  const refId = searchParams.get("ref") ?? undefined;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState("AFFILIATE_MANAGER");

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
      role,
      ref: refId,
    });
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#080808] text-zinc-100 flex flex-col lg:flex-row selection:bg-amber-400 selection:text-black">
      {/* ── Left Side: Form Container (50%) ── */}
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

            {/* Referral banner */}
            <AnimatePresence>
              {refId && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-4 px-3 py-2 rounded-xl border border-amber-400/20 bg-amber-400/8 text-[11px] text-amber-300 font-semibold"
                >
                  🔗 Linked to partner referral programme.
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
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
                  placeholder="badcat@example.com"
                  className={inputCls(!!fieldErr("email"))}
                />
              </Field>

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

              <div className="flex flex-col space-y-2 pt-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "AFFILIATE_MANAGER",
                    "BASIC_SUB_AFFILIATE",
                    "ADMIN_SUB_AFFILIATE",
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-1.5 text-[8.5px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                        role === r
                          ? "bg-amber-400/10 border-amber-400 text-amber-400"
                          : "bg-transparent border-white/10 text-zinc-500 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {r.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {role === "BASIC_SUB_AFFILIATE" && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[10px] text-amber-400/80 mt-1"
                    >
                      You will earn 10% overrides from Affiliate Managers you
                      invite.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

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

// This is the new default export that wraps everything in Suspense
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-[#080808] flex items-center justify-center text-amber-400 font-bold text-sm">
          Loading...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
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
