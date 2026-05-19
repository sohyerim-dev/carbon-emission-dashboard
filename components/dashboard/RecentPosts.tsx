import Card from "@/components/ui/Card";
import { Post } from "@/types";

const CATEGORY_LABEL: Record<string, string> = {
  announcement: "공시",
  report: "보고서",
  news: "뉴스",
};

const CATEGORY_COLOR: Record<string, string> = {
  announcement: "#4f8ef7",
  report: "#43c59e",
  news: "#3ab5d4",
};

export default function RecentPosts({ posts }: { posts: Post[] }) {
  const sorted = [...posts]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);

  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        최근 공시
      </h2>
      <Card>
        {sorted.map((post, i) => (
          <div
            key={post.id}
            className="py-3.5"
            style={{
              borderTop: i !== 0 ? "1px solid var(--border-subtle)" : "none",
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: `${CATEGORY_COLOR[post.category]}18`,
                  color: CATEGORY_COLOR[post.category],
                }}
              >
                {CATEGORY_LABEL[post.category]}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {new Date(post.dateTime).toLocaleDateString("ko-KR")}
              </span>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {post.title}
            </p>
          </div>
        ))}
      </Card>
    </section>
  );
}
