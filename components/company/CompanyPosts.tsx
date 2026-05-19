"use client";

import { useState } from "react";
import { Post } from "@/types";
import { updatePost, deletePost, fetchPostsFromStore } from "@/lib/api";
import { useSWRConfig } from "swr";
import Card from "@/components/ui/Card";

const CATEGORY_LABEL: Record<string, string> = {
  announcement: "공지",
  report: "보고서",
  news: "뉴스",
};

const CATEGORY_COLOR: Record<string, string> = {
  announcement: "#43c59e",
  report: "#4f8ef7",
  news: "#f59e0b",
};

export default function CompanyPosts({
  posts,
  companyId,
  onMutate,
}: {
  posts: Post[];
  companyId: string;
  onMutate: () => void;
}) {
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  if (posts.length === 0) {
    return (
      <Card>
        <p
          className="text-center py-10 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          등록된 공시가 없습니다.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostRow
          key={post.id}
          post={post}
          onEdit={() => setEditingPost(post)}
          onDelete={async () => {
            // optimistic update — 먼저 UI에서 제거
            onMutate();
            try {
              await deletePost(post.id);
              onMutate();
            } catch {
              // 실패 시 rollback
              onMutate();
              alert("삭제에 실패했습니다. 다시 시도해주세요.");
            }
          }}
        />
      ))}

      {editingPost && (
        <EditModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={() => {
            setEditingPost(null);
            onMutate();
          }}
        />
      )}
    </div>
  );
}

function PostRow({
  post,
  onEdit,
  onDelete,
}: {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `${CATEGORY_COLOR[post.category]}20`,
                color: CATEGORY_COLOR[post.category],
              }}
            >
              {CATEGORY_LABEL[post.category]}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {new Date(post.dateTime).toLocaleDateString("ko-KR")}
            </span>
          </div>
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {post.title}
          </p>
          <p
            className="text-xs mt-1 line-clamp-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {post.content}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onEdit}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: "var(--bg-base)",
              color: "var(--text-secondary)",
            }}
          >
            수정
          </button>
          <button
            onClick={onDelete}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: "#fee2e2", color: "#ef4444" }}
          >
            삭제
          </button>
        </div>
      </div>
    </Card>
  );
}

function EditModal({
  post,
  onClose,
  onSaved,
}: {
  post: Post;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updatePost(post.id, { title, content });
      onSaved();
    } catch (e: any) {
      setError(e.message ?? "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    // 모달 오버레이
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl p-6 space-y-4"
        style={{ background: "var(--bg-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-base font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          공시 수정
        </h3>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용"
            rows={5}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* 에러 메시지 + 재시도 */}
        {error && (
          <div
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ background: "#fee2e2" }}
          >
            <p className="text-xs" style={{ color: "#ef4444" }}>
              {error}
            </p>
            <button
              onClick={handleSave}
              className="text-xs font-medium ml-3"
              style={{ color: "#ef4444" }}
            >
              재시도
            </button>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: "var(--bg-base)",
              color: "var(--text-secondary)",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{
              background: saving ? "var(--text-muted)" : "var(--grad-start)",
            }}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
