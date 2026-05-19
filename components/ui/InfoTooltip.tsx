// 용어 설명 툴팁 — tCO₂e, YoY 같은 전문 용어 옆에 배치
export default function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex items-center">
      <span
        className="ml-1 w-4 h-4 rounded-full inline-flex items-center justify-center text-xs cursor-default select-none shrink-0"
        style={{ background: "var(--border-subtle)", color: "var(--text-muted)" }}
      >
        ?
      </span>
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 text-xs rounded-lg px-3 py-2
                   opacity-0 group-hover:opacity-100 pointer-events-none z-50 tooltip-fade"
        style={{
          background: "#1e293b",
          color: "#f1f5f9",
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
          lineHeight: "1.5",
          whiteSpace: "normal",
        }}
      >
        {text}
      </span>
    </span>
  );
}
