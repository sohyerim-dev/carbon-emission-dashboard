// ---------------------------------
// 기본 도메인 타입
// ---------------------------------
// GHG = Greenhouse Gas(온실 가스)
// 대표적 온실가스 : CO2(이산화탄소) - 연료 태울 때 주로 발생,
// CH4(메탄) - 축산업, 매립지에서 발생,
// N2O(아산화질소) - 비료, 농업에서 발생
// 온실가스를 CO2 기준으로 환산한 단위가 tCO2e(이산화탄소 환산톤)
// GHG Emission = 온실가스 배출량

// GHG(온실가스)를 발생 경로에 따라 3가지 범위(Scope)로 분류
// Scope 1: 기업이 직접 배출 (공장 연료, 차량)
// Scope 2: 구매한 에너지로 인한 간접 배출 (전기, 열)
// Scope 3: 공급망/출장 등 나머지 모든 간접 배출
export type GhgScope = "scope1" | "scope2" | "scope3";

export type Industry =
  | "manufacturing" // 제조업 ex)삼성전자, LG화학
  | "logistics" // 운송·물류 ex)CJ대한통운, FedEx
  | "heavy_industry" // 중공업 ex)포스코, ThyssenKrupp
  | "technology" // IT·기술 ex)카카오, Google, AWS
  | "retail"; // 소매·유통 ex)이마트, Walmart

export type EmissionCategory =
  | "stationary_combustion" // 고정 연소 - 공장 보일러, 발전기에서 연료 태울 때 (Scope 1)
  | "mobile_combustion" // 이동 연소 - 회사 차량, 트럭, 선박 운행할 때 (Scope 1)
  | "purchased_electricity" // 구매 전력 - 회사가 한전에서 사서 쓰는 전기  (Scope 2)
  | "purchased_heat" // 구매 열·증기 - 지역난방, 공장에서 공급받는 스팀 (Scope 2)
  | "business_travel" // 출장 - 직원 비행기, KTX 출장 (Scope 3)
  | "supply_chain" // 공급망 - 원자재 운송, 협력사 배출 (Scope 3)
  | "waste"; // 폐기물 - 매립, 소각 처리 (Scope 3)

// ---------------------------------
// 배출원 (Emission Source)
// ---------------------------------
export type EmissionSource = {
  id: string;
  name: string;
  scope: GhgScope;
  category: EmissionCategory;
  emissionFactor: number; // tCO2e / unit - 활동 1단위당 발생하는 CO2 양
  unit: string;
};

// ---------------------------------
// 국가
// ---------------------------------
export type Currency = "KRW" | "USD" | "EUR";

export type Country = {
  code: string;
  name: string;
  currency: Currency;
  defaultCarbonPrice: number; // USD/tCO2e (해당 국가 탄소 시장 기준)
  flagEmoji: string;
};

// ---------------------------------
// 배출량
// ---------------------------------
export type GhgEmission = {
  id: string;
  yearMonth: string; // '2024-01'
  sourceId: string;
  scope: GhgScope;
  activityData: number; // 실제 사용량 (liter, kWh 등)
  // 배출원마다 다른 단위
  // liter 연료
  // kWh(킬로와트시) 에너지
  // km 이동거리
  // ton 무게
  emissions: number; // tCO2e
};

// ---------------------------------
// 기업
// ---------------------------------
export type Company = {
  id: string;
  name: string;
  country: string; // Country.code
  industry: Industry;
  emissions: GhgEmission[];
  products?: Product[];
};

// ---------------------------------
// PCF (Product Carbon Footprint) - 제품 탄소 발자국 (제품 하나를 만들고 사용하고 버릴 때까지 발생하는 전체 CO2 양)
// ---------------------------------
export type PcfStage =
  | "raw_material" // 원자재 채취
  | "manufacturing" // 제조
  | "transport" // 운송
  | "use" //사용
  | "end_of_life"; // 폐기

export type PcfEntry = {
  // 제품의 한 단계에서 얼마나 CO2가 나왔는가
  stage: PcfStage; // 어느 단계? (raw_material, manufactruing)
  emissions: number; // 그 단계에서 몇 tCO2e?
  description?: string; // 설명 (선택사항)
};

// 예시
// { stage: 'raw_material', emissions: 0.12, description: '금속, 희토류 채굴' }
// { stage: 'manufacturing', emissions: 0.08, description: '공장 조립' }

export type Product = {
  id: string;
  companyId: string;
  name: string;
  functionalUnit: string; // '1개 생산 기준'
  pcf: PcfEntry[];
  totalEmissions: number;
};

// ---------------------------------
// Post (공시/업데이트)
// ---------------------------------
export type PostCategory = "announcement" | "report" | "news";

export type Post = {
  id: string;
  title: string;
  resourceUid: string; // Company.id
  dateTime: string;
  content: string;
  category: PostCategory;
};

// ---------------------------------
// 탄소세 시뮬레이터
// ---------------------------------
export type CarbonMarket = {
  id: string;
  name: string; // 'K-ETS' | 'EU ETS' | 'CA-CAP'
  // - 탄소 배출권 거래제 : 기업이 CO2를 배출할 수 있는 권리를 사고파는 시장
  // EU가 가장 강력한 기후 규제, 한국은 상대적으로 규제가 느슨
  price: number; // USD/tCO2e
  region: string;
  description: string;
};

export type TaxScenario = {
  label: string; // 시나리오 이름
  carbonPrice: number; // USD/tCO2e 탄소 가격
  targetReductionRate: number; // 0~1 목표 감축률
};

// ---------------------------------
// API 공통
// ---------------------------------
export type ApiResponse<T> = {
  data: T;
  error?: string;
};
