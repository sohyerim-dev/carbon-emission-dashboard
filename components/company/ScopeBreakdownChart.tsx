"use client";

import { Company } from "@/types";
import { sumEmissions } from "@/lib/utils/dashboard";
import ScopeDonutChart from "@/components/dashboard/ScopeDonutChart";

export default function ScopeBreakdownChart({ company }: { company: Company }) {
  const data = [
    {
      name: "Scope 1 (직접 배출)",
      value: Math.round(
        sumEmissions(company.emissions.filter((e) => e.scope === "scope1")),
      ),
    },
    {
      name: "Scope 2 (구매 에너지)",
      value: Math.round(
        sumEmissions(company.emissions.filter((e) => e.scope === "scope2")),
      ),
    },
    {
      name: "Scope 3 (가치사슬)",
      value: Math.round(
        sumEmissions(company.emissions.filter((e) => e.scope === "scope3")),
      ),
    },
  ].filter((d) => d.value > 0); // 값이 0인 Scope는 제외

  return <ScopeDonutChart data={data} />;
}
