import { Country } from "@/types";

// 탄소 시장별 기준 탄소 가격 (USD/tCO2e)
// 출처: World Bank Carbon Pricing Dashboard (2025년 기준)
// https://carbonpricingdashboard.worldbank.org/compliance/price
// 실제 가격은 시장 상황에 따라 변동됨

export const COUNTRIES: Country[] = [
  {
    code: "KR",
    name: "한국",
    currency: "KRW",
    defaultCarbonPrice: 6.45, // K-ETS 기준
    flagEmoji: "🇰🇷",
  },
  {
    code: "US",
    name: "미국",
    currency: "USD",
    defaultCarbonPrice: 29.27, // California CaT 기준
    flagEmoji: "🇺🇸",
  },
  {
    code: "DE",
    name: "독일",
    currency: "EUR",
    defaultCarbonPrice: 70.37, // EU ETS 기준
    flagEmoji: "🇩🇪",
  },
];

// 국가 코드를 넣어서 해당 국가 데이터를 돌려주는 함수
export const getCountry = (code: string): Country | undefined =>
  COUNTRIES.find((c) => c.code === code);
