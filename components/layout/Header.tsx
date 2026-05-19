"use client";

import { usePathname } from "next/navigation";
import { useUiStore } from "@/store/uiStore";
import { COMPANIES } from "@/lib/data/companies";

function getTitle(pathname: string): string {
  if (pathname === "/") return "대시보드";
  if (pathname === "/simulator") return "탄소세 시뮬레이터";
  if (pathname.startsWith("/companies/")) {
    const id = pathname.split("/")[2];
    const company = COMPANIES.find((c) => c.id === id);
    return company ? company.name : "기업 상세";
  }
  return "Carbon Atlas";
}

export default function Header() {
  const pathname = usePathname();
  const { toggleSidebar } = useUiStore();
  const title = getTitle(pathname);

  return (
    <header
      className="sticky top-0 z-10 flex items-center gap-4 px-6 h-14 border-b"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* 햄버거 (모바일) */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
        aria-label="메뉴"
      >
        <span className="block h-px w-5 rounded" style={{ background: "var(--grad-start)" }} />
        <span className="block h-px w-5 rounded" style={{ background: "var(--gradient)" }} />
        <span className="block h-px w-3 rounded" style={{ background: "var(--grad-end)" }} />
      </button>

      {/* 페이지 제목 */}
      <h1 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h1>

      <div className="flex-1" />

      {/* 데이터 기간 배지 */}
      <span
        className="text-xs font-mono px-2.5 py-1 rounded-full border"
        style={{
          color: "var(--text-muted)",
          borderColor: "var(--border-subtle)",
          background: "var(--bg-base)",
        }}
      >
        2024 – 2025
      </span>
    </header>
  );
}
