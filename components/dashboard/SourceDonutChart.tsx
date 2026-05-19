"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Card from "@/components/ui/Card";

const CATEGORY_COLORS: Record<string, string> = {
  "고정 연소":    "#43c59e",
  "이동 연소":    "#27a37e",
  "구매 전력":    "#3ab5d4",
  "구매 열·증기": "#5ec8e0",
  "출장":         "#4f8ef7",
  "공급망":       "#7aaef9",
  "폐기물":       "#a78bfa",
};
const FALLBACK_COLOR = "#94a3b8";
const LETTERS = "ABCDEFG";
const RADIAN = Math.PI / 180;

// 슬라이스 중앙에 알파벳 식별자 렌더링
function SliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number; percent?: number; index?: number;
}) {
  if (!cx || !cy || midAngle == null || !innerRadius || !outerRadius || !percent || index == null) return null;
  if (percent < 0.05) return null;

  const r = (innerRadius + outerRadius) / 2;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      fill="white" fontSize={13} fontWeight="700" style={{ pointerEvents: "none" }}>
      {LETTERS[index]}
    </text>
  );
}

interface LegendPayload { value?: string | number; color?: string; }

// 범례: A 고정 연소 형식으로 식별자와 카테고리명을 함께 표시
function CustomLegend({ payload }: { payload?: readonly LegendPayload[] }) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center px-2 pt-1">
      {payload.map((entry, i) => (
        <div key={String(entry.value)} className="flex items-center gap-1.5 text-xs">
          <span
            className="flex items-center justify-center w-4 h-4 rounded text-white font-bold shrink-0"
            style={{ background: entry.color, fontSize: "10px" }}
          >
            {LETTERS[i]}
          </span>
          <span style={{ color: "#475569" }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

interface DonutDataPoint {
  name: string;
  value: number;
}

export default function SourceDonutChart({ data }: { data: DonutDataPoint[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
        배출원 비중
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="44%"
            innerRadius={65}
            outerRadius={105}
            dataKey="value"
            paddingAngle={2}
            label={SliceLabel}
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={CATEGORY_COLORS[entry.name] ?? FALLBACK_COLOR} />
            ))}
          </Pie>
          <Tooltip
            isAnimationActive={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0];
              const idx = data.findIndex((d) => d.name === item.name);
              const letter = idx >= 0 ? LETTERS[idx] : "";
              const v = Number(item.value);
              const color = CATEGORY_COLORS[String(item.name)] ?? FALLBACK_COLOR;
              return (
                <div className="tooltip-fade" style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    {/* 식별자 뱃지 — 칸이 좁아 슬라이스 안에 안 보이는 경우도 여기서 확인 가능 */}
                    <span style={{
                      background: color, color: "#fff",
                      width: "16px", height: "16px", borderRadius: "4px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", fontWeight: 700, flexShrink: 0,
                    }}>
                      {letter}
                    </span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {item.name}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", paddingLeft: "22px" }}>
                    {v.toLocaleString("ko-KR")} tCO₂e &nbsp;
                    <span style={{ color: "var(--text-muted)" }}>
                      ({((v / total) * 100).toFixed(1)}%)
                    </span>
                  </p>
                </div>
              );
            }}
          />
          <Legend content={CustomLegend} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
