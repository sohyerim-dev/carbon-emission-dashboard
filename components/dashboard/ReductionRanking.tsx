import Card from "@/components/ui/Card";

const INDUSTRY_LABEL: Record<string, string> = {
  manufacturing: "제조",
  logistics: "물류",
  heavy_industry: "중공업",
  technology: "IT",
  retail: "유통",
};

const RANK_BADGE = ["🥇", "🥈", "🥉"];

interface RankingItem {
  id: string;
  name: string;
  industry: string;
  total2024: number;
  total2025: number;
  reductionRate: number;
}

interface Props {
  data: RankingItem[];
  inline?: boolean; // true면 Card 안에 리스트형으로 표시
}

export default function ReductionRanking({ data, inline = false }: Props) {
  const fmt = (n: number) => n.toLocaleString("ko-KR", { maximumFractionDigits: 0 });

  if (inline) {
    return (
      <Card>
        <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          감축 성과 기업
        </p>
        <div className="space-y-3">
          {data.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2.5 border-t"
              style={{ borderColor: i === 0 ? "transparent" : "var(--border-subtle)" }}
            >
              <span className="text-lg w-7 shrink-0 text-center">
                {RANK_BADGE[i] ?? <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>#{i + 1}</span>}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {item.name}
                </p>
                <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>
                  {fmt(item.total2024)} → {fmt(item.total2025)} tCO₂e
                </p>
              </div>
              <span
                className="text-sm font-bold font-mono shrink-0"
                style={{ color: "#43c59e" }}
              >
                -{item.reductionRate.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // 전체 페이지용 그리드형
  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        감축 성과 기업
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {data.map((item, i) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{RANK_BADGE[i] ?? `#${i + 1}`}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "linear-gradient(135deg, rgba(67,197,158,0.12), rgba(79,142,247,0.12))",
                  color: "var(--grad-start)",
                }}
              >
                {INDUSTRY_LABEL[item.industry]}
              </span>
            </div>
            <p className="text-sm font-semibold truncate mb-2" style={{ color: "var(--text-primary)" }}>
              {item.name}
            </p>
            <p className="text-2xl font-bold font-mono" style={{ color: "#43c59e" }}>
              -{item.reductionRate.toFixed(1)}%
            </p>
            <p className="text-xs mt-1.5 font-mono" style={{ color: "var(--text-muted)" }}>
              {fmt(item.total2024)} → {fmt(item.total2025)}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
