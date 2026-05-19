"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { fetchCompanies, fetchPostsFromStore } from "@/lib/api";
import { useFilterStore } from "@/store/filterStore";
import { useTaxStore } from "@/store/taxStore";
import { useUiStore } from "@/store/uiStore";
import {
  calcSummary,
  buildTrendData,
  buildCompanyData,
  buildSourceDonutData,
  buildReductionRanking,
} from "@/lib/utils/dashboard";
import FilterBar from "./FilterBar";
import SummaryCards from "./SummaryCards";
import ScopeTrendChart from "./ScopeTrendChart";
import CompanyBarChart from "./CompanyBarChart";
import SourceDonutChart from "./SourceDonutChart";
import ReductionRanking from "./ReductionRanking";
import TaxSimulatorWidget from "./TaxSimulatorWidget";
import PostsTable from "./PostsTable";

export default function DashboardContent() {
  const { period, scope } = useFilterStore();
  const { carbonPrice, selectedMarketId } = useTaxStore();
  const { setDataStatus } = useUiStore();

  const { data: companiesRes, isLoading: loadingCompanies, error: companiesErr } = useSWR("companies", fetchCompanies);
  const { data: postsRes, isLoading: loadingPosts, error: postsErr } = useSWR("posts", () => fetchPostsFromStore());

  // 사이드바 데이터 상태 업데이트
  useEffect(() => {
    if (loadingCompanies || loadingPosts) { setDataStatus("loading"); return; }
    if (companiesErr || postsErr) { setDataStatus("error"); return; }
    if (companiesRes && postsRes) { setDataStatus("connected"); return; }
    setDataStatus("idle");
  }, [loadingCompanies, loadingPosts, companiesErr, postsErr, companiesRes, postsRes, setDataStatus]);

  if (loadingCompanies || loadingPosts) return <DashboardSkeleton />;

  const companies = companiesRes?.data ?? [];
  const posts = postsRes?.data ?? [];

  const summary = calcSummary(companies, period, carbonPrice);
  const marketName = selectedMarketId === "custom" ? "커스텀" : selectedMarketId.toUpperCase();

  return (
    <div className="space-y-8">
      {/* 요약 카드 */}
      <SummaryCards
        data={{
          ...summary,
          marketName,
        }}
      />

      {/* Scope별 월간 트렌드 */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            월간 배출 추이
          </h2>
          <FilterBar />
        </div>
        <ScopeTrendChart
          data={buildTrendData(companies, period)}
          activeScope={scope}
        />
      </section>

      {/* 기업별 배출량 + 배출원 비중 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CompanyBarChart data={buildCompanyData(companies, period)} />
        <SourceDonutChart data={buildSourceDonutData(companies, period)} />
      </div>

      {/* 기업 감축 성과 (전체 기간 YoY 고정) */}
      <ReductionRanking data={buildReductionRanking(companies)} inline />

      {/* 탄소세 시뮬레이터 (간소화) */}
      <TaxSimulatorWidget totalEmissions={summary.totalEmissions} />

      {/* 최근 공시 */}
      <PostsTable posts={posts} companies={companies} limit={8} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl" style={{ background: "var(--border-subtle)" }} />
        ))}
      </div>
      <div className="h-72 rounded-xl" style={{ background: "var(--border-subtle)" }} />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-72 rounded-xl" style={{ background: "var(--border-subtle)" }} />
        ))}
      </div>
      <div className="h-32 rounded-xl" style={{ background: "var(--border-subtle)" }} />
      <div className="h-52 rounded-xl" style={{ background: "var(--border-subtle)" }} />
      <div className="h-52 rounded-xl" style={{ background: "var(--border-subtle)" }} />
    </div>
  );
}
