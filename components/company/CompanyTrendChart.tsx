"use client";

import { Company } from "@/types";
import { buildTrendData } from "@/lib/utils/dashboard";
import ScopeTrendChart from "@/components/dashboard/ScopeTrendChart";

export default function CompanyTrendChart({ company }: { company: Company }) {
  // 이 기업 하나만 배열로 감싸서 기존 유틸 재사용
  // 전체 기간(all) 고정 — YoY 비교가 보여야 의미있음
  const data = buildTrendData([company], "all");

  return <ScopeTrendChart data={data} activeScope="all" />;
}
