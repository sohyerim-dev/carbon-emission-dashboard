"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/store/uiStore";
import { COMPANIES } from "@/lib/data/companies";

const INDUSTRY_LABEL: Record<string, string> = {
  manufacturing: "제조",
  logistics: "물류",
  heavy_industry: "중공업",
  technology: "IT",
  retail: "유통",
};

const NAV_LINKS = [
  { href: "/", label: "대시보드" },
  { href: "/simulator", label: "탄소세 시뮬레이터" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, setSelectedCompanyId } = useUiStore();

  return (
    <>
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-60 flex flex-col
          border-r transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        {/* 로고 */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <span className="text-lg font-bold gradient-text">Carbon Atlas</span>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            GHG Emission Dashboard
          </p>
        </div>

        {/* 메인 메뉴 */}
        <nav className="px-3 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-0.5 transition-all duration-150"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, rgba(67,197,158,0.12), rgba(79,142,247,0.12))"
                    : "transparent",
                  color: isActive ? "var(--grad-start)" : "var(--text-secondary)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* 기업 목록 */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <p
            className="text-xs font-semibold px-3 mb-2 uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            기업
          </p>
          {COMPANIES.map((company) => {
            const isActive = pathname.startsWith(`/companies/${company.id}`);
            return (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                onClick={() => {
                  setSelectedCompanyId(company.id);
                  setSidebarOpen(false);
                }}
                className="flex flex-col px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, rgba(67,197,158,0.12), rgba(79,142,247,0.12))"
                    : "transparent",
                }}
              >
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: isActive ? "var(--grad-start)" : "var(--text-primary)" }}
                >
                  {company.name}
                </span>
                <span className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {INDUSTRY_LABEL[company.industry]} · {company.country}
                </span>
              </Link>
            );
          })}
        </div>

        {/* 하단 */}
        <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            데이터 기준: 2024–2025
          </p>
        </div>
      </aside>
    </>
  );
}
