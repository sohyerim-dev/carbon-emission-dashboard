"use client";

import Link from "next/link";
import { useTaxStore } from "@/store/taxStore";
import { CARBON_MARKETS } from "@/lib/data/markets";
import Card from "@/components/ui/Card";

const PRESETS = CARBON_MARKETS.filter((m) => m.id !== "custom");

function fmtUsd(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000)     return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)         return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${Math.round(amount)}`;
}

interface Props {
  totalEmissions: number; // tCO₂e — 대시보드 현재 기간 기준
}

export default function TaxSimulatorWidget({ totalEmissions }: Props) {
  const {
    selectedMarketId, carbonPrice, targetReductionRate,
    setMarket, setCustomPrice, setReductionRate,
  } = useTaxStore();

  const estimatedCost = totalEmissions * carbonPrice;
  const savings = estimatedCost * targetReductionRate;
  const reductionPct = Math.round(targetReductionRate * 100);

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          탄소세 시뮬레이터
        </p>
        <Link
          href="/simulator"
          className="text-xs font-medium transition-colors"
          style={{ color: "var(--grad-start)" }}
        >
          상세 시뮬레이션 보기 →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 왼쪽: 탄소 시장 + 가격 */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
            탄소 시장
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {PRESETS.map((m) => {
              const isActive = selectedMarketId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMarket(m.id as "k-ets" | "ca-cap" | "eu-ets")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #43c59e, #4f8ef7)"
                      : "var(--bg-base)",
                    color: isActive ? "#fff" : "var(--text-secondary)",
                    border: isActive ? "none" : "1px solid var(--border-subtle)",
                  }}
                >
                  {m.name}
                </button>
              );
            })}
            <button
              onClick={() => setMarket("custom")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: selectedMarketId === "custom"
                  ? "linear-gradient(135deg, #43c59e, #4f8ef7)"
                  : "var(--bg-base)",
                color: selectedMarketId === "custom" ? "#fff" : "var(--text-secondary)",
                border: selectedMarketId === "custom" ? "none" : "1px solid var(--border-subtle)",
              }}
            >
              직접 입력
            </button>
          </div>

          {/* 가격 표시 / 입력 */}
          <div className="flex items-end gap-3">
            <div>
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>탄소 가격</p>
              {selectedMarketId === "custom" ? (
                <div className="flex items-center gap-1">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>$</span>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={carbonPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-20 text-lg font-bold font-mono border-b outline-none bg-transparent"
                    style={{ color: "var(--text-primary)", borderColor: "var(--border-default)" }}
                  />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>/tCO₂e</span>
                </div>
              ) : (
                <p className="text-lg font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                  ${carbonPrice.toFixed(2)}
                  <span className="text-xs font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                    /tCO₂e
                  </span>
                </p>
              )}
            </div>

            {/* 예상 비용 */}
            <div className="pb-0.5">
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>예상 비용</p>
              <p className="text-lg font-bold font-mono" style={{ color: "var(--grad-end)" }}>
                {fmtUsd(estimatedCost)}
              </p>
            </div>
          </div>
        </div>

        {/* 오른쪽: 감축 목표 + 절감액 */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
            감축 목표
          </p>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={reductionPct}
              onChange={(e) => setReductionRate(Number(e.target.value) / 100)}
              className="flex-1"
              style={{ accentColor: "var(--grad-start)" }}
            />
            <span className="text-base font-bold font-mono w-12 text-right" style={{ color: "var(--text-primary)" }}>
              {reductionPct}%
            </span>
          </div>

          <div className="p-3 rounded-lg" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>예상 절감액</p>
            <p className="text-xl font-bold font-mono" style={{ color: "#43c59e" }}>
              -{fmtUsd(savings)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {totalEmissions.toLocaleString("ko-KR")} tCO₂e → 목표 {Math.round(totalEmissions * (1 - targetReductionRate)).toLocaleString("ko-KR")} tCO₂e
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
