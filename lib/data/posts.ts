import { Post } from "@/types";

export const POSTS: Post[] = [
  // -- Acme Manufacturing ----------
  {
    id: "post-acme-1",
    title: "2024년 온실가스 감축 목표 달성 발표",
    resourceUid: "acme",
    dateTime: "2025-01-15T09:00:00Z",
    category: "announcement",
    content:
      "Acme Manufacturing은 2024년 Scope 1·2 배출량을 전년 대비 5.2% 감축하여 내부 목표를 초과 달성했습니다. 주요 요인으로는 공장 보일러 고효율 교체 및 태양광 패널 설치가 있습니다.",
  },
  {
    id: "post-acme-2",
    title: "2024 지속가능경영 보고서 발간",
    resourceUid: "acme",
    dateTime: "2025-03-20T10:00:00Z",
    category: "report",
    content:
      "2024년 지속가능경영 보고서를 발간합니다. 본 보고서는 GHG Protocol 기준에 따라 Scope 1, 2, 3 배출량을 전수 측정하여 작성되었습니다. 2030년 Net Zero 로드맵도 포함되어 있습니다.",
  },

  // -- Globex Logistics ----------
  {
    id: "post-globex-1",
    title: "전기 화물차 도입 계획 발표",
    resourceUid: "globex",
    dateTime: "2025-02-10T08:30:00Z",
    category: "announcement",
    content:
      "Globex Logistics는 2026년까지 보유 차량의 30%를 전기 화물차로 전환할 계획입니다. 이를 통해 Scope 1 배출량의 약 25% 감축이 예상됩니다.",
  },
  {
    id: "post-globex-2",
    title: "물류 탄소 배출 감축 관련 규제 동향",
    resourceUid: "globex",
    dateTime: "2025-04-05T14:00:00Z",
    category: "news",
    content:
      "미국 캘리포니아주가 2030년부터 신규 대형 화물차의 전기차 의무화 규정을 시행할 예정입니다. CA-CAP(캘리포니아 탄소 거래제) 참여 기업은 추가적인 탄소 비용 부담이 예상됩니다.",
  },

  // -- Initech Steel ----------
  {
    id: "post-initech-1",
    title: "EU 탄소국경조정제도(CBAM) 대응 전략 공유",
    resourceUid: "initech",
    dateTime: "2025-01-28T11:00:00Z",
    category: "announcement",
    content:
      "EU CBAM(탄소국경조정제도) 전환기가 2026년 본격 시행됨에 따라, Initech Steel은 수출 제품의 내재 탄소량 측정 체계를 구축 완료했습니다. 현재 열연 코일 1톤당 2.65 tCO2e 수준이며, 수소환원제철 전환을 통한 감축을 추진 중입니다.",
  },
  {
    id: "post-initech-2",
    title: "2024년 4분기 생산 및 배출량 현황 보고",
    resourceUid: "initech",
    dateTime: "2025-02-03T09:00:00Z",
    category: "report",
    content:
      "2024년 4분기 철강 생산량은 전기 대비 3% 증가했으나, 고효율 전기로 도입으로 배출량 증가는 1.2% 수준에서 억제되었습니다.",
  },

  // -- Umbrella Tech ----------
  {
    id: "post-umbrella-1",
    title: "데이터센터 재생에너지 전환율 70% 달성",
    resourceUid: "umbrella",
    dateTime: "2025-03-01T10:00:00Z",
    category: "announcement",
    content:
      "Umbrella Tech은 2025년 3월 기준 전체 데이터센터 전력의 70%를 재생에너지로 충당하고 있습니다. 2027년까지 100% RE100 달성을 목표로 하고 있으며, 이는 Scope 2 배출량 전면 제거를 의미합니다.",
  },
  {
    id: "post-umbrella-2",
    title: "AI 연산 증가에 따른 전력 소비 증가 우려",
    resourceUid: "umbrella",
    dateTime: "2025-05-12T13:00:00Z",
    category: "news",
    content:
      "생성형 AI 서비스 확대로 데이터센터 전력 소비가 급증하고 있습니다. Umbrella Tech은 AI 워크로드 최적화를 통해 연산당 탄소 배출량(Carbon per Query)을 줄이는 기술 개발에 투자 중입니다.",
  },

  // -- 한성 리테일 ----------
  {
    id: "post-hansung-1",
    title: "공급망 탄소 공개 요구 정책 도입",
    resourceUid: "hansung",
    dateTime: "2025-02-20T09:00:00Z",
    category: "announcement",
    content:
      "한성 리테일은 2026년부터 주요 협력사에 GHG 배출량 공개를 의무화합니다. Scope 3 공급망 배출량이 전체의 40% 이상을 차지하는 만큼, 협력사 감축 협력이 핵심 과제입니다.",
  },
  {
    id: "post-hansung-2",
    title: "친환경 포장재 전환으로 폐기물 배출 12% 감소",
    resourceUid: "hansung",
    dateTime: "2025-04-18T10:30:00Z",
    category: "report",
    content:
      "2025년 1분기 친환경 포장재 전환 결과, 매립 폐기물 발생량이 전년 동기 대비 12% 감소했습니다. 연간 기준으로 약 52톤의 폐기물 감축 효과가 예상됩니다.",
  },
];

export const getPostsByCompany = (companyId: string): Post[] =>
  POSTS.filter((p) => p.resourceUid === companyId);
