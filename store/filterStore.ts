import { create } from "zustand";
import { GhgScope } from "@/types";

type YearRange = "2024" | "2025" | "both";

interface FilterState {
  scope: GhgScope | "all";
  yearRange: YearRange;
  setScope: (scope: GhgScope | "all") => void;
  setYearRange: (yearRange: YearRange) => void;
  reset: () => void;
}

const defaultState = {
  scope: "all" as const,
  yearRange: "both" as const,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...defaultState,
  setScope: (scope) => set({ scope }),
  setYearRange: (yearRange) => set({ yearRange }),
  reset: () => set(defaultState),
}));
