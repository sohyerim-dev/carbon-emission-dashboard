import InfoTooltip from "./InfoTooltip";

const ITEMS = [
  {
    scope: "Scope 1",
    color: "#43c59e",
    desc: "직접 배출 — 공장 연료 연소, 회사 차량 운행 등 사업장 내 직접 발생",
  },
  {
    scope: "Scope 2",
    color: "#3ab5d4",
    desc: "구매 에너지 — 전기·열·증기 사용에 따른 간접 배출",
  },
  {
    scope: "Scope 3",
    color: "#4f8ef7",
    desc: "가치사슬 — 공급망, 출장, 제품 사용·폐기 등 나머지 모든 간접 배출",
  },
];

export default function ScopeLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 items-center">
      {ITEMS.map(({ scope, color, desc }) => (
        <span key={scope} className="flex items-center text-xs" style={{ color: "var(--text-secondary)" }}>
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0 mr-1.5"
            style={{ background: color }}
          />
          {scope}
          <InfoTooltip text={desc} />
        </span>
      ))}
    </div>
  );
}
