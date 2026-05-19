"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Card from "@/components/ui/Card";

const COLORS = ["#43c59e", "#3ab5d4", "#4f8ef7"];

interface DonutDataPoint {
  name: string;
  value: number;
}

export default function ScopeDonutChart({ data }: { data: DonutDataPoint[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Scope별 비중
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={105}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              const v = Number(value);
              return [`${v.toLocaleString("ko-KR")} tCO₂e (${((v / total) * 100).toFixed(1)}%)`];
            }}
            contentStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
