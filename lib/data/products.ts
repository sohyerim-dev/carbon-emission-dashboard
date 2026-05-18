import { Product } from "@/types";

// 각 기업의 대표 제품 PCF(제품 탄소 발자국) 데이터
// 가상 데이터이며, 실제 제품 LCA 결과와 다를 수 있습니다.
// 단위: tCO2e
export const PRODUCTS: Product[] = [
  {
    id: "acme-compressor",
    companyId: "acme",
    name: "산업용 에어컴프레서",
    functionalUnit: "1대 생산 기준",
    pcf: [
      {
        stage: "raw_material",
        emissions: 0.45,
        description: "금속 원자재(철강, 알루미늄) 채굴 및 가공",
      },
      {
        stage: "manufacturing",
        emissions: 0.28,
        description: "공장 조립, 도장, 품질 검사",
      },
      {
        stage: "transport",
        emissions: 0.08,
        description: "원자재 입고 및 완제품 출고 물류",
      },
      {
        stage: "use",
        emissions: 2.1,
        description: "10년 사용 기준 전력 소비",
      },
      {
        stage: "end_of_life",
        emissions: 0.09,
        description: "금속 부품 해체 및 재활용 처리",
      },
    ],
    totalEmissions: 3.0,
  },

  {
    id: "globex-freight",
    companyId: "globex",
    name: "국내 화물운송 서비스",
    functionalUnit: "서울-부산 편도 5톤 화물 기준 (400km)",
    pcf: [
      {
        stage: "raw_material",
        emissions: 0.0,
        description: "서비스업 특성상 해당 없음",
      },
      {
        stage: "manufacturing",
        emissions: 0.02,
        description: "운송 차량 제조 감가분 (차량 수명 기준 할당)",
      },
      {
        stage: "transport",
        emissions: 0.24,
        description: "경유 연소 (400km 운행)",
      },
      {
        stage: "use",
        emissions: 0.0,
        description: "운송 자체가 서비스이므로 별도 사용 단계 없음",
      },
      {
        stage: "end_of_life",
        emissions: 0.01,
        description: "차량 폐차 및 처리",
      },
    ],
    totalEmissions: 0.27,
  },

  {
    id: "initech-steel-coil",
    companyId: "initech",
    name: "열연 철강 코일",
    functionalUnit: "1톤 생산 기준",
    pcf: [
      {
        stage: "raw_material",
        emissions: 0.82,
        description: "철광석 채굴, 코크스(석탄) 생산",
      },
      {
        stage: "manufacturing",
        emissions: 1.65,
        description: "고로 제철, 전로 정련, 열간 압연",
      },
      {
        stage: "transport",
        emissions: 0.06,
        description: "원자재 해상운송 및 제품 출하",
      },
      {
        stage: "use",
        emissions: 0.0,
        description: "철강 자체는 사용 중 온실가스 배출 없음",
      },
      {
        stage: "end_of_life",
        emissions: 0.12,
        description: "스크랩 처리 및 매립",
      },
    ],
    totalEmissions: 2.65,
  },

  {
    id: "umbrella-cloud-server",
    companyId: "umbrella",
    name: "클라우드 서버 운영",
    functionalUnit: "서버 1대 1년 운영 기준",
    pcf: [
      {
        stage: "raw_material",
        emissions: 0.15,
        description: "희토류, 반도체 원자재 채굴",
      },
      {
        stage: "manufacturing",
        emissions: 0.32,
        description: "서버 하드웨어 제조 (반도체 공정 포함)",
      },
      {
        stage: "transport",
        emissions: 0.03,
        description: "데이터센터까지 글로벌 물류",
      },
      {
        stage: "use",
        emissions: 0.58,
        description: "데이터센터 전력 소비 (냉각 포함)",
      },
      {
        stage: "end_of_life",
        emissions: 0.08,
        description: "전자폐기물(e-waste) 처리",
      },
    ],
    totalEmissions: 1.16,
  },

  {
    id: "hansung-tshirt",
    companyId: "hansung",
    name: "면 티셔츠",
    // 한 장 단위는 tCO2e 수치가 너무 작아 가독성을 위해 100장 기준으로 설정
    functionalUnit: "100장 생산 및 판매 기준",
    pcf: [
      {
        stage: "raw_material",
        emissions: 0.21,
        description: "목화 재배(농약, 비료), 원사 생산",
      },
      {
        stage: "manufacturing",
        emissions: 0.35,
        description: "방적, 직조, 염색, 봉제 (해외 공장)",
      },
      {
        stage: "transport",
        emissions: 0.08,
        description: "해외 생산 후 국내 수입, 물류센터 배송",
      },
      {
        stage: "use",
        emissions: 0.33,
        description: "소비자 세탁 및 건조 반복 (제품 수명 기준)",
      },
      {
        stage: "end_of_life",
        emissions: 0.05,
        description: "매립 또는 소각 처리",
      },
    ],
    totalEmissions: 1.02,
  },
];

// 원하는 기업의 제품 목록 볼 때
export const getProductsByCompany = (companyId: string): Product[] =>
  PRODUCTS.filter((p) => p.companyId === companyId);
// 원하는 제품 상세 페이지 볼 때
export const getProduct = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);
