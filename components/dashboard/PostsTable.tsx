"use client";

import { useState, useEffect } from "react";
import { Post, Company, PostCategory } from "@/types";
import { sumEmissions } from "@/lib/utils/dashboard";
import { deletePost, updatePost } from "@/lib/api";

const CATEGORY_LABEL: Record<PostCategory, string> = {
  announcement: "공시",
  report:        "보고서",
  news:          "뉴스",
};

const CATEGORY_COLOR: Record<PostCategory, string> = {
  announcement: "#4f8ef7",
  report:       "#43c59e",
  news:         "#3ab5d4",
};

type SaveStatus = "idle" | "saving" | "success" | "error";

interface EditingPost {
  id: string;
  title: string;
  category: PostCategory;
}

interface PostsTableProps {
  posts: Post[];
  companies: Company[];
  limit?: number; // 기본값 없으면 전체 표시
}

export default function PostsTable({ posts, companies, limit }: PostsTableProps) {
  const [localPosts, setLocalPosts] = useState<Post[]>(posts);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingPost | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");

  // 부모에서 posts prop이 바뀌면 동기화
  useEffect(() => { setLocalPosts(posts); }, [posts]);

  // 삭제 — 낙관적 UI (즉시 제거 후 실패 시 복구)
  async function handleDelete(id: string) {
    const backup = localPosts;
    setDeletingId(id);
    setLocalPosts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deletePost(id);
    } catch {
      setLocalPosts(backup); // 실패 시 롤백
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeletingId(null);
    }
  }

  // 수정 모달 열기
  function openEdit(post: Post) {
    setEditing({ id: post.id, title: post.title, category: post.category });
    setSaveStatus("idle");
    setSaveError("");
  }

  // 저장
  async function handleSave() {
    if (!editing) return;
    setSaveStatus("saving");
    setSaveError("");
    try {
      const result = await updatePost(editing.id, {
        title: editing.title,
        category: editing.category,
      });
      if (result.error) throw new Error(result.error);
      setLocalPosts((prev) =>
        prev.map((p) => p.id === editing.id ? { ...p, ...result.data } : p),
      );
      setSaveStatus("success");
      setTimeout(() => setEditing(null), 800);
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "저장 실패");
    }
  }

  const rows = [...localPosts]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, limit ?? localPosts.length)
    .map((post) => {
      const company = companies.find((c) => c.id === post.resourceUid);
      if (!company) return null;
      const t2025 = sumEmissions(company.emissions.filter((e) => e.yearMonth.startsWith("2025")));
      return { post, companyName: company.name, totalEmissions: Math.round(t2025) };
    })
    .filter(Boolean) as { post: Post; companyName: string; totalEmissions: number }[];

  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        최근 공시
      </h2>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}
      >
        {/* 테이블 헤더 */}
        <div
          className="grid text-xs font-semibold uppercase tracking-wide px-5 py-3 border-b"
          style={{
            gridTemplateColumns: "2fr 4fr 1.5fr 1fr 1.5fr",
            color: "var(--text-muted)",
            borderColor: "var(--border-subtle)",
            background: "var(--bg-base)",
          }}
        >
          <span>기업</span>
          <span>제목</span>
          <span>날짜</span>
          <span>상태</span>
          <span>관리</span>
        </div>

        {/* 테이블 바디 */}
        {rows.map(({ post, companyName }, i) => (
          <div
            key={post.id}
            className="grid items-center px-5 py-3 text-sm"
            style={{
              gridTemplateColumns: "2fr 4fr 1.5fr 1fr 1.5fr",
              borderTop: i !== 0 ? "1px solid var(--border-subtle)" : "none",
              opacity: deletingId === post.id ? 0.4 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {/* 기업 */}
            <span className="font-medium truncate pr-2" style={{ color: "var(--text-primary)" }}>
              {companyName}
            </span>

            {/* 제목 */}
            <span className="truncate pr-2" style={{ color: "var(--text-secondary)" }}>
              {post.title}
            </span>

            {/* 날짜 */}
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {new Date(post.dateTime).toLocaleDateString("ko-KR")}
            </span>

            {/* 상태 (카테고리) */}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium inline-block w-fit"
              style={{
                background: `${CATEGORY_COLOR[post.category]}18`,
                color: CATEGORY_COLOR[post.category],
              }}
            >
              {CATEGORY_LABEL[post.category]}
            </span>

            {/* 관리 버튼 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEdit(post)}
                className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{
                  background: "var(--bg-base)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                disabled={deletingId === post.id}
                className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{
                  background: "rgba(248,113,113,0.08)",
                  color: "#f87171",
                  border: "1px solid rgba(248,113,113,0.2)",
                }}
              >
                {deletingId === post.id ? "..." : "삭제"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 수정 모달 */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget && saveStatus !== "saving") setEditing(null); }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 border shadow-xl"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
          >
            <h3 className="text-base font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
              공시 수정
            </h3>

            {/* 제목 입력 */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                제목
              </label>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                disabled={saveStatus === "saving"}
                className="w-full text-sm px-4 py-2.5 rounded-lg border outline-none transition-all"
                style={{
                  background: "var(--bg-base)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* 카테고리 선택 */}
            <div className="mb-6">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                카테고리
              </label>
              <div className="flex gap-2">
                {(["announcement", "report", "news"] as PostCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEditing({ ...editing, category: cat })}
                    disabled={saveStatus === "saving"}
                    className="flex-1 py-2 text-xs rounded-lg transition-all"
                    style={{
                      background: editing.category === cat
                        ? `${CATEGORY_COLOR[cat]}18`
                        : "var(--bg-base)",
                      color: editing.category === cat ? CATEGORY_COLOR[cat] : "var(--text-secondary)",
                      border: editing.category === cat
                        ? `1px solid ${CATEGORY_COLOR[cat]}40`
                        : "1px solid var(--border-subtle)",
                      fontWeight: editing.category === cat ? 600 : 400,
                    }}
                  >
                    {CATEGORY_LABEL[cat]}
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
                저장 완료
              </p>
            )}

            {/* 버튼 */}
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setEditing(null)}
                disabled={saveStatus === "saving"}
                className="px-4 py-2 text-sm rounded-lg transition-all"
                style={{
                  background: "var(--bg-base)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                취소
              </button>
              <button
                onClick={saveStatus === "error" ? handleSave : handleSave}
                disabled={saveStatus === "saving" || saveStatus === "success"}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
                style={{
                  background: "linear-gradient(135deg, #43c59e, #4f8ef7)",
                  color: "#fff",
                  opacity: saveStatus === "saving" || saveStatus === "success" ? 0.7 : 1,
                }}
              >
                {saveStatus === "saving" ? "저장 중..." : saveStatus === "error" ? "재시도" : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
