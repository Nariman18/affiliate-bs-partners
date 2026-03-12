"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Tag,
  BarChart3,
  Activity,
  CreditCard,
  Settings,
  LogOut,
  Newspaper,
  Users,
  CheckCircle2,
  Wallet,
  Bell,
  Clock,
  User,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react";

import { logout, setCredentials } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hook";
import {
  navigateTo,
  openOfferDetail,
  type Page,
} from "../store/slices/uiSlice";
import { ROLES, type AppRole } from "../lib/api";
import {
  useBalance,
  useMe,
  useMyManager,
  useCommissionStats,
} from "../hooks/useDashboard";

// Dashboard page components (create one file per page)
import PageOverview from "../components/PageOverview";
import PageNews from "../components/PageNews";
import PageOffers from "../components/PageOffers";
import PageOfferDetail from "../components/PageOfferDetail";
import PageReports from "../components/PageReports";
import PageTransactions from "../components/PageTransactions";
import PageBilling from "../components/PageBilling";
import PageSettings from "../components/PageSettings";
import PagePayouts from "../components/PagePayouts";
import PageTeam from "../components/PageTeam";
import { Spinner } from "../components/dashboard/UI";
import { useRouter } from "next/navigation";
import PageCommissions from "../components/PageComissions";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = {
  usd: (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(n),
};

const ROLE_LABELS: Record<AppRole, string> = {
  [ROLES.ADMIN]: "Admin Sub-Affiliate",
  [ROLES.BASIC]: "Basic Sub-Affiliate",
  [ROLES.MANAGER]: "Affiliate Manager",
};

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
        active
          ? "bg-amber-400/15 text-amber-400 border border-amber-400/15"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/4"
      }`}
    >
      <span className={active ? "text-amber-400" : "text-zinc-600"}>
        {icon}
      </span>
      {label}
      {!!badge && (
        <span className="ml-auto px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-400 text-[10px] font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Per-role nav configs ──────────────────────────────────────────────────────
const NAV_ADMIN = [
  {
    id: "overview",
    icon: <LayoutDashboard className="w-4 h-4" />,
    label: "Dashboard",
  },
  { id: "news", icon: <Newspaper className="w-4 h-4" />, label: "News" },
  { id: "offers", icon: <Tag className="w-4 h-4" />, label: "Offers" },
  { id: "team", icon: <Users className="w-4 h-4" />, label: "Team" },
  {
    id: "commissions",
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Commissions",
  },
  {
    id: "payouts",
    icon: <Wallet className="w-4 h-4" />,
    label: "Payout Inbox",
  },
  { id: "reports", icon: <BarChart3 className="w-4 h-4" />, label: "Reports" },
  {
    id: "transactions",
    icon: <Activity className="w-4 h-4" />,
    label: "Transactions",
  },
  { id: "billing", icon: <CreditCard className="w-4 h-4" />, label: "Billing" },
  { id: "settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
] as const;

const NAV_BASIC = [
  {
    id: "overview",
    icon: <LayoutDashboard className="w-4 h-4" />,
    label: "Dashboard",
  },
  { id: "news", icon: <Newspaper className="w-4 h-4" />, label: "News" },
  { id: "offers", icon: <Tag className="w-4 h-4" />, label: "Offers" },
  { id: "team", icon: <Users className="w-4 h-4" />, label: "My Team" },
  {
    id: "commissions",
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Commissions",
  },
  { id: "reports", icon: <BarChart3 className="w-4 h-4" />, label: "Reports" },
  {
    id: "transactions",
    icon: <Activity className="w-4 h-4" />,
    label: "Transactions",
  },
  { id: "billing", icon: <CreditCard className="w-4 h-4" />, label: "Billing" },
  { id: "settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
] as const;

const NAV_MANAGER = [
  {
    id: "overview",
    icon: <LayoutDashboard className="w-4 h-4" />,
    label: "Dashboard",
  },
  { id: "news", icon: <Newspaper className="w-4 h-4" />, label: "News" },
  { id: "offers", icon: <Tag className="w-4 h-4" />, label: "Offers" },
  {
    id: "commissions",
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Commissions",
  },
  { id: "reports", icon: <BarChart3 className="w-4 h-4" />, label: "Reports" },
  {
    id: "transactions",
    icon: <Activity className="w-4 h-4" />,
    label: "Transactions",
  },
  { id: "billing", icon: <CreditCard className="w-4 h-4" />, label: "Billing" },
  { id: "settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
] as const;

// ─── Role pill ─────────────────────────────────────────────────────────────────
function RolePill({ role }: { role: AppRole }) {
  const styles: Record<AppRole, string> = {
    [ROLES.ADMIN]: "bg-amber-400/15 text-amber-400 border-amber-400/20",
    [ROLES.BASIC]: "bg-sky-400/15   text-sky-400   border-sky-400/20",
    [ROLES.MANAGER]: "bg-zinc-700/60  text-zinc-400  border-white/8",
  };
  const labels: Record<AppRole, string> = {
    [ROLES.ADMIN]: "Admin",
    [ROLES.BASIC]: "Basic Sub",
    [ROLES.MANAGER]: "Manager",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${styles[role]}`}
    >
      {role === ROLES.ADMIN && <ShieldCheck className="w-2.5 h-2.5" />}
      {labels[role]}
    </span>
  );
}

// ─── Three-bucket balance bar (all roles see pending / approved / paid) ────────
function BalanceBar() {
  const { data } = useBalance();
  const { data: stats } = useCommissionStats();

  const pending = data?.pendingBalance ?? 0;
  const approved = data?.approvedBalance ?? 0;
  const paid = data?.paidBalance ?? 0;

  return (
    <div className="flex items-center gap-2">
      {[
        {
          label: "Pending",
          amount: pending,
          color: "bg-zinc-500/80",
          title: "Commissions not yet verified by Admin",
        },
        {
          label: "Approved",
          amount: approved,
          color: "bg-amber-400/80",
          title: "Verified — waiting for payout",
        },
        {
          label: "Paid",
          amount: paid,
          color: "bg-emerald-400/80",
          title: "Funds sent to your wallet",
        },
      ].map(({ label, amount, color, title }) => (
        <div
          key={label}
          title={title}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/6 bg-white/3 text-sm"
        >
          <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
          <span className="text-[10px] text-zinc-500 hidden lg:inline">
            {label}
          </span>
          <span className="font-bold text-white">{fmt.usd(amount)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Manager badge (supervisor contact in sidebar) ────────────────────────────
function ManagerBadge() {
  const { data, isLoading } = useMyManager();
  const manager = data?.manager;

  if (isLoading) {
    return (
      <div className="px-3 pb-3">
        <div className="rounded-xl border border-white/6 bg-zinc-900/60 p-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-zinc-800 rounded w-3/4" />
              <div className="h-2.5 bg-zinc-800 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!manager) return null;

  return (
    <div className="px-3 pb-3 space-y-2">
      <p className="px-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-700">
        {manager.isOwner ? "Platform Support" : "Your Supervisor"}
      </p>
      <div className="rounded-xl border border-white/6 bg-zinc-900/60 p-3 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[9px] font-black text-amber-400 flex-shrink-0">
            {manager.avatar}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {manager.displayName}
            </div>
            <div className="text-[10px] text-zinc-600 truncate">
              @{manager.username}
            </div>
          </div>
        </div>
        <div className="space-y-1 pl-0.5">
          <a
            href={`mailto:${manager.email}`}
            className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-sky-400 transition-colors truncate"
          >
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{manager.email}</span>
          </a>
          {manager.telegramHandle && (
            <a
              href={`https://t.me/${manager.telegramHandle.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-sky-400 transition-colors"
            >
              <Send className="w-3 h-3 flex-shrink-0" />
              <span>{manager.telegramHandle}</span>
            </a>
          )}
        </div>
        {manager.isOwner && (
          <div className="pt-1 border-t border-white/5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500/70">
              Platform Admin
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { activePage, selectedOfferId } = useAppSelector((s) => s.ui);
  const { data: me, isLoading: isMeLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (me && !user) {
      const token = localStorage.getItem("token");
      if (token) dispatch(setCredentials({ user: me, token }));
    }
  }, [me, user, dispatch]);

  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Warsaw",
        }),
      );
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  if (isMeLoading && !user) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const role = ((me?.role ?? user?.role) as AppRole) ?? ROLES.MANAGER;
  const navItems =
    role === ROLES.ADMIN
      ? NAV_ADMIN
      : role === ROLES.BASIC
        ? NAV_BASIC
        : NAV_MANAGER;

  const handleSignOut = () => {
    dispatch(logout());
    toast("Session ended", {
      description: "You have been securely logged out.",
      style: { border: "1px solid rgba(255,255,255,0.1)" },
    });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 font-sans antialiased flex flex-col">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-white/6 bg-[#080808]/90 backdrop-blur-xl flex items-center px-4 gap-4">
        <div className="w-56 flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
            <span className="text-black text-[9px] font-black">BC</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            BC Partners
          </span>
        </div>

        {/* Three-bucket balance */}
        <BalanceBar />

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/6 bg-white/3 text-xs text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          <span>CET</span>
          {now && <span className="text-zinc-300 font-semibold">{now}</span>}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
          </button>
          <div className="flex items-center gap-2.5 pl-3 border-l border-white/8">
            <div className="w-8 h-8 rounded-full bg-zinc-700 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400">
              {me?.displayName?.slice(0, 2).toUpperCase() ?? (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-white">
                {me?.displayName ?? me?.email?.split("@")[0] ?? "—"}
              </div>
              <div className="text-[10px] text-zinc-500">
                {ROLE_LABELS[role]}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-14">
        {/* ── Sidebar ── */}
        <aside className="fixed left-0 top-14 bottom-0 w-56 border-r border-white/6 bg-[#080808]/95 backdrop-blur-xl flex flex-col z-30">
          <div className="px-4 pt-4 pb-2">
            <RolePill role={role} />
          </div>

          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={
                  activePage === item.id ||
                  (activePage === "offer-detail" && item.id === "offers")
                }
                onClick={() => dispatch(navigateTo(item.id as Page))}
              />
            ))}
          </nav>

          {/* Supervisor badge — Admin sits at the top, has no badge */}
          {role !== ROLES.ADMIN && <ManagerBadge />}

          <div className="px-3 pb-4 pt-2 border-t border-white/5">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:text-rose-400 hover:bg-rose-500/8 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
            <p className="text-center text-[9px] text-zinc-800 mt-3">
              Powered by BC Partners
            </p>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 ml-56 min-h-[calc(100vh-3.5rem)]">
          <div className="max-w-7xl mx-auto px-7 py-8">
            <AnimatePresence mode="wait">
              {activePage === "overview" && (
                <PageOverview
                  key="overview"
                  role={role}
                  onSelectOffer={(id) => dispatch(openOfferDetail(id))}
                />
              )}
              {activePage === "news" && <PageNews key="news" />}

              {activePage === "offers" && (
                <PageOffers
                  key="offers"
                  role={role}
                  onSelectOffer={(id: string) => dispatch(openOfferDetail(id))}
                />
              )}
              {activePage === "offer-detail" && selectedOfferId && (
                <PageOfferDetail
                  key="offer-detail"
                  offerId={selectedOfferId}
                  role={role}
                  onBack={() => dispatch(navigateTo("offers"))}
                />
              )}

              {activePage === "reports" && (
                <PageReports key="reports" role={role} />
              )}
              {activePage === "transactions" && (
                <PageTransactions key="transactions" role={role} />
              )}
              {activePage === "billing" && <PageBilling key="billing" />}
              {activePage === "settings" && <PageSettings key="settings" />}

              {/* Team management — Admin and Basic Sub only */}
              {activePage === "team" &&
                (role === ROLES.ADMIN || role === ROLES.BASIC) && (
                  <PageTeam
                    key="team"
                    role={role}
                    userId={me?.id ?? user?.id ?? ""}
                  />
                )}

              {/*
               * Commissions:
               *   Admin   → approval inbox: Approve (PENDING→APPROVED) + Pay (APPROVED→PAID)
               *   Basic   → team feed + "Request Approval" button
               *   Manager → personal commission history with Pending / Approved / Paid stats
               */}
              {activePage === "commissions" && (
                <PageCommissions key="commissions" role={role} />
              )}

              {/* Payout Inbox — Admin only */}
              {activePage === "payouts" && role === ROLES.ADMIN && (
                <PagePayouts key="payouts" />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
