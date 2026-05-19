import { Company } from "@/types";
import { getCountry } from "@/lib/data";
import { sumEmissions } from "@/lib/utils/dashboard";

const INDUSTRY_LABEL: Record<string, string> = {
  manufacturing: "제조업",
  logistics: "운송·물류",
  heavy_industry: "중공업",
  technology: "IT·기술",
  retail: "소매·유통",
};

const SCOPE_COLORS = {
  scope1: "var(--scope1)",
  scope2: "var(--scope2)",
  scope3: "var(--scope3)",
};

export default function CompanyHeader({ company }: { company: Company }) {
  const country = getCountry(company.country);

  const scope1 = Math.round(
    sumEmissions(company.emissions.filter((e) => e.scope === "scope1")),
  );
  const scope2 = Math.round(
    sumEmissions(company.emissions.filter((e) => e.scope === "scope2")),
  );
  const scope3 = Math.round(
    sumEmissions(company.emissions.filter((e) => e.scope === "scope3")),
  );
  const total = scope1 + scope2 + scope3;

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* 기업 정보 */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{country?.flagEmoji}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "var(--bg-base)",
                color: "var(--text-secondary)",
              }}
            >
              {INDUSTRY_LABEL[company.industry] ?? company.industry}
            </span>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {company.name}
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {country?.name} · 2024–2025 전체 기간
          </p>
        </div>

        {/* 총 배출량 */}
        <div className="text-right">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            총 배출량
          </p>
          <p
            className="text-3xl font-bold font-mono"
            style={{ color: "var(--text-primary)" }}
          >
            {total.toLocaleString()}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            tCO2e
          </p>
        </div>
      </div>

      {/* Scope 비중 바 */}
      <div className="mt-4">
        <div className="flex rounded-full overflow-hidden h-2">
          {[
            { scope: "scope1", value: scope1 },
            { scope: "scope2", value: scope2 },
            { scope: "scope3", value: scope3 },
          ].map(({ scope, value }) => (
            <div
              key={scope}
              style={{
                width: `${(value / total) * 100}%`,
                background: SCOPE_COLORS[scope as keyof typeof SCOPE_COLORS],
              }}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          {[
            { label: "Scope 1", value: scope1, scope: "scope1" },
            { label: "Scope 2", value: scope2, scope: "scope2" },
            { label: "Scope 3", value: scope3, scope: "scope3" },
          ].map(({ label, value, scope }) => (
            <div key={scope} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: SCOPE_COLORS[scope as keyof typeof SCOPE_COLORS],
                }}
              />
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {label}{" "}
                <span className="font-mono font-medium">
                  {value.toLocaleString()}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
