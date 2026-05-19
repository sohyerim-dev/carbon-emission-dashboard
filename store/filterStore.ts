import { create } from "zustand";
import { GhgScope, Period } from "@/types";

interface FilterState {
  scope: GhgScope | "all";
  period: Period;
  setScope: (scope: GhgScope | "all") => void;
  setPeriod: (period: Period) => void;
  reset: () => void;
}

const defaultState = {
  scope: "all" as const,
  period: "all" as Period,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...defaultState,
  setScope: (scope) => set({ scope }),
  setPeriod: (period) => set({ period }),
  reset: () => set(defaultState),
}));
