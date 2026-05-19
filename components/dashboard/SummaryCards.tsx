import Card from "@/components/ui/Card";

function fmtEmissions(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("ko-KR");
}

function fmtUsd(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000)     return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)         return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${Math.round(amount)}`;
}

interface SummaryData {
  totalEmissions: number;
  compareChange: number | null;
  compareLabel: string;
  estimatedTax: number;
  marketName: string;
  companyCount: number;
}

export default function SummaryCards({ data }: { data: SummaryData }) {
  const { totalEmissions, compareChange, compareLabel, estimatedTax, marketName, companyCount } = data;

  const changeStr = compareChange !== null
    ? `${compareChange > 0 ? "+" : ""}${(compareChange * 100).toFixed(1)}%`
    : "-";
  const changeColor =
    compareChange === null ? "var(--text-primary)"
    : compareChange > 0   ? "#f87171"
    : "#43c59e";

  const cards = [
    {
      label: "총 배출량",
      value: fmtEmissions(totalEmissions),
      unit: "tCO₂e",
      sub: "선택 기간 전체 합산",
    },
    {
      label: compareLabel,
      value: changeStr,
      unit: "",
      sub: "전기 대비 증감",
      valueColor: changeColor,
    },
    {
      label: "예상 탄소세",
      value: fmtUsd(estimatedTax),
      unit: "",
      sub: `${marketName} 시장 기준`,
      valueColor: "var(--grad-end)",
    },
    {
      label: "관리 기업 수",
      value: String(companyCount),
      unit: "개사",
      sub: "3개국 5개 산업",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
            {card.label}
          </p>
          <p
            className="text-2xl font-bold font-mono"
            style={{ color: card.valueColor ?? "var(--text-primary)" }}
          >
            {card.value}
            {card.unit && (
              <span className="text-sm font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                {card.unit}
              </span>
            )}
          </p>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
            {card.sub}
          </p>
        </Card>
      ))}
    </div>
  );
}
