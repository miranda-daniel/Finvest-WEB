import { create } from 'zustand';

interface DashboardStore {
  selectedPortfolioId: string | null; // null = "All Portfolios"
  setSelectedPortfolio: (id: string | null) => void;
}

export const useDashboardStore = create<DashboardStore>()((set) => ({
  selectedPortfolioId: null,
  setSelectedPortfolio: (id) => set({ selectedPortfolioId: id }),
}));
