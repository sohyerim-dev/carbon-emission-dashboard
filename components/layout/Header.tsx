"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/store/uiStore";
import { useFilterStore } from "@/store/filterStore";
import { COMPANIES } from "@/lib/data/companies";
import { POSTS } from "@/lib/data/posts";
import { Period } from "@/types";

type SearchResult =
  | { type: "company"; id: string; label: string; sub: string }
  | { type: "post"; id: string; label: string; sub: string; companyId: string };

function useSearch(query: string): SearchResult[] {
  if (query.trim().length < 1) return [];
  const q = query.toLowerCase();

  const companies: SearchResult[] = COMPANIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.industry.includes(q),
  )
    .slice(0, 3)
    .map((c) => ({ type: "company", id: c.id, label: c.name, sub: c.industry }));

  const posts: SearchResult[] = POSTS.filter((p) =>
    p.title.toLowerCase().includes(q),
  )
    .slice(0, 3)
    .map((p) => ({ type: "post", id: p.id, label: p.title, sub: p.category, companyId: p.resourceUid }));

  return [...companies, ...posts];
}

// 기간 버튼 정의
const PERIOD_PRESETS: { value: Period; label: string }[] = [
  { value: "this_month", label: "이번 달" },
  { value: "3months",    label: "최근 3개월" },
  { value: "1year",      label: "최근 1년" },
  { value: "all",        label: "전체" },
];

const YEAR_OPTIONS: { value: Period; label: string }[] = [
  { value: "2024", label: "2024년" },
  { value: "2025", label: "2025년" },
];

export default function Header() {
  const { toggleSidebar } = useUiStore();
  const { period, setPeriod } = useFilterStore();
  const router = useRouter();

  // 검색
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const results = useSearch(query);

  // 연도 드롭다운
  const [yearOpen, setYearOpen] = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setYearOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(result: SearchResult) {
    setQuery("");
    setSearchOpen(false);
    if (result.type === "company") router.push(`/companies/${result.id}`);
    else router.push(`/companies/${result.companyId}`);
  }

  // 연도 선택 중인지 여부 (dropdown 버튼 활성 상태)
  const isYearSelected = period === "2024" || period === "2025";
  const selectedYearLabel = isYearSelected ? YEAR_OPTIONS.find((y) => y.value === period)?.label : "연도";

  return (
    <header
      className="sticky top-0 z-10 flex items-center gap-3 px-6 h-14 border-b"
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* 햄버거 (모바일) */}
      <button onClick={toggleSidebar} className="lg:hidden flex flex-col gap-1.5 p-1" aria-label="메뉴">
        <span className="block h-px w-5 rounded" style={{ background: "var(--grad-start)" }} />
        <span className="block h-px w-5 rounded" style={{ background: "var(--gradient)" }} />
        <span className="block h-px w-3 rounded" style={{ background: "var(--grad-end)" }} />
      </button>

      {/* 로고 */}
      <span className="text-base font-bold gradient-text whitespace-nowrap">
        GreenWave Carbon
      </span>

      {/* 검색 */}
      <div ref={searchRef} className="relative flex-1 max-w-sm">
        <input
          type="text"
          placeholder="기업 / 산업 / 공시 검색..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          className="w-full text-sm px-4 py-1.5 rounded-lg border outline-none transition-all"
          style={{
            background: "var(--bg-base)",
            borderColor: searchOpen ? "var(--grad-start)" : "var(--border-subtle)",
            color: "var(--text-primary)",
          }}
        />

        {searchOpen && results.length > 0 && (
          <div
            className="absolute top-full mt-1 w-full rounded-xl border shadow-lg overflow-hidden z-50"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
          >
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-black/5 transition-colors"
              >
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0"
                  style={{
                    background: r.type === "company" ? "rgba(67,197,158,0.12)" : "rgba(79,142,247,0.12)",
                    color: r.type === "company" ? "var(--grad-start)" : "var(--grad-end)",
                  }}
                >
                  {r.type === "company" ? "기업" : "공시"}
                </span>
                <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* 기간 필터 (md 이상에서 표시) */}
      <div className="hidden md:flex items-center gap-1">
        {/* 프리셋 버튼 */}
        {PERIOD_PRESETS.map((p) => {
          const isActive = period === p.value;
          return (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="px-3 py-1 text-xs rounded-lg transition-all duration-150 whitespace-nowrap"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, #43c59e, #4f8ef7)"
                  : "transparent",
                color: isActive ? "#fff" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 400,
                border: isActive ? "none" : "1px solid var(--border-subtle)",
              }}
            >
              {p.label}
            </button>
          );
        })}

        {/* 연도 드롭다운 */}
        <div ref={yearRef} className="relative">
          <button
            onClick={() => setYearOpen((v) => !v)}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg transition-all duration-150 whitespace-nowrap"
            style={{
              background: isYearSelected
                ? "linear-gradient(135deg, #43c59e, #4f8ef7)"
                : "transparent",
              color: isYearSelected ? "#fff" : "var(--text-secondary)",
              fontWeight: isYearSelected ? 600 : 400,
              border: isYearSelected ? "none" : "1px solid var(--border-subtle)",
            }}
          >
            {selectedYearLabel}
            <span style={{ fontSize: "8px", opacity: 0.8 }}>▼</span>
          </button>

          {yearOpen && (
            <div
              className="absolute top-full right-0 mt-1 rounded-lg border shadow-lg overflow-hidden z-50 min-w-24"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
            >
              {YEAR_OPTIONS.map((y) => (
                <button
                  key={y.value}
                  onClick={() => { setPeriod(y.value); setYearOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-black/5"
                  style={{
                    color: period === y.value ? "var(--grad-start)" : "var(--text-secondary)",
                    fontWeight: period === y.value ? 600 : 400,
                  }}
                >
                  {y.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
