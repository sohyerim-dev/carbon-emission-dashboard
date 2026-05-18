import { Company, GhgEmission, GhgScope } from "@/types";

// 아래 기업 및 배출량 데이터는 대시보드 시연을 위한 가상 데이터입니다.
// 배출계수는 IPCC 2006 가이드라인 / GHG Protocol 기준값을 사용했습니다.

const MONTHS = [
  "2024-01",
  "2024-02",
  "2024-03",
  "2024-04",
  "2024-05",
  "2024-06",
  "2024-07",
  "2024-08",
  "2024-09",
  "2024-10",
  "2024-11",
  "2024-12",
  "2025-01",
  "2025-02",
  "2025-03",
  "2025-04",
  "2025-05",
  "2025-06",
  "2025-07",
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
];

type EmissionConfig = {
  sourceId: string;
  scope: GhgScope;
  baseActivity: number; // 월 기준 사용량 (계절 패턴 적용 전)
  seasonalPattern: number[]; // 12개월 계수
  emissionFactor: number; // tCO2e/unit
  yearReductionRate?: number; // 2025년 감축률 (기본값 5%)
};

// 기업 ID + 배출원 설정 목록을 받아서 24개월치 배출 데이터를 자동 생성하는 헬퍼 함수
function buildEmissions(
  companyId: string,
  configs: EmissionConfig[],
): GhgEmission[] {
  const result: GhgEmission[] = [];

  MONTHS.forEach((yearMonth, i) => {
    const monthIndex = i % 12;
    // i=0 -> 0(1월), i=12 -> 0(1월), i=13 -> 1(2월)
    // 2024년이든 2025년이든 같은 계절 패턴 재사용
    const is2025 = yearMonth.startsWith("2025");
    // 2025년 데이터면 감축률 적용하기 위해

    configs.forEach((config) => {
      const reductionRate = config.yearReductionRate ?? 0.05;
      // yearReductionRate가 없으면 기본값 0.05 (5%) 사용

      const yearFactor = is2025 ? 1 - reductionRate : 1;
      // 2024년 -> yearFactor = 1 (그대로)
      // 2025년 -> yearFactor = 0.95 (5% 감축)

      const activityData = Math.round(
        // 반올림하여 정수로 만들기
        config.baseActivity * // 월 기준값 (예: 67,000 liter)
          config.seasonalPattern[monthIndex] * // 계절 계수 (예: 1.3)
          yearFactor, // 연도 감축 (예: 0.95)
      );
      // 예: 67,000 x 1.3 × 0.95 = 82,745 -> Math.round(반올림) -> 82,745

      const emissions =
        Math.round(activityData * config.emissionFactor * 100) / 100;
      // activityData x emissionFactor = tCO2e
      // × 100 / 100 -> 소수점 둘째 자리까지만 보관

      result.push({
        id: `${companyId}-${config.sourceId}-${yearMonth}`,
        yearMonth,
        sourceId: config.sourceId,
        scope: config.scope,
        activityData,
        emissions,
      });
    });
  });

  return result;
}

// -- Acme Manufacturing (제조업, 한국) ----------
// Scope 1(천연가스, 경유) + Scope 2(전력, 스팀) 중심
// 겨울 난방(천연가스) 증가, 여름 냉방(전력) 증가
const acmeEmissions = buildEmissions("acme", [
  {
    sourceId: "natural_gas",
    scope: "scope1",
    baseActivity: 67000, // m³/month
    emissionFactor: 0.00204,
    seasonalPattern: [
      1.3, 1.2, 1.1, 0.9, 0.8, 0.7, 0.7, 0.7, 0.9, 1.0, 1.1, 1.3,
    ],
  },
  {
    sourceId: "diesel",
    scope: "scope1",
    baseActivity: 25000, // liter/month
    emissionFactor: 0.00268,
    seasonalPattern: [
      1.0, 0.95, 1.0, 1.0, 1.0, 0.95, 0.9, 0.9, 1.0, 1.05, 1.1, 1.05,
    ],
  },
  {
    sourceId: "electricity_kr",
    scope: "scope2",
    baseActivity: 500000, // kWh/month
    emissionFactor: 0.000416,
    seasonalPattern: [
      0.85, 0.85, 0.9, 0.95, 1.05, 1.15, 1.25, 1.2, 1.05, 0.95, 0.85, 0.9,
    ],
  },
  {
    sourceId: "steam",
    scope: "scope2",
    baseActivity: 1250, // GJ/month
    emissionFactor: 0.058,
    seasonalPattern: [
      1.2, 1.15, 1.0, 0.9, 0.85, 0.8, 0.75, 0.8, 0.9, 1.0, 1.1, 1.2,
    ],
  },
]);

// -- Globex Logistics (운송·물류, 미국) ----------
// Scope 1(경유, 휘발유) 압도적, Scope 3(출장) 포함
// Q4(10~12월) 연말 배송 급증
const globexEmissions = buildEmissions("globex", [
  {
    sourceId: "diesel",
    scope: "scope1",
    baseActivity: 67000, // liter/month
    emissionFactor: 0.00268,
    seasonalPattern: [
      0.85, 0.8, 0.9, 0.9, 0.95, 0.95, 1.0, 0.95, 1.0, 1.1, 1.25, 1.3,
    ],
  },
  {
    sourceId: "gasoline",
    scope: "scope1",
    baseActivity: 17000, // liter/month
    emissionFactor: 0.00231,
    seasonalPattern: [
      0.85, 0.8, 0.9, 0.9, 0.95, 0.95, 1.0, 0.95, 1.0, 1.1, 1.25, 1.3,
    ],
  },
  {
    sourceId: "electricity_us",
    scope: "scope2",
    baseActivity: 167000, // kWh/month (창고 전력)
    emissionFactor: 0.000386,
    seasonalPattern: [
      1.0, 0.95, 1.0, 1.0, 1.0, 1.0, 1.05, 1.05, 1.0, 1.0, 1.0, 1.0,
    ],
  },
  {
    sourceId: "air_travel",
    scope: "scope3",
    baseActivity: 125000, // km/month
    emissionFactor: 0.000255,
    seasonalPattern: [
      1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.0, 1.0, 0.9, 0.9, 0.9,
    ],
  },
]);

// -- Initech Steel (중공업, 독일) ----------
// Scope 1(석탄) 압도적 — 철강은 세계 최대 탄소 집약 산업 중 하나
// 7~8월 정기 설비점검으로 생산량 감소
// EU 규제로 감축 속도는 다른 산업 대비 느림
const initechEmissions = buildEmissions("initech", [
  {
    sourceId: "coal",
    scope: "scope1",
    baseActivity: 500, // ton/month
    emissionFactor: 2.42,
    seasonalPattern: [
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.85, 0.85, 1.0, 1.0, 1.0, 1.0,
    ],
    yearReductionRate: 0.03, // 철강업 특성상 감축이 느림
  },
  {
    sourceId: "natural_gas",
    scope: "scope1",
    baseActivity: 100000, // m³/month
    emissionFactor: 0.00204,
    seasonalPattern: [
      1.1, 1.1, 1.0, 0.95, 0.9, 0.9, 0.9, 0.9, 0.95, 1.0, 1.1, 1.1,
    ],
    yearReductionRate: 0.03,
  },
  {
    sourceId: "electricity_eu",
    scope: "scope2",
    baseActivity: 167000, // kWh/month
    emissionFactor: 0.000276,
    seasonalPattern: [
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.9, 0.9, 1.0, 1.0, 1.0, 1.0,
    ],
    yearReductionRate: 0.08, // EU 재생에너지 전환으로 전력 배출계수 빠르게 감소
  },
]);

// -- Umbrella Tech (IT·기술, 미국) ----------
// Scope 2(전력) 중심 — 데이터센터 전력 소비가 대부분
// Q1·Q3 컨퍼런스 시즌에 출장 증가
// IT 기업 특성상 재생에너지 전환 적극적 (감축률 10%)
const umbrellaEmissions = buildEmissions("umbrella", [
  {
    sourceId: "electricity_us",
    scope: "scope2",
    baseActivity: 216000, // kWh/month (데이터센터)
    emissionFactor: 0.000386,
    seasonalPattern: [
      1.05, 1.0, 1.05, 1.0, 1.0, 1.0, 1.05, 1.0, 1.05, 1.0, 0.9, 0.85,
    ],
    yearReductionRate: 0.1,
  },
  {
    sourceId: "air_travel",
    scope: "scope3",
    baseActivity: 65000, // km/month
    emissionFactor: 0.000255,
    seasonalPattern: [
      1.2, 1.1, 1.0, 0.9, 0.9, 0.9, 1.2, 1.1, 1.0, 0.9, 0.9, 0.8,
    ],
  },
]);

// -- 한성 리테일 (소매·유통, 한국) ---------
// Scope 3(공급망) 중심 — 유통업 특성상 공급망 배출 비중 높음
// Q4(블랙프라이데이, 연말 행사) 배출 급증
const hansungEmissions = buildEmissions("hansung", [
  {
    sourceId: "electricity_kr",
    scope: "scope2",
    baseActivity: 140000, // kWh/month (매장 전력)
    emissionFactor: 0.000416,
    seasonalPattern: [
      0.9, 0.85, 0.9, 0.9, 0.95, 0.95, 1.05, 1.05, 0.95, 1.05, 1.15, 1.3,
    ],
  },
  {
    sourceId: "supply_chain",
    scope: "scope3",
    baseActivity: 700000, // ton·km/month (상품 운송)
    emissionFactor: 0.00012,
    seasonalPattern: [
      0.85, 0.8, 0.9, 0.9, 0.95, 0.95, 1.0, 0.95, 1.0, 1.1, 1.25, 1.3,
    ],
  },
  {
    sourceId: "waste_landfill",
    scope: "scope3",
    baseActivity: 36, // ton/month
    emissionFactor: 0.467,
    seasonalPattern: [
      0.9, 0.85, 0.9, 0.9, 0.95, 0.95, 1.0, 0.95, 1.0, 1.05, 1.15, 1.2,
    ],
  },
  {
    sourceId: "air_travel",
    scope: "scope3",
    baseActivity: 33000, // km/month
    emissionFactor: 0.000255,
    seasonalPattern: [
      1.0, 0.9, 1.0, 1.0, 1.0, 1.0, 1.1, 1.0, 1.0, 1.0, 1.0, 0.9,
    ],
  },
]);

export const COMPANIES: Company[] = [
  {
    id: "acme",
    name: "Acme Manufacturing",
    country: "KR",
    industry: "manufacturing",
    emissions: acmeEmissions,
  },
  {
    id: "globex",
    name: "Globex Logistics",
    country: "US",
    industry: "logistics",
    emissions: globexEmissions,
  },
  {
    id: "initech",
    name: "Initech Steel",
    country: "DE",
    industry: "heavy_industry",
    emissions: initechEmissions,
  },
  {
    id: "umbrella",
    name: "Umbrella Tech",
    country: "US",
    industry: "technology",
    emissions: umbrellaEmissions,
  },
  {
    id: "hansung",
    name: "한성 리테일",
    country: "KR",
    industry: "retail",
    emissions: hansungEmissions,
  },
];

export const getCompany = (id: string): Company | undefined =>
  COMPANIES.find((c) => c.id === id);
