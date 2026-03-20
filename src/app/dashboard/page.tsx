"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
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
  Menu,
} from "lucide-react";
import { logout, setCredentials } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hook";
import {
  navigateTo,
  openOfferDetail,
  openMemberDetail,
  type Page,
} from "../store/slices/uiSlice";
import { ROLES, type AppRole } from "../lib/api";
import {
  useBalance,
  useCommissionStats,
  useMe,
  useMyManager,
} from "../hooks/useDashboard";
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
import PageMemberDetail from "../components/PageMemberDetail";
import { Spinner } from "../components/dashboard/UI";
import { useRouter } from "next/navigation";
import { useLogout } from "../hooks/useAuth";

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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${active ? "bg-amber-400/15 text-amber-400 border border-amber-400/15" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/4"}`}
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
  { id: "reports", icon: <BarChart3 className="w-4 h-4" />, label: "Reports" },
  {
    id: "transactions",
    icon: <Activity className="w-4 h-4" />,
    label: "Transactions",
  },
  { id: "billing", icon: <CreditCard className="w-4 h-4" />, label: "Billing" },
  { id: "settings", icon: <Settings className="w-4 h-4" />, label: "Settings" },
] as const;

function RolePill({ role }: { role: AppRole }) {
  const styles: Record<AppRole, string> = {
    [ROLES.ADMIN]: "bg-amber-400/15 text-amber-400 border-amber-400/20",
    [ROLES.BASIC]: "bg-sky-400/15 text-sky-400 border-sky-400/20",
    [ROLES.MANAGER]: "bg-zinc-700/60 text-zinc-400 border-white/8",
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

function BalanceBar() {
  const { data, isLoading } = useBalance();
  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-16 sm:w-24 h-7 sm:h-8 rounded-lg bg-zinc-800 border border-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }
  const pending = data?.pendingBalance ?? 0;
  const approved = data?.approvedBalance ?? 0;
  const paid = data?.paidBalance ?? 0;
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
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
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/6 bg-white/3 text-sm"
        >
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm ${color}`} />
          <span className="text-[10px] text-zinc-500 hidden xl:inline">
            {label}
          </span>
          <span className="font-bold text-white text-xs sm:text-sm">
            {fmt.usd(amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

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

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { activePage, selectedOfferId, selectedMemberId } = useAppSelector(
    (s) => s.ui,
  );
  const { data: me, isLoading: isMeLoading, isError } = useMe();
  const handleSignOut = useLogout();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentUser = me ?? user;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || isError) router.replace("/login");
  }, [isError, router]);

  useEffect(() => {
    if (me && !user) {
      const token = localStorage.getItem("token");
      if (token) dispatch(setCredentials({ user: me, token }));
    }
  }, [me, user, dispatch]);

  // Open sidebar by default on large screens
  useEffect(() => {
    const check = () => setIsSidebarOpen(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  if ((isMeLoading && !currentUser) || !currentUser) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const role = (currentUser?.role as AppRole) ?? ROLES.MANAGER;
  const navItems =
    role === ROLES.ADMIN
      ? NAV_ADMIN
      : role === ROLES.BASIC
        ? NAV_BASIC
        : NAV_MANAGER;

  const handleNavClick = (id: string) => {
    dispatch(navigateTo(id as Page));
    // Auto-close on mobile/tablet
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 font-sans antialiased flex flex-col">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-white/6 bg-[#080808]/90 backdrop-blur-xl flex items-center px-3 sm:px-4 gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            <Image
              alt="CatLogo"
              src="/LogoCat.png"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Balance — hidden on xs */}
        <div className="hidden sm:block min-w-0 flex-1 overflow-x-auto">
          <BalanceBar />
        </div>

        {/* Clock — hidden below md */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/6 bg-white/3 text-xs text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          <span>CET</span>
          {now && <span className="text-zinc-300 font-semibold">{now}</span>}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/8">
            {isMeLoading && !user ? (
              <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse flex-shrink-0" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-zinc-700 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400 overflow-hidden flex-shrink-0">
                  {(currentUser as any)?.avatarUrl ? (
                    <img
                      src={(currentUser as any).avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : currentUser?.displayName ? (
                    currentUser.displayName.slice(0, 2).toUpperCase()
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white">
                    {currentUser?.displayName ??
                      currentUser?.email?.split("@")[0] ??
                      "—"}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {ROLE_LABELS[role]}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-14">
        {/* Mobile backdrop */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-20 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Sidebar ── */}
        <motion.aside
          initial={false}
          animate={{ x: isSidebarOpen ? 0 : "-100%" }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-0 top-14 bottom-0 w-56 border-r border-white/6 bg-[#080808]/95 backdrop-blur-xl flex flex-col z-30"
        >
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
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </nav>
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
        </motion.aside>

        {/* ── Main content ── */}
        <main
          className={`flex-1 min-h-[calc(100vh-3.5rem)] w-full transition-[margin-left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen ? "lg:ml-56" : "ml-0"}`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-7 py-4 sm:py-6 lg:py-8">
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
              {activePage === "team" &&
                (role === ROLES.ADMIN || role === ROLES.BASIC) && (
                  <PageTeam
                    key="team"
                    role={role}
                    userId={currentUser?.id ?? ""}
                  />
                )}
              {activePage === "member-detail" && selectedMemberId && (
                <PageMemberDetail
                  key="member-detail"
                  memberId={selectedMemberId}
                  role={role}
                  onBack={() => dispatch(navigateTo("team"))}
                />
              )}
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
