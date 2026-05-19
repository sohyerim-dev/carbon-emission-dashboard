"use client";

import useSWR from "swr";
import { fetchCompanies } from "@/lib/api";
import { useTaxStore } from "@/store/taxStore";
import { useFilterStore } from "@/store/filterStore";
import { CARBON_MARKETS } from "@/lib/data/markets";
import { sumEmissions, getMonthsForPeriod } from "@/lib/utils/dashboard";
import Card from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PRESETS = CARBON_MARKETS.filter((m) => m.id !== "custom");

function fmtUsd(amount: number): string {
  if (amount >= 1_000_000_000)
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${Math.round(amount)}`;
}

const SCENARIOS = [
  { label: "현재 유지", rate: 0 },
  { label: "30% 감축", rate: 0.3 },
  { label: "Net Zero", rate: 1.0 },
];

export default function SimulatorContent() {
  const {
    carbonPrice,
    selectedMarketId,
    targetReductionRate,
    setMarket,
    setCustomPrice,
    setReductionRate,
  } = useTaxStore();
  const { period } = useFilterStore();

  const { data: res, isLoading } = useSWR("companies", fetchCompanies);
  const companies = res?.data ?? [];

  const months = getMonthsForPeriod(period);

  // 전체 배출량
  const totalEmissions = Math.round(
    companies
      .flatMap((c) => c.emissions)
      .filter((e) => months.includes(e.yearMonth))
      .reduce((sum, e) => sum + e.emissions, 0),
  );

  // 기업별 배출량 + 예상 탄소세
  const companyData = companies
    .map((c) => {
      const emissions = Math.round(
        sumEmissions(c.emissions.filter((e) => months.includes(e.yearMonth))),
      );
      return {
        name: c.name.split(" ")[0],
        fullName: c.name,
        emissions,
        currentCost: Math.round(emissions * carbonPrice),
        reducedCost: Math.round(
          emissions * carbonPrice * (1 - targetReductionRate),
        ),
      };
    })
    .sort((a, b) => b.currentCost - a.currentCost);

  const reductionPct = Math.round(targetReductionRate * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          탄소세 시뮬레이터
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          탄소 시장과 감축 목표를 설정해 예상 비용을 계산하세요.
        </p>
      </div>

      {/* 탄소 시장 + 가격 설정 */}
      <Card>
        <p
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          탄소 시장 선택
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 시장 프리셋 */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESETS.map((m) => {
                const isActive = selectedMarketId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMarket(m.id as any)}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-all text-left"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #43c59e, #4f8ef7)"
                        : "var(--bg-base)",
                      color: isActive ? "#fff" : "var(--text-secondary)",
                      border: isActive
                        ? "none"
                        : "1px solid var(--border-subtle)",
                    }}
                  >
                    <span className="block font-semibold">{m.name}</span>
                    <span className="text-xs opacity-80">
                      {m.region} · ${m.price}/tCO₂e
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => setMarket("custom")}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background:
                    selectedMarketId === "custom"
                      ? "linear-gradient(135deg, #43c59e, #4f8ef7)"
                      : "var(--bg-base)",
                  color:
                    selectedMarketId === "custom"
                      ? "#fff"
                      : "var(--text-secondary)",
                  border:
                    selectedMarketId === "custom"
                      ? "none"
                      : "1px solid var(--border-subtle)",
                }}
              >
                직접 입력
              </button>
            </div>

            {selectedMarketId === "custom" && (
              <div className="flex items-center gap-1">
                <span style={{ color: "var(--text-muted)" }}>$</span>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={carbonPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="w-24 text-xl font-bold font-mono border-b outline-none bg-transparent"
                  style={{
                    color: "var(--text-primary)",
                    borderColor: "var(--border-default)",
                  }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  /tCO₂e
                </span>
              </div>
            )}
          </div>

          {/* 감축 목표 슬라이더 */}
          <div>
            <p
              className="text-xs font-medium mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              감축 목표
            </p>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={reductionPct}
                onChange={(e) => setReductionRate(Number(e.target.value) / 100)}
                className="flex-1"
                style={{ accentColor: "var(--grad-start)" }}
              />
              <span
                className="text-xl font-bold font-mono w-14 text-right"
                style={{ color: "var(--text-primary)" }}
              >
                {reductionPct}%
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {totalEmissions.toLocaleString()} tCO₂e →{" "}
              {Math.round(
                totalEmissions * (1 - targetReductionRate),
              ).toLocaleString()}{" "}
              tCO₂e
            </p>
          </div>
        </div>
      </Card>

      {/* 시나리오 비교 */}
      <div>
        <p
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          시나리오 비교
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCENARIOS.map((s, i) => {
            const cost = totalEmissions * carbonPrice * (1 - s.rate);
            const isSelected = Math.abs(targetReductionRate - s.rate) < 0.01;
            return (
              <button
                key={s.label}
                onClick={() => setReductionRate(s.rate)}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  background: isSelected
                    ? "linear-gradient(135deg, #43c59e15, #4f8ef715)"
                    : "var(--bg-card)",
                  border: `1px solid ${isSelected ? "var(--grad-start)" : "var(--border-subtle)"}`,
                }}
              >
                <p
                  className="text-xs font-medium mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {s.label}
                </p>
                <p
                  className="text-2xl font-bold font-mono"
                  style={{
                    color:
                      i === 0
                        ? "var(--text-primary)"
                        : i === 1
                          ? "var(--grad-end)"
                          : "var(--grad-start)",
                  }}
                >
                  {s.rate === 1 ? "$0" : fmtUsd(cost)}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  {s.rate > 0 &&
                    `절감 ${fmtUsd(totalEmissions * carbonPrice * s.rate)}`}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 기업별 예상 탄소세 */}
      <Card>
        <p
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          기업별 예상 탄소세
        </p>
        {isLoading ? (
          <div
            className="h-64 animate-pulse rounded-lg"
            style={{ background: "var(--border-subtle)" }}
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={companyData}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickFormatter={(v) => fmtUsd(v)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                width={72}
              />
              <Tooltip
                formatter={(v, name) => [
                  fmtUsd(Number(v)),
                  name === "currentCost"
                    ? "현재 비용"
                    : `${reductionPct}% 감축 후`,
                ]}
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="currentCost" radius={[0, 4, 4, 0]} fill="#4f8ef730">
                {companyData.map((_, i) => (
                  <Cell key={i} fill="#4f8ef740" />
                ))}
              </Bar>
              <Bar dataKey="reducedCost" radius={[0, 4, 4, 0]}>
                {companyData.map((_, i) => (
                  <Cell key={i} fill="#43c59e" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
          흐린 막대: 현재 비용 · 진한 막대: 감축 목표 적용 후
        </p>
      </Card>
    </div>
  );
}
