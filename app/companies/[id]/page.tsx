export default function CompanyPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex items-center justify-center h-64">
      <p style={{ color: "var(--text-muted)" }}>기업 상세 준비 중 — {params.id}</p>
    </div>
  );
}
