import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Role constants (mirrors backend) ─────────────────────────────────────────
export const ROLES = {
  ADMIN: "ADMIN_SUB_AFFILIATE",
  BASIC: "BASIC_SUB_AFFILIATE",
  MANAGER: "AFFILIATE_MANAGER",
} as const;
export type AppRole = (typeof ROLES)[keyof typeof ROLES];

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────
export const authEndpoints = {
  login: async (credentials: { email: string; password: string }) => {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },

  register: async (payload: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: string;
    ref?: string;
  }) => {
    const { ref, ...body } = payload;
    const { data } = await api.post(
      `/auth/register${ref ? `?ref=${ref}` : ""}`,
      body,
    );
    return data;
  },

  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  updateProfile: async (payload: {
    displayName?: string;
    telegramHandle?: string;
  }) => {
    const { data } = await api.patch("/auth/me", payload);
    return data;
  },

  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const { data } = await api.post("/auth/change-password", payload);
    return data;
  },

  myManager: async () => {
    const { data } = await api.get("/auth/my-manager");
    return data as {
      manager: {
        username: string;
        displayName: string;
        email: string;
        telegramHandle: string | null;
        role?: AppRole;
        avatar: string;
        isOwner: boolean;
      };
    };
  },

  // Admin / Basic Sub: get their own referral invite link
  referralLink: async () => {
    const { data } = await api.get("/auth/referral-link");
    return data as { link: string; targetRole: AppRole };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Offers
// ─────────────────────────────────────────────────────────────────────────────
export const offersEndpoints = {
  list: async (params?: {
    category?: string;
    country?: string;
    status?: string;
  }) => {
    const { data } = await api.get("/offers", { params });
    return data;
  },

  detail: async (id: string) => {
    const { data } = await api.get(`/offers/${id}`);
    return data;
  },

  toggleStar: async (id: string) => {
    const { data } = await api.post(`/offers/${id}/star`);
    return data;
  },

  getUploadUrl: async (payload: { filename: string; contentType: string }) => {
    const { data } = await api.post("/offers/upload-url", payload);
    return data as { uploadUrl: string; publicUrl: string; fileKey: string };
  },

  // Admin only
  create: async (payload: {
    name: string;
    category: string;
    casinoUrl: string;
    description?: string;
    targetCountry?: string;
    logoUrl?: string;
    geoTargets?: string[];
    minDeposit?: number;
    regPayout?: number;
    isVisible?: boolean;
    isNew?: boolean;
    isTop?: boolean;
    isExclusive?: boolean;
  }) => {
    const { data } = await api.post("/offers", payload);
    return data;
  },

  // Admin only
  update: async ({ id, ...payload }: { id: string; [k: string]: any }) => {
    const { data } = await api.patch(`/offers/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/offers/${id}`);
    return data;
  },

  // Manager: submit access request
  request: async (offerId: string) => {
    const { data } = await api.post(`/offers/${offerId}/request`);
    return data;
  },

  listRequests: async (offerId: string) => {
    const { data } = await api.get(`/offers/${offerId}/requests`);
    return data;
  },

  // Admin / Basic Sub: approve or reject a Manager's request
  updateRequest: async ({
    offerId,
    reqId,
    status,
  }: {
    offerId: string;
    reqId: string;
    status: "APPROVED" | "REJECTED";
  }) => {
    const { data } = await api.patch(`/offers/${offerId}/requests/${reqId}`, {
      status,
    });
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Tracking links
// ─────────────────────────────────────────────────────────────────────────────
export const trackingEndpoints = {
  // Manager: get their own links
  myLinks: async () => {
    const { data } = await api.get("/track/links/mine");
    return data;
  },

  // Admin / Basic Sub: assign a link to a Manager
  createLink: async (payload: {
    offerId: string;
    affiliateId: string;
    name?: string;
    subId?: string;
  }) => {
    const { data } = await api.post("/track/links", payload);
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Commissions  — the core of the financial workflow
// ─────────────────────────────────────────────────────────────────────────────
export const commissionsEndpoints = {
  // All roles — returns their own commission records (role-scoped on backend)
  list: async (params?: {
    status?: "PENDING" | "APPROVED" | "PAID";
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/commissions", { params });
    return data as {
      items: any[];
      total: number;
      page: number;
      limit: number;
    };
  },

  // All roles — Pending / Approved / Paid counts + amounts for dashboard cards
  stats: async () => {
    const { data } = await api.get("/commissions/stats");
    return data as {
      pending: { count: number; amount: number };
      approved: { count: number; amount: number };
      paid: { count: number; amount: number };
    };
  },

  // Basic Sub: flag commissions for Admin review
  requestApproval: async (commissionIds: string[]) => {
    const { data } = await api.post("/commissions/request-approval", {
      commissionIds,
    });
    return data;
  },

  // Admin: verify a single commission → PENDING → APPROVED
  approve: async ({ id, note }: { id: string; note?: string }) => {
    const { data } = await api.patch(`/commissions/${id}/approve`, { note });
    return data;
  },

  // Admin: mark a single commission as physically paid → APPROVED → PAID
  pay: async ({ id, note }: { id: string; note?: string }) => {
    const { data } = await api.patch(`/commissions/${id}/pay`, { note });
    return data;
  },

  // Admin: bulk approve (PENDING → APPROVED)
  bulkApprove: async (payload: { ids: string[]; note?: string }) => {
    const { data } = await api.post("/commissions/bulk-approve", payload);
    return data;
  },

  // Admin: bulk pay (APPROVED → PAID)
  bulkPay: async (payload: { ids: string[]; note?: string }) => {
    const { data } = await api.post("/commissions/bulk-pay", payload);
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Payouts
// ─────────────────────────────────────────────────────────────────────────────
export const payoutsEndpoints = {
  list: async (params?: { status?: string }) => {
    const { data } = await api.get("/payouts", { params });
    return data;
  },

  stats: async () => {
    const { data } = await api.get("/payouts/stats");
    return data as {
      pending: { count: number; amount: number };
      approved: { count: number; amount: number };
      paid: { count: number; amount: number };
    };
  },

  // User submits a withdrawal request (deducted from approvedBalance)
  create: async (payload: { amount: number; paymentMethodId?: string }) => {
    const { data } = await api.post("/payouts", payload);
    return data;
  },

  // Admin: PENDING → APPROVED
  approve: async ({ id, note }: { id: string; note?: string }) => {
    const { data } = await api.patch(`/payouts/${id}/approve`, { note });
    return data;
  },

  // Admin: APPROVED → PAID (after sending funds)
  pay: async ({
    id,
    txHash,
    note,
  }: {
    id: string;
    txHash?: string;
    note?: string;
  }) => {
    const { data } = await api.patch(`/payouts/${id}/pay`, { txHash, note });
    return data;
  },

  // Admin: reject / mark as fraud — restores balance
  trash: async ({ id, note }: { id: string; note?: string }) => {
    const { data } = await api.patch(`/payouts/${id}/trash`, { note });
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Billing
// ─────────────────────────────────────────────────────────────────────────────
export const billingEndpoints = {
  // Returns { pendingBalance, approvedBalance, paidBalance }
  balance: async () => {
    const { data } = await api.get("/billing/balance");
    return data as {
      pendingBalance: number;
      approvedBalance: number;
      paidBalance: number;
    };
  },

  methods: async () => {
    const { data } = await api.get("/billing/methods");
    return data;
  },

  addMethod: async (payload: {
    currency: string;
    network: string;
    address: string;
    label?: string;
    isDefault?: boolean;
  }) => {
    const { data } = await api.post("/billing/methods", payload);
    return data;
  },

  updateMethod: async ({
    id,
    ...payload
  }: {
    id: string;
    isDefault?: boolean;
    label?: string;
  }) => {
    const { data } = await api.patch(`/billing/methods/${id}`, payload);
    return data;
  },

  deleteMethod: async (id: string) => {
    const { data } = await api.delete(`/billing/methods/${id}`);
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────────────────────
export const reportsEndpoints = {
  overview: async (params?: { from?: string; to?: string }) => {
    const { data } = await api.get("/reports/overview", { params });
    return data;
  },
  general: async (params?: {
    from?: string;
    to?: string;
    groupBy?: string;
  }) => {
    const { data } = await api.get("/reports/general", { params });
    return data;
  },
  byOffer: async (params?: { from?: string; to?: string }) => {
    const { data } = await api.get("/reports/by-offer", { params });
    return data;
  },
  byCountry: async (params?: { from?: string; to?: string }) => {
    const { data } = await api.get("/reports/by-country", { params });
    return data;
  },
  byDevice: async (params?: { from?: string; to?: string }) => {
    const { data } = await api.get("/reports/by-device", { params });
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────────────────────────────────────
export const transactionsEndpoints = {
  conversions: async (params?: {
    from?: string;
    to?: string;
    offerId?: string;
    status?: string;
    page?: number;
  }) => {
    const { data } = await api.get("/transactions/conversions", { params });
    return data;
  },
  clicks: async (params?: {
    from?: string;
    to?: string;
    invalid?: boolean;
    page?: number;
  }) => {
    const { data } = await api.get("/transactions/clicks", { params });
    return data;
  },
  postbacks: async (params?: { from?: string; to?: string }) => {
    const { data } = await api.get("/transactions/postbacks", { params });
    return data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Team  (supervisors managing their direct subordinates)
// ─────────────────────────────────────────────────────────────────────────────
export const teamEndpoints = {
  // Admin → lists Basic Subs; Basic Sub → lists their Managers
  list: async () => {
    const { data } = await api.get("/team");
    return data;
  },
  member: async (userId: string) => {
    const { data } = await api.get(`/team/${userId}`);
    return data;
  },
};
