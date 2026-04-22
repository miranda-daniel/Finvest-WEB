import { create } from 'zustand';

interface DashboardStore {
  selectedPortfolioId: number | null; // null = "All Portfolios"
  setSelectedPortfolio: (id: number | null) => void;
}

export const useDashboardStore = create<DashboardStore>()((set) => ({
  selectedPortfolioId: null,
  setSelectedPortfolio: (id) => set({ selectedPortfolioId: id }),
}));
