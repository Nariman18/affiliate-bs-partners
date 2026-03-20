import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Page =
  | "overview"
  | "news"
  | "offers"
  | "offer-detail"
  | "reports"
  | "transactions"
  | "billing"
  | "referrals"
  | "settings"
  | "affiliates"
  | "payouts"
  | "team"
  | "member-detail";

interface DateRange {
  from: string;
  to: string;
}

interface UIState {
  activePage: Page;
  selectedOfferId: string | null;
  selectedMemberId: string | null;
  // Report filters
  reportSubTab: string;
  reportDateRange: DateRange;
  // Transaction filters
  txTab: string;
  txDateRange: DateRange;
  // Payout filter
  payoutStatusFilter: string;
  // Sidebar collapsed
  sidebarCollapsed: boolean;
}

const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

const initialState: UIState = {
  activePage: "overview",
  selectedOfferId: null,
  selectedMemberId: null,
  reportSubTab: "General",
  reportDateRange: { from: thirtyDaysAgo, to: today },
  txTab: "Conversions",
  txDateRange: { from: thirtyDaysAgo, to: today },
  payoutStatusFilter: "all",
  sidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    navigateTo: (state, action: PayloadAction<Page>) => {
      state.activePage = action.payload;
      if (action.payload !== "offer-detail") state.selectedOfferId = null;
      if (action.payload !== "member-detail") state.selectedMemberId = null;
    },
    openOfferDetail: (state, action: PayloadAction<string>) => {
      state.selectedOfferId = action.payload;
      state.activePage = "offer-detail";
    },
    openMemberDetail: (state, action: PayloadAction<string>) => {
      state.selectedMemberId = action.payload;
      state.activePage = "member-detail";
    },
    setReportSubTab: (state, action: PayloadAction<string>) => {
      state.reportSubTab = action.payload;
    },
    setReportDateRange: (state, action: PayloadAction<DateRange>) => {
      state.reportDateRange = action.payload;
    },
    setTxTab: (state, action: PayloadAction<string>) => {
      state.txTab = action.payload;
    },
    setTxDateRange: (state, action: PayloadAction<DateRange>) => {
      state.txDateRange = action.payload;
    },
    setPayoutStatusFilter: (state, action: PayloadAction<string>) => {
      state.payoutStatusFilter = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const {
  navigateTo,
  openOfferDetail,
  openMemberDetail,
  setReportSubTab,
  setReportDateRange,
  setTxTab,
  setTxDateRange,
  setPayoutStatusFilter,
  toggleSidebar,
} = uiSlice.actions;
export default uiSlice.reducer;
