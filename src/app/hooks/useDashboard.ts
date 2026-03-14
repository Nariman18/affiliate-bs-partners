import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  authEndpoints,
  offersEndpoints,
  trackingEndpoints,
  commissionsEndpoints,
  payoutsEndpoints,
  billingEndpoints,
  reportsEndpoints,
  transactionsEndpoints,
  teamEndpoints,
} from "../lib/api";

// ─── Query keys ────────────────────────────────────────────────────────────────
export const QK = {
  me: ["auth", "me"],
  myManager: ["auth", "my-manager"],
  referralLink: ["auth", "referral-link"],

  offers: (p?: object) => ["offers", p],
  offer: (id: string) => ["offers", id],
  offerRequests: (offerId: string) => ["offers", offerId, "requests"],

  links: ["track", "links"],

  commissionList: (p?: object) => ["commissions", "list", p],
  commissionStats: ["commissions", "stats"],

  payoutList: (p?: object) => ["payouts", "list", p],
  payoutStats: ["payouts", "stats"],

  balance: ["billing", "balance"],
  methods: ["billing", "methods"],

  reportOverview: (p?: object) => ["reports", "overview", p],
  reportGeneral: (p?: object) => ["reports", "general", p],
  reportOffer: (p?: object) => ["reports", "by-offer", p],
  reportCountry: (p?: object) => ["reports", "by-country", p],
  reportDevice: (p?: object) => ["reports", "by-device", p],

  conversions: (p?: object) => ["tx", "conversions", p],
  clicks: (p?: object) => ["tx", "clicks", p],
  postbacks: (p?: object) => ["tx", "postbacks", p],

  team: ["team"],
  teamMember: (id: string) => ["team", id],

  refLink: ["referrals", "link"],
  refMine: ["referrals", "mine"],
  refStats: ["referrals", "stats"],
} as const;

// ─── Auth ──────────────────────────────────────────────────────────────────────
export function useMe() {
  return useQuery({
    queryKey: QK.me,
    queryFn: authEndpoints.me,
    staleTime: 60_000,
  });
}
export function useMyManager() {
  return useQuery({
    queryKey: QK.myManager,
    queryFn: authEndpoints.myManager,
    staleTime: 5 * 60_000,
  });
}
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authEndpoints.updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.me });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });
}
export function useChangePassword() {
  return useMutation({
    mutationFn: authEndpoints.changePassword,
    onSuccess: () => toast.success("Password changed"),
    onError: (e: any) =>
      toast.error(e.response?.data?.error ?? "Failed to change password"),
  });
}

// ─── Balance ───────────────────────────────────────────────────────────────────
export function useBalance() {
  return useQuery({
    queryKey: QK.balance,
    queryFn: billingEndpoints.balance,
    staleTime: 30_000,
  });
}

// ─── Commission stats (Pending / Approved / Paid — all roles) ─────────────────
export function useCommissionStats() {
  return useQuery({
    queryKey: QK.commissionStats,
    queryFn: commissionsEndpoints.stats,
    staleTime: 30_000,
  });
}
export function useCommissions(params?: {
  status?: "PENDING" | "APPROVED" | "PAID";
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: QK.commissionList(params),
    queryFn: () => commissionsEndpoints.list(params),
  });
}
export function useRequestCommissionApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commissionsEndpoints.requestApproval,
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      toast.success(`${d.flagged} commission(s) submitted for approval`);
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.error ?? "Failed to request approval"),
  });
}
export function useApproveCommission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commissionsEndpoints.approve,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Commission approved");
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Failed"),
  });
}
export function usePayCommission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commissionsEndpoints.pay,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      qc.invalidateQueries({ queryKey: QK.balance });
      toast.success("Commission marked as PAID");
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Failed"),
  });
}
export function useBulkApproveCommissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commissionsEndpoints.bulkApprove,
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      toast.success(`${d.approved} commissions approved`);
    },
    onError: () => toast.error("Bulk approve failed"),
  });
}
export function useBulkPayCommissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: commissionsEndpoints.bulkPay,
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["commissions"] });
      qc.invalidateQueries({ queryKey: QK.balance });
      toast.success(`${d.paid} commissions marked PAID`);
    },
    onError: () => toast.error("Bulk pay failed"),
  });
}

// Aliases for backward compat with PagePayouts.tsx
/** @deprecated use useApproveCommission */
export const useApproveCommissions = useApproveCommission;

// ─── Payouts ───────────────────────────────────────────────────────────────────
export function usePayoutStats() {
  return useQuery({
    queryKey: QK.payoutStats,
    queryFn: payoutsEndpoints.stats,
    staleTime: 30_000,
  });
}
export function usePayouts(params?: { status?: string }) {
  return useQuery({
    queryKey: QK.payoutList(params),
    queryFn: () => payoutsEndpoints.list(params),
  });
}
export function useCreatePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: payoutsEndpoints.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payouts"] });
      qc.invalidateQueries({ queryKey: QK.balance });
      toast.success("Payout request submitted");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.error ?? "Payout request failed"),
  });
}
export function useApprovePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: payoutsEndpoints.approve,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payouts"] });
      toast.success("Payout approved");
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Failed"),
  });
}
export function usePayPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: payoutsEndpoints.pay,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payouts"] });
      toast.success("Payout marked PAID");
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Failed"),
  });
}
export function useTrashPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: payoutsEndpoints.trash,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payouts"] });
      qc.invalidateQueries({ queryKey: QK.balance });
      toast.success("Payout trashed, balance restored");
    },
    onError: () => toast.error("Failed to trash payout"),
  });
}
// Alias for PagePayouts.tsx backward compat
export function useUpdatePayoutStatus() {
  // PagePayouts called this with { id, status: "APPROVED"|"REJECTED", txHash }
  // New API: approve and pay are separate. This shim routes to the right one.
  const approvePayout = useApprovePayout();
  const payPayout = usePayPayout();
  const trashPayout = useTrashPayout();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      txHash,
      note,
    }: {
      id: string;
      status: string;
      txHash?: string;
      note?: string;
    }) => {
      if (status === "APPROVED") return payoutsEndpoints.approve({ id, note });
      if (status === "PAID") return payoutsEndpoints.pay({ id, txHash, note });
      return payoutsEndpoints.trash({ id, note });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payouts"] });
      toast.success("Payout updated");
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Failed"),
  });
}

// ─── Offers ────────────────────────────────────────────────────────────────────
export function useOffers(params?: { category?: string; country?: string }) {
  return useQuery({
    queryKey: QK.offers(params),
    queryFn: () => offersEndpoints.list(params),
    staleTime: 30_000,
  });
}
export function useOffer(id: string) {
  return useQuery({
    queryKey: QK.offer(id),
    queryFn: () => offersEndpoints.detail(id),
    enabled: !!id,
  });
}
export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: offersEndpoints.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offer created");
    },
    onError: () => toast.error("Failed to create offer"),
  });
}
export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: offersEndpoints.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offer updated");
    },
    onError: () => toast.error("Failed to update offer"),
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: offersEndpoints.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offer deleted successfully");
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.error ?? "Failed to delete offer");
    },
  });
}

export function useRequestOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: offersEndpoints.request,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Access request submitted");
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.error ?? "Request failed"),
  });
}
export function useOfferRequests(offerId: string) {
  return useQuery({
    queryKey: QK.offerRequests(offerId),
    queryFn: () => offersEndpoints.listRequests(offerId),
    enabled: !!offerId,
  });
}
export function useUpdateOfferRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: offersEndpoints.updateRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Request updated");
    },
    onError: () => toast.error("Failed to update request"),
  });
}

// ─── Tracking links ────────────────────────────────────────────────────────────
export function useMyLinks() {
  return useQuery({ queryKey: QK.links, queryFn: trackingEndpoints.myLinks });
}
export function useCreateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: trackingEndpoints.createLink,
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: QK.links });
      toast.success("Link created", { description: d.trackingUrl });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.error ?? "Failed to create link"),
  });
}

// ─── Reports ───────────────────────────────────────────────────────────────────
export function useReportsOverview(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: QK.reportOverview(params),
    queryFn: () => reportsEndpoints.overview(params),
    staleTime: 60_000,
  });
}
export function useReportGeneral(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: QK.reportGeneral(params),
    queryFn: () => reportsEndpoints.general(params),
  });
}
export function useReportByOffer(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: QK.reportOffer(params),
    queryFn: () => reportsEndpoints.byOffer(params),
  });
}
export function useReportByCountry(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: QK.reportCountry(params),
    queryFn: () => reportsEndpoints.byCountry(params),
  });
}
export function useReportByDevice(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: QK.reportDevice(params),
    queryFn: () => reportsEndpoints.byDevice(params),
  });
}

// ─── Transactions ──────────────────────────────────────────────────────────────
export function useConversions(params?: {
  from?: string;
  to?: string;
  offerId?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: QK.conversions(params),
    queryFn: () => transactionsEndpoints.conversions(params),
  });
}
export function useClicks(params?: {
  from?: string;
  to?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: QK.clicks(params),
    queryFn: () => transactionsEndpoints.clicks(params),
  });
}
export function usePostbacks(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: QK.postbacks(params),
    queryFn: () => transactionsEndpoints.postbacks(params),
  });
}

// ─── Billing / Payment methods ─────────────────────────────────────────────────
export function usePaymentMethods() {
  return useQuery({ queryKey: QK.methods, queryFn: billingEndpoints.methods });
}
export function useAddPaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingEndpoints.addMethod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.methods });
      toast.success("Payment method added");
    },
    onError: (e: any) => toast.error(e.response?.data?.error ?? "Failed"),
  });
}
export function useDeletePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingEndpoints.deleteMethod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.methods });
      toast.success("Payment method removed");
    },
    onError: () => toast.error("Failed to remove payment method"),
  });
}
// Stub — invoices are now payout history. Use usePayouts instead.
export function useInvoices() {
  return useQuery({
    queryKey: ["payouts", "invoices"],
    queryFn: () => payoutsEndpoints.list({ status: "PAID" }),
  });
}

// ─── Team ──────────────────────────────────────────────────────────────────────
export function useTeam() {
  return useQuery({ queryKey: QK.team, queryFn: teamEndpoints.list });
}
export function useTeamMember(userId: string) {
  return useQuery({
    queryKey: QK.teamMember(userId),
    queryFn: () => teamEndpoints.member(userId),
    enabled: !!userId,
  });
}
// Aliases for PageAffiliates.tsx
export const useAffiliates = useTeam;
export function useUpdateMarkup() {
  // markupPercentage no longer exists — stub that does nothing
  return useMutation({
    mutationFn: async (_p: any) => null,
    onSuccess: () => toast.success("Updated"),
  });
}

// ─── Referrals (now uses supervisorId chain) ───────────────────────────────────
export function useReferralLink() {
  return useQuery({
    queryKey: QK.refLink,
    queryFn: authEndpoints.referralLink,
    staleTime: Infinity,
  });
}
export function useMyReferrals() {
  return useQuery({
    queryKey: QK.refMine,
    queryFn: async () => {
      const { api } = await import("../lib/api");
      const { data } = await api.get("/referrals/mine");
      return data;
    },
  });
}
export function useReferralStats() {
  return useQuery({
    queryKey: QK.refStats,
    queryFn: async () => {
      const { api } = await import("../lib/api");
      const { data } = await api.get("/referrals/stats");
      return data;
    },
  });
}

export function useToggleStarOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: offersEndpoints.toggleStar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
    },
    onError: () => toast.error("Failed to update favorite status"),
  });
}
