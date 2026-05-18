import { EmissionSource } from "@/types";

// 배출계수(emissionFactor) 출처: IPCC 2006 가이드라인 / GHG Protocol
// 단위: tCO2e / unit (1단위 사용 시 발생하는 온실가스 톤)
export const EMISSION_SOURCES: EmissionSource[] = [
  // -- Scope 1: 직접 배출 ----------

  // 이동 연소: 차량, 선박 등 연료 연소
  {
    id: "gasoline",
    name: "휘발유",
    scope: "scope1",
    category: "mobile_combustion",
    emissionFactor: 0.00231, // tCO2e/liter
    unit: "liter",
  },
  {
    id: "diesel",
    name: "경유",
    scope: "scope1",
    category: "mobile_combustion",
    emissionFactor: 0.00268, // tCO2e/liter
    unit: "liter",
  },

  // 고정 연소: 공장 보일러, 발전기 등
  {
    id: "natural_gas",
    name: "천연가스",
    scope: "scope1",
    category: "stationary_combustion",
    emissionFactor: 0.00204, // tCO2e/m³
    unit: "m³",
  },
  {
    id: "coal",
    name: "석탄",
    scope: "scope1",
    category: "stationary_combustion",
    emissionFactor: 2.42, // tCO2e/ton — 철강 제조의 주요 배출원
    unit: "ton",
  },

  // -- Scope 2: 간접 배출 (구매 에너지) --------------

  // 국가마다 전력 생산 방식이 달라 배출계수가 다름
  // 한국은 석탄 비중이 높아 배출계수가 높음
  {
    id: "electricity_kr",
    name: "전력 (한국)",
    scope: "scope2",
    category: "purchased_electricity",
    emissionFactor: 0.000416, // tCO2e/kWh — 한국 전력 배출계수 2023
    unit: "kWh",
  },
  {
    id: "electricity_us",
    name: "전력 (미국)",
    scope: "scope2",
    category: "purchased_electricity",
    emissionFactor: 0.000386, // tCO2e/kWh — 미국 평균
    unit: "kWh",
  },
  {
    id: "electricity_eu",
    name: "전력 (유럽)",
    scope: "scope2",
    category: "purchased_electricity",
    emissionFactor: 0.000276, // tCO2e/kWh — EU 평균 (재생에너지 비중 높음)
    unit: "kWh",
  },
  {
    id: "steam",
    name: "스팀/증기",
    scope: "scope2",
    category: "purchased_heat",
    emissionFactor: 0.058, // tCO2e/GJ
    unit: "GJ",
  },

  // -- Scope 3: 기타 간접 배출 --------------

  {
    id: "air_travel",
    name: "항공 출장",
    scope: "scope3",
    category: "business_travel",
    emissionFactor: 0.000255, // tCO2e/km (이코노미 기준)
    unit: "km",
  },
  {
    id: "supply_chain",
    name: "공급망 운송",
    scope: "scope3",
    category: "supply_chain",
    emissionFactor: 0.00012, // tCO2e/ton·km — 도로 화물 평균
    unit: "ton·km",
  },
  {
    id: "waste_landfill",
    name: "매립 폐기물",
    scope: "scope3",
    category: "waste",
    emissionFactor: 0.467, // tCO2e/ton
    unit: "ton",
  },
];

export const getSource = (id: string): EmissionSource | undefined =>
  EMISSION_SOURCES.find((s) => s.id === id);
