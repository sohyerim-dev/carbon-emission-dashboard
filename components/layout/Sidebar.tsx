"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore, DataStatus } from "@/store/uiStore";

const NAV_ITEMS = [
  { href: "/",          label: "개요",       icon: "◎" },
  { href: "/companies", label: "기업 분석",  icon: "◈" },
  { href: "/simulator", label: "탄소세 예측", icon: "◐" },
  { href: "/posts",     label: "공시 관리",  icon: "◫" },
];

const STATUS_CONFIG: Record<DataStatus, { dot: string; label: string }> = {
  idle:      { dot: "#94a3b8", label: "대기 중" },
  loading:   { dot: "#f59e0b", label: "동기화 중..." },
  error:     { dot: "#f87171", label: "연결 오류" },
  connected: { dot: "#43c59e", label: "API 연결됨" },
};

function NavItem({ href, label, icon, pathname }: { href: string; label: string; icon: string; pathname: string }) {
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(67,197,158,0.12), rgba(79,142,247,0.12))"
          : "transparent",
        color: isActive ? "var(--grad-start)" : "var(--text-secondary)",
        fontWeight: isActive ? 600 : 400,
      }}
    >
      <span className="text-xs opacity-60">{icon}</span>
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, dataStatus } = useUiStore();
  const status = STATUS_CONFIG[dataStatus];

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-56 flex flex-col
          border-r transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ background: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        {/* 헤더 높이만큼 여백 */}
        <div className="h-14 flex items-center px-5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Navigation
          </span>
        </div>

        {/* 주요 메뉴 */}
        <nav className="px-3 py-4 flex-1">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} pathname={pathname} />
            ))}
          </div>
        </nav>

        {/* 하단: 데이터 연결 상태 */}
        <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: status.dot, boxShadow: `0 0 6px ${status.dot}80` }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {status.label}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
