"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";

interface CompanyDataPoint {
  name: string;
  fullName: string;
  scope1: number;
  scope2: number;
  scope3: number;
}

export default function CompanyBarChart({ data }: { data: CompanyDataPoint[] }) {
  return (
    <Card>
      <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        기업별 배출량
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
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
          <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#43c59e" />
          <Bar dataKey="scope2" name="Scope 2" stackId="a" fill="#3ab5d4" />
          <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#4f8ef7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
