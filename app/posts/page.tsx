"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetchCompanies, fetchPostsFromStore } from "@/lib/api";
import { PostCategory } from "@/types";
import PostsTable from "@/components/dashboard/PostsTable";

const CATEGORY_OPTIONS: { label: string; value: PostCategory | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "공시", value: "announcement" },
  { label: "보고서", value: "report" },
  { label: "뉴스", value: "news" },
];

export default function PostsPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    PostCategory | "all"
  >("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  const { data: companiesRes } = useSWR("companies", fetchCompanies);
  const { data: postsRes } = useSWR("posts", fetchPostsFromStore);

  const companies = companiesRes?.data ?? [];
  const allPosts = postsRes?.data ?? [];

  const filtered = allPosts.filter((p) => {
    const categoryMatch =
      selectedCategory === "all" || p.category === selectedCategory;
    const companyMatch =
      selectedCompany === "all" || p.resourceUid === selectedCompany;
    return categoryMatch && companyMatch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          공시 관리
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          전체 기업의 공시·보고서·뉴스를 조회하고 관리합니다.
        </p>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3">
        {/* 카테고리 필터 */}
        <div className="flex gap-1.5">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedCategory(opt.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background:
                  selectedCategory === opt.value
                    ? "linear-gradient(135deg, #43c59e, #4f8ef7)"
                    : "var(--bg-card)",
                color:
                  selectedCategory === opt.value
                    ? "#fff"
                    : "var(--text-secondary)",
                border:
                  selectedCategory === opt.value
                    ? "none"
                    : "1px solid var(--border-subtle)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 기업 필터 */}
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs outline-none"
          style={{
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <option value="all">전체 기업</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <span
          className="ml-auto text-xs self-center"
          style={{ color: "var(--text-muted)" }}
        >
          {filtered.length}건
        </span>
      </div>

      <PostsTable posts={filtered} companies={companies} />
    </div>
  );
}
