"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetchCompanies, fetchPostsFromStore, createPost } from "@/lib/api";
import { PostCategory } from "@/types";
import PostsTable from "@/components/dashboard/PostsTable";

const CATEGORY_OPTIONS: { label: string; value: PostCategory | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "공시", value: "announcement" },
  { label: "보고서", value: "report" },
  { label: "뉴스", value: "news" },
];

const CATEGORY_COLOR: Record<PostCategory, string> = {
  announcement: "#4f8ef7",
  report: "#43c59e",
  news: "#3ab5d4",
};

type SaveStatus = "idle" | "saving" | "success" | "error";

interface CreateForm {
  title: string;
  content: string;
  category: PostCategory;
  resourceUid: string;
}

const EMPTY_FORM: CreateForm = {
  title: "",
  content: "",
  category: "announcement",
  resourceUid: "",
};

export default function PostsPage() {
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "all">("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  // 작성 모달
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");

  const { data: companiesRes } = useSWR("companies", fetchCompanies);
  const { data: postsRes } = useSWR("posts", () => fetchPostsFromStore());

  const companies = companiesRes?.data ?? [];
  const allPosts = postsRes?.data ?? [];

  const filtered = allPosts.filter((p) => {
    const categoryMatch = selectedCategory === "all" || p.category === selectedCategory;
    const companyMatch = selectedCompany === "all" || p.resourceUid === selectedCompany;
    return categoryMatch && companyMatch;
  });

  function openCreate() {
    setForm({ ...EMPTY_FORM, resourceUid: companies[0]?.id ?? "" });
    setSaveStatus("idle");
    setSaveError("");
    setCreating(true);
  }

  async function handleCreate() {
    if (!form.title.trim() || !form.resourceUid) return;
    setSaveStatus("saving");
    setSaveError("");
    try {
      const result = await createPost({
        title: form.title,
        content: form.content,
        category: form.category,
        resourceUid: form.resourceUid,
      });
      if (result.error) throw new Error(result.error);
      setSaveStatus("success");
      await mutate("posts"); // SWR 캐시 갱신
      setTimeout(() => setCreating(false), 800);
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "작성 실패");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            공시 관리
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            전체 기업의 공시·보고서·뉴스를 조회하고 관리합니다.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all"
          style={{ background: "linear-gradient(135deg, #43c59e, #4f8ef7)", color: "#fff" }}
        >
          + 새 공시 작성
        </button>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1.5">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedCategory(opt.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: selectedCategory === opt.value
                  ? "linear-gradient(135deg, #43c59e, #4f8ef7)"
                  : "var(--bg-card)",
                color: selectedCategory === opt.value ? "#fff" : "var(--text-secondary)",
                border: selectedCategory === opt.value ? "none" : "1px solid var(--border-subtle)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

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
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <span className="ml-auto text-xs self-center" style={{ color: "var(--text-muted)" }}>
          {filtered.length}건
        </span>
      </div>

      <PostsTable posts={filtered} companies={companies} />

      {/* 작성 모달 */}
      {creating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget && saveStatus !== "saving") setCreating(false); }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 border shadow-xl"
            style={{ background: "#ffffff", borderColor: "#e2e8f0" }}
          >
            <h3 className="text-base font-semibold mb-5" style={{ color: "#0f172a" }}>
              새 공시 작성
            </h3>

            {/* 기업 선택 */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
                기업
              </label>
              <select
                value={form.resourceUid}
                onChange={(e) => setForm({ ...form, resourceUid: e.target.value })}
                disabled={saveStatus === "saving"}
                className="w-full text-sm px-4 py-2.5 rounded-lg border outline-none"
                style={{ background: "#f1f5f9", borderColor: "#cbd5e1", color: "#0f172a" }}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* 제목 */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
                제목
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={saveStatus === "saving"}
                placeholder="공시 제목을 입력하세요"
                className="w-full text-sm px-4 py-2.5 rounded-lg border outline-none"
                style={{ background: "#f1f5f9", borderColor: "#cbd5e1", color: "#0f172a" }}
              />
            </div>

            {/* 내용 */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
                내용
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                disabled={saveStatus === "saving"}
                placeholder="공시 내용을 입력하세요"
                rows={3}
                className="w-full text-sm px-4 py-2.5 rounded-lg border outline-none resize-none"
                style={{ background: "#f1f5f9", borderColor: "#cbd5e1", color: "#0f172a" }}
              />
            </div>

            {/* 카테고리 */}
            <div className="mb-6">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8" }}>
                카테고리
              </label>
              <div className="flex gap-2">
                {(["announcement", "report", "news"] as PostCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForm({ ...form, category: cat })}
                    disabled={saveStatus === "saving"}
                    className="flex-1 py-2 text-xs rounded-lg transition-all"
                    style={{
                      background: form.category === cat ? `${CATEGORY_COLOR[cat]}18` : "#f1f5f9",
                      color: form.category === cat ? CATEGORY_COLOR[cat] : "#475569",
                      border: form.category === cat
                        ? `1px solid ${CATEGORY_COLOR[cat]}40`
                        : "1px solid #e2e8f0",
                      fontWeight: form.category === cat ? 600 : 400,
                    }}
                  >
                    {{ announcement: "공시", report: "보고서", news: "뉴스" }[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* 상태 메시지 */}
            {saveStatus === "error" && (
              <p className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ color: "#f87171", background: "rgba(248,113,113,0.08)" }}>
                {saveError}
              </p>
            )}
            {saveStatus === "success" && (
              <p className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ color: "#43c59e", background: "rgba(67,197,158,0.08)" }}>
                작성 완료
              </p>
            )}

            {/* 버튼 */}
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setCreating(false)}
                disabled={saveStatus === "saving"}
                className="px-4 py-2 text-sm rounded-lg"
                style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={saveStatus === "saving" || saveStatus === "success" || !form.title.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                style={{
                  background: "linear-gradient(135deg, #43c59e, #4f8ef7)",
                  color: "#fff",
                  opacity: (saveStatus === "saving" || saveStatus === "success" || !form.title.trim()) ? 0.6 : 1,
                }}
              >
                {saveStatus === "saving" ? "저장 중..." : saveStatus === "error" ? "재시도" : "작성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
