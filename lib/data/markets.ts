import { CarbonMarket } from "@/types";

// 전 세계 주요 탄소 배출권 거래 시장
// 출처: World Bank Carbon Pricing Dashboard (2025년 기준)
// https://carbonpricingdashboard.worldbank.org/compliance/price
export const CARBON_MARKETS: CarbonMarket[] = [
  {
    id: "k-ets",
    name: "K-ETS",
    price: 6.45,
    region: "한국",
    description: "한국 배출권 거래제. 아시아 최초의 국가 단위 ETS.",
  },
  {
    id: "ca-cap",
    name: "California CaT",
    price: 29.27,
    region: "미국 캘리포니아",
    description: "캘리포니아 cap-and-trade 프로그램. 북미 최대 탄소 시장.",
  },
  {
    id: "eu-ets",
    name: "EU ETS",
    price: 70.37,
    region: "유럽연합",
    description: "세계 최대 탄소 배출권 거래제. 가장 강력한 탄소 규제.",
  },
  {
    id: "custom",
    name: "커스텀",
    price: 50,
    region: "직접 설정",
    description: "탄소 가격을 직접 입력해 시뮬레이션할 수 있습니다.",
  },
];

export const getMarket = (id: string): CarbonMarket | undefined =>
  CARBON_MARKETS.find((m) => m.id === id);
