"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetchCompany, fetchProducts, fetchPostsFromStore } from "@/lib/api";
import CompanyHeader from "./CompanyHeader";
import ScopeBreakdownChart from "./ScopeBreakdownChart";
import CompanyTrendChart from "./CompanyTrendChart";
import PcfWaterfallChart from "./PcfWaterfallChart";
import CompanyPosts from "./CompanyPosts";

type Tab = "overview" | "pcf" | "posts";

const TAB_LABELS: Record<Tab, string> = {
  overview: "개요",
  pcf: "PCF 분석",
  posts: "공시",
};

export default function CompanyContent({ companyId }: { companyId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: companyRes, isLoading } = useSWR(`company-${companyId}`, () =>
    fetchCompany(companyId),
  );
  const { data: productsRes } = useSWR(`products-${companyId}`, () =>
    fetchProducts(companyId),
  );
  const { data: postsRes, mutate: mutatePosts } = useSWR(
    `posts-${companyId}`,
    () => fetchPostsFromStore(companyId),
  );

  if (isLoading) return <CompanySkeleton />;

  const company = companyRes?.data;
  if (!company)
    return (
      <p className="text-center py-20" style={{ color: "var(--text-muted)" }}>
        기업을 찾을 수 없습니다.
      </p>
    );

  const products = productsRes?.data ?? [];
  const posts = postsRes?.data ?? [];

  return (
    <div className="space-y-6">
      <CompanyHeader company={company} />

      {/* 탭 */}
      <div
        className="flex gap-1 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderColor:
                activeTab === tab ? "var(--grad-start)" : "transparent",
              color:
                activeTab === tab ? "var(--grad-start)" : "var(--text-muted)",
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* 개요 탭 */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ScopeBreakdownChart company={company} />
          <CompanyTrendChart company={company} />
        </div>
      )}

      {/* PCF 탭 */}
      {activeTab === "pcf" && <PcfWaterfallChart products={products} />}

      {/* 공시 탭 */}
      {activeTab === "posts" && (
        <CompanyPosts
          posts={posts}
          companyId={companyId}
          onMutate={() => mutatePosts()}
        />
      )}
    </div>
  );
}

function CompanySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div
        className="h-24 rounded-xl"
        style={{ background: "var(--border-subtle)" }}
      />
      <div
        className="h-10 w-64 rounded-lg"
        style={{ background: "var(--border-subtle)" }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="h-72 rounded-xl"
          style={{ background: "var(--border-subtle)" }}
        />
        <div
          className="h-72 rounded-xl"
          style={{ background: "var(--border-subtle)" }}
        />
      </div>
    </div>
  );
}
