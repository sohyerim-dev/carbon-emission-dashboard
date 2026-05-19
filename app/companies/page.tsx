"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetchCompanies } from "@/lib/api";
import { getCountry } from "@/lib/data";
import { sumEmissions } from "@/lib/utils/dashboard";
import { Company, Industry } from "@/types";

const INDUSTRY_LABEL: Record<Industry, string> = {
  manufacturing: "제조업",
  logistics: "운송·물류",
  heavy_industry: "중공업",
  technology: "IT·기술",
  retail: "소매·유통",
};

const INDUSTRY_OPTIONS = [
  { label: "전체 산업", value: "all" },
  ...Object.entries(INDUSTRY_LABEL).map(([value, label]) => ({ label, value })),
];

const COUNTRY_OPTIONS = [
  { label: "전체 국가", value: "all" },
  { label: "🇰🇷 한국", value: "KR" },
  { label: "🇺🇸 미국", value: "US" },
  { label: "🇩🇪 독일", value: "DE" },
];

const SCOPE_COLORS = {
  scope1: "#43c59e",
  scope2: "#3ab5d4",
  scope3: "#4f8ef7",
};

function CompanyCard({ company }: { company: Company }) {
  const country = getCountry(company.country);

  const s1 = sumEmissions(
    company.emissions.filter((e) => e.scope === "scope1"),
  );
  const s2 = sumEmissions(
    company.emissions.filter((e) => e.scope === "scope2"),
  );
  const s3 = sumEmissions(
    company.emissions.filter((e) => e.scope === "scope3"),
  );
  const total = s1 + s2 + s3;

  const t2024 = sumEmissions(
    company.emissions.filter((e) => e.yearMonth.startsWith("2024")),
  );
  const t2025 = sumEmissions(
    company.emissions.filter((e) => e.yearMonth.startsWith("2025")),
  );
  const yoy = t2024 > 0 ? ((t2024 - t2025) / t2024) * 100 : 0;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 transition-shadow hover:shadow-md"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span>{country?.flagEmoji}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--bg-base)",
                color: "var(--text-secondary)",
              }}
            >
              {INDUSTRY_LABEL[company.industry]}
            </span>
          </div>
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {company.name}
          </h3>
        </div>
        <span
          className="text-sm font-semibold font-mono"
          style={{ color: yoy >= 0 ? "#43c59e" : "#f87171" }}
        >
          {yoy >= 0 ? "↓" : "↑"} {Math.abs(yoy).toFixed(1)}%
        </span>
      </div>

      {/* 총 배출량 */}
      <div>
        <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
          총 배출량 (전체 기간)
        </p>
        <p
          className="text-xl font-bold font-mono"
          style={{ color: "var(--text-primary)" }}
        >
          {Math.round(total).toLocaleString()}
          <span
            className="text-xs font-normal ml-1"
            style={{ color: "var(--text-muted)" }}
          >
            tCO₂e
          </span>
        </p>
      </div>

      {/* Scope 비중 바 */}
      <div>
        <div className="flex rounded-full overflow-hidden h-1.5 mb-2">
          {[
            { scope: "scope1", value: s1 },
            { scope: "scope2", value: s2 },
            { scope: "scope3", value: s3 },
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
        <div className="flex gap-3">
          {[
            { label: "S1", value: s1, scope: "scope1" },
            { label: "S2", value: s2, scope: "scope2" },
            { label: "S3", value: s3, scope: "scope3" },
          ].map(({ label, value, scope }) => (
            <div key={scope} className="flex items-center gap-1">
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
                {label} {((value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 상세 보기 */}
      <Link
        href={`/companies/${company.id}`}
        className="text-xs font-medium text-center py-2 rounded-lg transition-colors"
        style={{
          background: "var(--bg-base)",
          color: "var(--grad-start)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        상세 보기 →
      </Link>
    </div>
  );
}

export default function CompaniesPage() {
  const [industry, setIndustry] = useState("all");
  const [country, setCountry] = useState("all");
  const [search, setSearch] = useState("");

  const { data: res, isLoading } = useSWR("companies", fetchCompanies);
  const companies = res?.data ?? [];

  const filtered = companies.filter((c) => {
    const industryMatch = industry === "all" || c.industry === industry;
    const countryMatch = country === "all" || c.country === country;
    const searchMatch = c.name.toLowerCase().includes(search.toLowerCase());
    return industryMatch && countryMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          기업 분석
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          등록된 기업의 탄소 배출 현황을 비교합니다.
        </p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="기업명 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
            minWidth: "160px",
          }}
        />
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          {INDUSTRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          {COUNTRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          className="ml-auto text-xs self-center"
          style={{ color: "var(--text-muted)" }}
        >
          {filtered.length}개 기업
        </span>
      </div>

      {/* 카드 목록 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl animate-pulse"
              style={{ background: "var(--border-subtle)" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}
