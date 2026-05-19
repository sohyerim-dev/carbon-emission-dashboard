import { create } from "zustand";
import { Currency } from "@/types";
import { CARBON_MARKETS } from "@/lib/data/markets";

type MarketId = "k-ets" | "ca-cap" | "eu-ets" | "custom";

interface TaxState {
  selectedMarketId: MarketId;
  carbonPrice: number; // USD/tCO2e
  currency: Currency;
  targetReductionRate: number; // 0~1 (예: 0.3 = 30% 감축)
  setMarket: (marketId: MarketId) => void;
  setCustomPrice: (price: number) => void;
  setCurrency: (currency: Currency) => void;
  setReductionRate: (rate: number) => void;
}

// 초기값: K-ETS 기준
const defaultMarket = CARBON_MARKETS.find((m) => m.id === "k-ets")!;

export const useTaxStore = create<TaxState>((set) => ({
  selectedMarketId: "k-ets",
  carbonPrice: defaultMarket.price,
  currency: "USD",
  targetReductionRate: 0.3,

  // 프리셋 선택 시 carbonPrice 자동 업데이트, 커스텀은 현재 price 유지
  setMarket: (marketId) => {
    const market = CARBON_MARKETS.find((m) => m.id === marketId);
    set((state) => ({
      selectedMarketId: marketId,
      carbonPrice: market && marketId !== "custom" ? market.price : state.carbonPrice,
    }));
  },

  setCustomPrice: (price) => set({ carbonPrice: price }),
  setCurrency: (currency) => set({ currency }),
  setReductionRate: (rate) => set({ targetReductionRate: rate }),
}));
