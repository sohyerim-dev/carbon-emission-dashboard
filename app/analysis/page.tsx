import AnalysisContent from "@/components/analysis/AnalysisContent";

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          심층 분석
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          기업·산업·Scope·기간별 다각도 배출 탐색
        </p>
      </div>
      <AnalysisContent />
    </div>
  );
}
