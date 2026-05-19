"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import { fetchCompanies } from "@/lib/api";
import { Company, GhgScope, Industry } from "@/types";
import Card from "@/components/ui/Card";

// ── 상수 ──────────────────────────────────────────────────────────────────
const SCOPE_COLORS: Record<GhgScope, string> = {
  scope1: "#43c59e",
  scope2: "#3ab5d4",
  scope3: "#4f8ef7",
};

const COMPANY_COLORS = ["#43c59e", "#4f8ef7", "#f59e0b", "#f87171", "#8b5cf6"];

const INDUSTRY_LABEL: Record<Industry, string> = {
  manufacturing:  "제조업",
  logistics:      "물류·운송",
  heavy_industry: "중공업",
  technology:     "IT·기술",
  retail:         "소매·유통",
};

const MONTHS_2024 = Array.from({ length: 12 }, (_, i) => `2024-${String(i + 1).padStart(2, "0")}`);
const MONTHS_2025 = Array.from({ length: 12 }, (_, i) => `2025-${String(i + 1).padStart(2, "0")}`);

const TABS = [
  { id: "company",  label: "기업 비교"  },
  { id: "industry", label: "산업군 비교" },
  { id: "scope",    label: "Scope 상세" },
  { id: "trend",    label: "기간 추이"  },
  { id: "source",   label: "Source 분석" },
  { id: "yoy",      label: "YoY 분석"  },
] as const;

type TabId = typeof TABS[number]["id"];

// ── 공통 유틸 ──────────────────────────────────────────────────────────────
function scopeSum(emissions: Company["emissions"], months?: string[]) {
  const rows = months ? emissions.filter((e) => months.includes(e.yearMonth)) : emissions;
  return {
    scope1: rows.filter((e) => e.scope === "scope1").reduce((s, e) => s + e.emissions, 0),
    scope2: rows.filter((e) => e.scope === "scope2").reduce((s, e) => s + e.emissions, 0),
    scope3: rows.filter((e) => e.scope === "scope3").reduce((s, e) => s + e.emissions, 0),
  };
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

// ── 공용 선택 UI ───────────────────────────────────────────────────────────
function CompanySelect({
  companies, value, onChange,
}: { companies: Company[]; value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs px-3 py-1.5 rounded-lg border outline-none"
      style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
    >
      <option value="all">전체 기업</option>
      {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
    </select>
  );
}

function YearToggle({ value, onChange }: { value: "all" | "2024" | "2025"; onChange: (v: "all" | "2024" | "2025") => void }) {
  return (
    <div className="flex gap-1">
      {(["all", "2024", "2025"] as const).map((y) => (
        <button
          key={y}
          onClick={() => onChange(y)}
          className="px-2.5 py-1 text-xs rounded-lg transition-all"
          style={{
            background: value === y ? "linear-gradient(135deg,#43c59e,#4f8ef7)" : "var(--bg-base)",
            color: value === y ? "#fff" : "var(--text-secondary)",
            border: value === y ? "none" : "1px solid var(--border-subtle)",
          }}
        >
          {y === "all" ? "전체" : y}
        </button>
      ))}
    </div>
  );
}

const TOOLTIP_STYLE = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: 8,
  fontSize: 12,
};

// ── Tab 1: 기업 비교 ───────────────────────────────────────────────────────
function CompanyComparison({ companies }: { companies: Company[] }) {
  const [selected, setSelected] = useState<string[]>(companies.slice(0, 3).map((c) => c.id));
  const [year, setYear] = useState<"all" | "2024" | "2025">("all");

  const months = year === "all" ? undefined
    : year === "2024" ? MONTHS_2024 : MONTHS_2025;

  const active = companies.filter((c) => selected.includes(c.id));

  const radarData = (["scope1", "scope2", "scope3"] as GhgScope[]).map((scope) => {
    const row: Record<string, string | number> = { scope: scope.replace("scope", "Scope ") };
    active.forEach((c) => {
      row[c.name] = Math.round(scopeSum(c.emissions, months)[scope]);
    });
    return row;
  });

  const tableRows = active
    .map((c) => {
      const s = scopeSum(c.emissions, months);
      return { ...c, ...s, total: s.scope1 + s.scope2 + s.scope3 };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            비교 기업 선택 <span style={{ color: "var(--text-muted)" }}>(최대 5개)</span>
          </p>
          <div className="ml-auto"><YearToggle value={year} onChange={setYear} /></div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {companies.map((c, i) => {
            const on = selected.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() =>
                  setSelected((prev) =>
                    on ? prev.filter((id) => id !== c.id)
                       : prev.length < 5 ? [...prev, c.id] : prev,
                  )
                }
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: on ? `${COMPANY_COLORS[i % 5]}18` : "var(--bg-base)",
                  color: on ? COMPANY_COLORS[i % 5] : "var(--text-secondary)",
                  border: `1px solid ${on ? COMPANY_COLORS[i % 5] + "60" : "var(--border-subtle)"}`,
                  fontWeight: on ? 600 : 400,
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar */}
        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Scope별 배출량 레이더
          </p>
          <ResponsiveContainer width="100%" height={270}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="var(--border-subtle)" />
              <PolarAngleAxis dataKey="scope" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <PolarRadiusAxis
                tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              {active.map((c, i) => (
                <Radar
                  key={c.id}
                  name={c.name}
                  dataKey={c.name}
                  stroke={COMPANY_COLORS[i % 5]}
                  fill={COMPANY_COLORS[i % 5]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [`${fmt(Number(v))} tCO₂e`]}
                contentStyle={TOOLTIP_STYLE}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Scope bar 비교 */}
        <Card>
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Scope 구성 비교
          </p>
          <div className="space-y-4">
            {tableRows.map((c, i) => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium" style={{ color: COMPANY_COLORS[i % 5] }}>
                    {c.name}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {fmt(c.total)} tCO₂e
                  </span>
                </div>
                <div className="flex h-2.5 rounded-full overflow-hidden">
                  {(["scope1", "scope2", "scope3"] as GhgScope[]).map((scope) => (
                    <div
                      key={scope}
                      title={`${scope}: ${fmt(c[scope])} tCO₂e`}
                      style={{
                        width: `${c.total > 0 ? (c[scope] / c.total) * 100 : 0}%`,
                        background: SCOPE_COLORS[scope],
                      }}
                    />
                  ))}
                </div>
                <div className="flex gap-4 mt-1">
                  {(["scope1", "scope2", "scope3"] as GhgScope[]).map((scope) => (
                    <span key={scope} className="text-xs" style={{ color: SCOPE_COLORS[scope] }}>
                      S{scope.slice(-1)}: {fmt(c[scope])}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Tab 2: 산업군 비교 ─────────────────────────────────────────────────────
function IndustryComparison({ companies }: { companies: Company[] }) {
  const data = useMemo(() => {
    const industries = [...new Set(companies.map((c) => c.industry))] as Industry[];
    return industries
      .map((ind) => {
        const group = companies.filter((c) => c.industry === ind);
        const s = group.reduce(
          (acc, c) => {
            const t = scopeSum(c.emissions);
            acc.scope1 += t.scope1;
            acc.scope2 += t.scope2;
            acc.scope3 += t.scope3;
            return acc;
          },
          { scope1: 0, scope2: 0, scope3: 0 },
        );
        return {
          name: INDUSTRY_LABEL[ind],
          scope1: Math.round(s.scope1),
          scope2: Math.round(s.scope2),
          scope3: Math.round(s.scope3),
          total: Math.round(s.scope1 + s.scope2 + s.scope3),
          companies: group.map((c) => c.name).join(" · "),
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [companies]);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          산업군별 누적 배출량 (Scope 분해)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              width={60}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(v, name) => [`${fmt(Number(v))} tCO₂e`, name]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill={SCOPE_COLORS.scope1} />
            <Bar dataKey="scope2" name="Scope 2" stackId="a" fill={SCOPE_COLORS.scope2} />
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill={SCOPE_COLORS.scope3} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map((d) => (
          <Card key={d.name}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{d.name}</p>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                {fmt(d.total)} tCO₂e
              </span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden mb-2">
              {(["scope1", "scope2", "scope3"] as GhgScope[]).map((scope) => (
                <div
                  key={scope}
                  style={{
                    width: `${d.total > 0 ? (d[scope] / d.total) * 100 : 0}%`,
                    background: SCOPE_COLORS[scope],
                  }}
                />
              ))}
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{d.companies}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Tab 3: Scope별 상세 ────────────────────────────────────────────────────
function ScopeDetail({ companies }: { companies: Company[] }) {
  const [companyId, setCompanyId] = useState("all");
  const [drill, setDrill] = useState<GhgScope | null>(null);

  const emissions = companyId === "all"
    ? companies.flatMap((c) => c.emissions)
    : (companies.find((c) => c.id === companyId)?.emissions ?? []);

  const totals = scopeSum(emissions);
  const grand = totals.scope1 + totals.scope2 + totals.scope3;

  const sourceData = useMemo(() => {
    const filtered = drill ? emissions.filter((e) => e.scope === drill) : emissions;
    const bySource: Record<string, { value: number; scope: GhgScope }> = {};
    filtered.forEach((e) => {
      if (!bySource[e.sourceId]) bySource[e.sourceId] = { value: 0, scope: e.scope as GhgScope };
      bySource[e.sourceId].value += e.emissions;
    });
    return Object.entries(bySource)
      .map(([id, { value, scope }]) => ({
        name: id.replace(/_/g, " "),
        value: Math.round(value),
        scope,
      }))
      .sort((a, b) => b.value - a.value);
  }, [emissions, drill]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Scope 비중 <span className="font-normal text-xs ml-1" style={{ color: "var(--text-muted)" }}>
              — 클릭하면 해당 Scope의 Source로 drill-down
            </span>
          </p>
          <CompanySelect companies={companies} value={companyId} onChange={setCompanyId} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(["scope1", "scope2", "scope3"] as GhgScope[]).map((scope) => {
            const val = totals[scope];
            const pct = grand > 0 ? (val / grand) * 100 : 0;
            const active = drill === scope;
            return (
              <button
                key={scope}
                onClick={() => setDrill(active ? null : scope)}
                className="p-4 rounded-xl border text-left transition-all"
                style={{
                  background: active ? `${SCOPE_COLORS[scope]}12` : "var(--bg-base)",
                  borderColor: active ? `${SCOPE_COLORS[scope]}80` : "var(--border-subtle)",
                  outline: active ? `2px solid ${SCOPE_COLORS[scope]}40` : "none",
                }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color: SCOPE_COLORS[scope] }}>
                  {scope.replace("scope", "Scope ")}
                </p>
                <p className="text-2xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                  {pct.toFixed(1)}%
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {fmt(val)} tCO₂e
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          {drill ? `${drill.replace("scope", "Scope ")} — Source 분해` : "전체 Source 분해"}
          {drill && (
            <button
              className="ml-2 text-xs underline"
              style={{ color: "var(--text-muted)" }}
              onClick={() => setDrill(null)}
            >
              전체 보기
            </button>
          )}
        </p>
        <ResponsiveContainer width="100%" height={Math.max(180, sourceData.length * 38)}>
          <BarChart data={sourceData} layout="vertical" margin={{ top: 0, right: 60, left: 80, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} width={90} />
            <Tooltip
              formatter={(v) => [`${fmt(Number(v))} tCO₂e`]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Bar
              dataKey="value"
              name="배출량"
              radius={[0, 4, 4, 0]}
              fill={drill ? SCOPE_COLORS[drill] : "#4f8ef7"}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ── Tab 4: 기간 추이 ───────────────────────────────────────────────────────
function PeriodTrend({ companies }: { companies: Company[] }) {
  const [companyId, setCompanyId] = useState("all");
  const [year, setYear] = useState<"all" | "2024" | "2025">("all");

  const months = year === "all"
    ? [...MONTHS_2024, ...MONTHS_2025]
    : year === "2024" ? MONTHS_2024 : MONTHS_2025;

  const emissions = companyId === "all"
    ? companies.flatMap((c) => c.emissions)
    : (companies.find((c) => c.id === companyId)?.emissions ?? []);

  const data = months.map((ym) => {
    const forMonth = emissions.filter((e) => e.yearMonth === ym);
    const [yr, m] = ym.split("-");
    return {
      month: year === "all" ? `${yr.slice(2)}.${m}` : `${parseInt(m)}월`,
      scope1: Math.round(forMonth.filter((e) => e.scope === "scope1").reduce((s, e) => s + e.emissions, 0)),
      scope2: Math.round(forMonth.filter((e) => e.scope === "scope2").reduce((s, e) => s + e.emissions, 0)),
      scope3: Math.round(forMonth.filter((e) => e.scope === "scope3").reduce((s, e) => s + e.emissions, 0)),
    };
  });

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>월별 Scope 배출 추이</p>
        <div className="ml-auto flex items-center gap-2">
          <CompanySelect companies={companies} value={companyId} onChange={setCompanyId} />
          <YearToggle value={year} onChange={setYear} />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            interval={year === "all" ? 3 : 0}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            width={55}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(v, name) => [`${fmt(Number(v))} tCO₂e`, name]}
            contentStyle={TOOLTIP_STYLE}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {(["scope1", "scope2", "scope3"] as GhgScope[]).map((scope) => (
            <Line
              key={scope}
              type="monotone"
              dataKey={scope}
              name={scope.replace("scope", "Scope ")}
              stroke={SCOPE_COLORS[scope]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ── Tab 5: Source 분석 ─────────────────────────────────────────────────────
function SourceBreakdown({ companies }: { companies: Company[] }) {
  const [companyId, setCompanyId] = useState("all");
  const [scope, setScope] = useState<GhgScope | "all">("all");

  const data = useMemo(() => {
    const base = companyId === "all"
      ? companies.flatMap((c) => c.emissions)
      : (companies.find((c) => c.id === companyId)?.emissions ?? []);
    const filtered = scope === "all" ? base : base.filter((e) => e.scope === scope);

    const bySource: Record<string, { value: number; scope: GhgScope }> = {};
    filtered.forEach((e) => {
      if (!bySource[e.sourceId]) bySource[e.sourceId] = { value: 0, scope: e.scope as GhgScope };
      bySource[e.sourceId].value += e.emissions;
    });

    const total = Object.values(bySource).reduce((s, v) => s + v.value, 0);
    return Object.entries(bySource)
      .map(([id, { value, scope: sc }]) => ({
        name: id.replace(/_/g, " "),
        value: Math.round(value),
        pct: total > 0 ? (value / total) * 100 : 0,
        scope: sc,
      }))
      .sort((a, b) => b.value - a.value);
  }, [companies, companyId, scope]);

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Source별 기여 분석</p>
        <div className="ml-auto flex items-center gap-2">
          <CompanySelect companies={companies} value={companyId} onChange={setCompanyId} />
          <div className="flex gap-1">
            {(["all", "scope1", "scope2", "scope3"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className="px-2.5 py-1 text-xs rounded-lg transition-all"
                style={{
                  background: scope === s
                    ? s === "all" ? "linear-gradient(135deg,#43c59e,#4f8ef7)" : `${SCOPE_COLORS[s as GhgScope]}20`
                    : "var(--bg-base)",
                  color: scope === s
                    ? s === "all" ? "#fff" : SCOPE_COLORS[s as GhgScope]
                    : "var(--text-secondary)",
                  border: `1px solid ${scope === s && s !== "all" ? SCOPE_COLORS[s as GhgScope] + "60" : "var(--border-subtle)"}`,
                }}
              >
                {s === "all" ? "전체" : `S${s.slice(-1)}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0"
                  style={{ background: `${SCOPE_COLORS[d.scope]}18`, color: SCOPE_COLORS[d.scope] }}
                >
                  S{d.scope.slice(-1)}
                </span>
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{d.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono w-10 text-right" style={{ color: "var(--text-muted)" }}>
                  {d.pct.toFixed(1)}%
                </span>
                <span className="text-xs font-medium w-28 text-right" style={{ color: "var(--text-secondary)" }}>
                  {fmt(d.value)} tCO₂e
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "var(--border-subtle)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${d.pct}%`, background: SCOPE_COLORS[d.scope] }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Tab 6: YoY 분석 ────────────────────────────────────────────────────────
function YoYAnalysis({ companies }: { companies: Company[] }) {
  const [companyId, setCompanyId] = useState("all");

  const { monthly, total2024, total2025 } = useMemo(() => {
    const emissions = companyId === "all"
      ? companies.flatMap((c) => c.emissions)
      : (companies.find((c) => c.id === companyId)?.emissions ?? []);

    const monthly = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, "0");
      const y24 = emissions.filter((e) => e.yearMonth === `2024-${m}`).reduce((s, e) => s + e.emissions, 0);
      const y25 = emissions.filter((e) => e.yearMonth === `2025-${m}`).reduce((s, e) => s + e.emissions, 0);
      return {
        month: `${i + 1}월`,
        "2024": Math.round(y24),
        "2025": Math.round(y25),
        change: y24 > 0 ? ((y25 - y24) / y24) * 100 : 0,
      };
    });

    const total2024 = monthly.reduce((s, d) => s + d["2024"], 0);
    const total2025 = monthly.reduce((s, d) => s + d["2025"], 0);
    return { monthly, total2024, total2025 };
  }, [companies, companyId]);

  const totalChange = total2024 > 0 ? ((total2025 - total2024) / total2024) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* 요약 */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "2024 총 배출", value: fmt(total2024), unit: "tCO₂e", color: "#94a3b8" },
          { label: "2025 총 배출", value: fmt(total2025), unit: "tCO₂e", color: "#4f8ef7" },
          {
            label: "연간 변화율",
            value: `${totalChange >= 0 ? "+" : ""}${totalChange.toFixed(1)}%`,
            unit: "",
            color: totalChange < 0 ? "#43c59e" : "#f87171",
          },
        ].map((card) => (
          <Card key={card.label}>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{card.label}</p>
            <p className="text-2xl font-bold font-mono" style={{ color: card.color }}>
              {card.value}
              {card.unit && (
                <span className="text-sm font-normal ml-1" style={{ color: "var(--text-muted)" }}>{card.unit}</span>
              )}
            </p>
          </Card>
        ))}
      </div>

      {/* 막대 비교 */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>월별 2024 vs 2025</p>
          <div className="ml-auto">
            <CompanySelect companies={companies} value={companyId} onChange={setCompanyId} />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthly} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              width={55}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(v, name) => [`${fmt(Number(v))} tCO₂e`, `${name}년`]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => `${v}년`} />
            <Bar dataKey="2024" name="2024" fill="#94a3b8" radius={[3, 3, 0, 0]} />
            <Bar dataKey="2025" name="2025" fill="#4f8ef7" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 월별 변화율 그리드 */}
      <Card>
        <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>월별 YoY 변화율</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {monthly.map((d) => (
            <div
              key={d.month}
              className="p-3 rounded-xl text-center"
              style={{ background: "var(--bg-base)" }}
            >
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{d.month}</p>
              <p
                className="text-sm font-bold font-mono"
                style={{ color: d.change < 0 ? "#43c59e" : d.change > 0 ? "#f87171" : "#94a3b8" }}
              >
                {d.change >= 0 ? "+" : ""}{d.change.toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── 메인 ──────────────────────────────────────────────────────────────────
export default function AnalysisContent() {
  const [tab, setTab] = useState<TabId>("company");
  const { data: res, isLoading } = useSWR("companies", fetchCompanies);
  const companies = res?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl" style={{ background: "var(--border-subtle)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 탭 바 */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 text-sm rounded-lg transition-all font-medium"
            style={{
              background: tab === t.id ? "linear-gradient(135deg,#43c59e,#4f8ef7)" : "var(--bg-card)",
              color: tab === t.id ? "#fff" : "var(--text-secondary)",
              border: tab === t.id ? "none" : "1px solid var(--border-subtle)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "company"  && <CompanyComparison  companies={companies} />}
      {tab === "industry" && <IndustryComparison companies={companies} />}
      {tab === "scope"    && <ScopeDetail        companies={companies} />}
      {tab === "trend"    && <PeriodTrend         companies={companies} />}
      {tab === "source"   && <SourceBreakdown     companies={companies} />}
      {tab === "yoy"      && <YoYAnalysis          companies={companies} />}
    </div>
  );
}
