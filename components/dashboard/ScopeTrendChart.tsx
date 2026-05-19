"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import { GhgScope } from "@/types";

interface TrendPoint {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
}

const SCOPE_META: Record<GhgScope, { color: string; label: string }> = {
  scope1: { color: "#43c59e", label: "Scope 1" },
  scope2: { color: "#3ab5d4", label: "Scope 2" },
  scope3: { color: "#4f8ef7", label: "Scope 3" },
};

export default function ScopeTrendChart({
  data,
  activeScope,
}: {
  data: TrendPoint[];
  activeScope: GhgScope | "all";
}) {
  const scopes: GhgScope[] = ["scope1", "scope2", "scope3"];

  return (
    <Card>
      <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        탄소 배출 흐름 한눈에 보기
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            width={55}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(v) => [`${Number(v).toLocaleString("ko-KR")} tCO₂e`]}
            contentStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          {scopes.map((scope) => {
            const { color, label } = SCOPE_META[scope];
            const isActive = activeScope === "all" || activeScope === scope;
            return (
              <Line
                key={scope}
                type="monotone"
                dataKey={scope}
                name={label}
                stroke={color}
                strokeWidth={isActive ? 2 : 1}
                strokeOpacity={isActive ? 1 : 0.2}
                dot={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
