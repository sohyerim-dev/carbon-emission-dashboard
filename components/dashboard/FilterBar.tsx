"use client";

import { useFilterStore } from "@/store/filterStore";
import { GhgScope } from "@/types";

const SCOPE_OPTIONS: { value: GhgScope | "all"; label: string }[] = [
  { value: "all",    label: "전체" },
  { value: "scope1", label: "Scope 1" },
  { value: "scope2", label: "Scope 2" },
  { value: "scope3", label: "Scope 3" },
];

// Scope 강조 필터 — 기간 필터는 헤더로 이동
export default function FilterBar() {
  const { scope, setScope } = useFilterStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Scope</span>
      <div
        className="flex rounded-lg border overflow-hidden"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setScope(opt.value)}
            className="px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              background: scope === opt.value
                ? "linear-gradient(135deg, #43c59e, #4f8ef7)"
                : "transparent",
              color: scope === opt.value ? "#fff" : "var(--text-secondary)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
