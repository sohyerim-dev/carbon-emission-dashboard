import { Company, GhgEmission, GhgScope, Period } from "@/types";

const MONTHS_2024 = Array.from({ length: 12 }, (_, i) => `2024-${String(i + 1).padStart(2, "0")}`);
const MONTHS_2025 = Array.from({ length: 12 }, (_, i) => `2025-${String(i + 1).padStart(2, "0")}`);
const ALL_MONTHS = [...MONTHS_2024, ...MONTHS_2025];

export function sumEmissions(emissions: GhgEmission[]): number {
  return emissions.reduce((sum, e) => sum + e.emissions, 0);
}

// 기간 → 포함 월 목록 반환
export function getMonthsForPeriod(period: Period): string[] {
  switch (period) {
    case "this_month": return ["2025-12"];
    case "3months":    return ["2025-10", "2025-11", "2025-12"];
    case "1year":      return MONTHS_2025;
    case "all":        return ALL_MONTHS;
    case "2024":       return MONTHS_2024;
    case "2025":       return MONTHS_2025;
  }
}

// 비교 기간 (전월/전분기/전년) 반환
function getPrevMonths(period: Period): string[] | null {
  switch (period) {
    case "this_month": return ["2025-11"];
    case "3months":    return ["2025-07", "2025-08", "2025-09"];
    case "1year":
    case "2025":
    case "all":        return MONTHS_2024;
    case "2024":       return null; // 비교 데이터 없음
  }
}

function getCompareLabel(period: Period): string {
  if (period === "this_month") return "전월 대비";
  if (period === "3months")    return "전분기 대비";
  return "전년 대비";
}

// 배출원 ID → 표시 카테고리 매핑
const SOURCE_CATEGORY_LABEL: Record<string, string> = {
  gasoline:        "이동 연소",
  diesel:          "이동 연소",
  natural_gas:     "고정 연소",
  coal:            "고정 연소",
  electricity_kr:  "구매 전력",
  electricity_us:  "구매 전력",
  electricity_eu:  "구매 전력",
  steam:           "구매 열·증기",
  air_travel:      "출장",
  supply_chain:    "공급망",
  waste_landfill:  "폐기물",
};

// 핵심 요약 카드 데이터 (기간 + 탄소 가격 반영)
export function calcSummary(companies: Company[], period: Period, carbonPrice: number) {
  const months = getMonthsForPeriod(period);
  const prevMonths = getPrevMonths(period);

  const all = companies.flatMap((c) => c.emissions);
  const current = all.filter((e) => months.includes(e.yearMonth));
  const prev = prevMonths ? all.filter((e) => prevMonths.includes(e.yearMonth)) : null;

  const totalEmissions = Math.round(sumEmissions(current));
  const prevTotal = prev ? sumEmissions(prev) : null;
  const compareChange = prevTotal && prevTotal > 0
    ? (sumEmissions(current) - prevTotal) / prevTotal
    : null;

  const estimatedTax = totalEmissions * carbonPrice; // USD

  return {
    totalEmissions,
    compareChange,
    compareLabel: getCompareLabel(period),
    estimatedTax,
    companyCount: companies.length,
  };
}

// Scope별 월간 트렌드 (LineChart용)
export function buildTrendData(companies: Company[], period: Period) {
  const months = getMonthsForPeriod(period);
  const all = companies.flatMap((c) => c.emissions);

  return months.map((yearMonth) => {
    const forMonth = all.filter((e) => e.yearMonth === yearMonth);
    const [year, month] = yearMonth.split("-");
    const label = period === "all" ? `${year.slice(2)}.${month}` : `${parseInt(month)}월`;
    return {
      month: label,
      scope1: Math.round(sumEmissions(forMonth.filter((e) => e.scope === "scope1"))),
      scope2: Math.round(sumEmissions(forMonth.filter((e) => e.scope === "scope2"))),
      scope3: Math.round(sumEmissions(forMonth.filter((e) => e.scope === "scope3"))),
    };
  });
}

// 기업별 Scope 스택 (BarChart용)
export function buildCompanyData(companies: Company[], period: Period) {
  const months = getMonthsForPeriod(period);
  return companies.map((company) => {
    const emissions = company.emissions.filter((e) => months.includes(e.yearMonth));
    return {
      name: company.name.split(" ")[0],
      fullName: company.name,
      scope1: Math.round(sumEmissions(emissions.filter((e) => e.scope === "scope1"))),
      scope2: Math.round(sumEmissions(emissions.filter((e) => e.scope === "scope2"))),
      scope3: Math.round(sumEmissions(emissions.filter((e) => e.scope === "scope3"))),
    };
  });
}

// 배출원 카테고리별 비중 (DonutChart용) — Scope 아닌 실제 발생 원인별
export function buildSourceDonutData(companies: Company[], period: Period) {
  const months = getMonthsForPeriod(period);
  const all = companies.flatMap((c) => c.emissions).filter((e) => months.includes(e.yearMonth));

  const grouped: Record<string, number> = {};
  for (const e of all) {
    const label = SOURCE_CATEGORY_LABEL[e.sourceId] ?? e.sourceId;
    grouped[label] = (grouped[label] ?? 0) + e.emissions;
  }

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
}

// 감축 성과 랭킹 (YoY 기준 — 기간 필터 무관하게 항상 2024→2025 비교)
export function buildReductionRanking(companies: Company[]) {
  return companies
    .map((company) => {
      const t2024 = sumEmissions(company.emissions.filter((e) => e.yearMonth.startsWith("2024")));
      const t2025 = sumEmissions(company.emissions.filter((e) => e.yearMonth.startsWith("2025")));
      return {
        id: company.id,
        name: company.name,
        industry: company.industry,
        total2024: Math.round(t2024),
        total2025: Math.round(t2025),
        reductionRate: ((t2024 - t2025) / t2024) * 100,
      };
    })
    .sort((a, b) => b.reductionRate - a.reductionRate);
}
