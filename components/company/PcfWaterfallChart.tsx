"use client";

import { useState } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Product } from "@/types";
import Card from "@/components/ui/Card";

const STAGE_LABELS: Record<string, string> = {
  raw_material: "원자재",
  manufacturing: "제조",
  transport: "운송",
  use: "사용",
  end_of_life: "폐기",
  total: "합계",
};

// Scope 그라데이션과 같은 색계열 유지
const STAGE_COLORS: Record<string, string> = {
  raw_material: "#43c59e",
  manufacturing: "#3bbfaa",
  transport: "#3ab5d4",
  use: "#4f8ef7",
  end_of_life: "#7b6ef7",
  total: "#0f172a",
};

// Recharts 폭포 차트 = 투명 offset 바 + 실제 값 바 두 겹
function buildWaterfallData(product: Product) {
  let cumulative = 0;
  const rows = product.pcf.map((entry) => {
    const offset = cumulative;
    cumulative += entry.emissions;
    return {
      name: STAGE_LABELS[entry.stage] ?? entry.stage,
      stage: entry.stage,
      offset,
      value: entry.emissions,
      description: entry.description ?? "",
    };
  });
  // 마지막에 합계 바 추가
  rows.push({
    name: "합계",
    stage: "total",
    offset: 0,
    value: product.totalEmissions,
    description: "전 단계 tCO₂e 합산",
  });
  return rows;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <p
        className="font-semibold mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {d.name}
      </p>
      <p style={{ color: "var(--text-secondary)" }}>
        {d.value.toFixed(3)} tCO₂e
      </p>
      {d.description && (
        <p className="mt-1" style={{ color: "var(--text-muted)" }}>
          {d.description}
        </p>
      )}
    </div>
  );
}

export default function PcfWaterfallChart({
  products,
}: {
  products: Product[];
}) {
  const [selectedId, setSelectedId] = useState<string>(products[0]?.id ?? "");

  if (products.length === 0) {
    return (
      <Card>
        <p
          className="text-center py-10 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          등록된 제품 데이터가 없습니다.
        </p>
      </Card>
    );
  }

  const product = products.find((p) => p.id === selectedId) ?? products[0];
  const data = buildWaterfallData(product);

  return (
    <div className="space-y-4">
      {/* 제품 선택 */}
      {products.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background:
                  selectedId === p.id ? "var(--grad-start)" : "var(--bg-card)",
                color: selectedId === p.id ? "#fff" : "var(--text-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <Card>
        <div className="mb-4">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {product.name} — PCF 전과정 분석
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {product.functionalUnit} · 총 {product.totalEmissions.toFixed(3)}{" "}
            tCO₂e
          </p>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-subtle)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickFormatter={(v) => v.toFixed(2)}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 투명 offset 바 — 폭포 차트의 '발판' 역할 */}
            <Bar dataKey="offset" stackId="waterfall" fill="transparent" />

            {/* 실제 값 바 */}
            <Bar dataKey="value" stackId="waterfall" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.stage}
                  fill={STAGE_COLORS[entry.stage] ?? "#94a3b8"}
                />
              ))}
            </Bar>

            <ReferenceLine y={0} stroke="var(--border-subtle)" />
          </ComposedChart>
        </ResponsiveContainer>

        {/* 단계별 수치 테이블 */}
        <div
          className="mt-4 divide-y"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {product.pcf.map((entry) => (
            <div
              key={entry.stage}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: STAGE_COLORS[entry.stage] }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {STAGE_LABELS[entry.stage]}
                </span>
              </div>
              <div className="text-right">
                <span
                  className="text-sm font-mono font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {entry.emissions.toFixed(3)} tCO₂e
                </span>
                <span
                  className="text-xs ml-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  (
                  {((entry.emissions / product.totalEmissions) * 100).toFixed(
                    1,
                  )}
                  %)
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
