import {
  Company,
  Post,
  Product,
  Country,
  CarbonMarket,
  ApiResponse,
} from "@/types";
import {
  COMPANIES,
  POSTS,
  PRODUCTS,
  COUNTRIES,
  CARBON_MARKETS,
  getCompany,
  getPostsByCompany,
  getProductsByCompany,
} from "@/lib/data";

// Fake Backend 구조
// 요청 들어옴
//     ↓
// delay() — 200~800ms 랜덤 대기 (네트워크 시뮬레이션)
//     ↓
// 읽기? → 데이터 반환
// 쓰기? → mayFail() — 15% 확률로 에러 throw
//     ↓
// 성공 시 데이터 반환 / 실패 시 에러

// 네트워크 지연 시뮬레이션 (200~800ms)
const delay = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * 600 + 200));

// 쓰기 작업 실패 시뮬레이션 (15% 확률)
// 실제 서비스에서 발생할 수 있는 서버 오류, 네트워크 타임아웃 등을 재현
const WRITE_FAILURE_RATE = 0.15;

const mayFail = (): void => {
  if (Math.random() < WRITE_FAILURE_RATE) {
    throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
};

// -- 읽기 API (항상 성공) ----------

// 전체 기업 목록
export async function fetchCompanies(): Promise<ApiResponse<Company[]>> {
  await delay();
  return { data: COMPANIES };
}

// 기업 하나
export async function fetchCompany(id: string): Promise<ApiResponse<Company>> {
  await delay();
  const company = getCompany(id);
  if (!company)
    return { data: null as never, error: "기업을 찾을 수 없습니다." };
  return { data: company };
}

// Post 목록
export async function fetchPosts(
  companyId?: string,
): Promise<ApiResponse<Post[]>> {
  await delay();
  const posts = companyId ? getPostsByCompany(companyId) : POSTS;
  return { data: posts };
}

// 제품 목록
export async function fetchProducts(
  companyId?: string,
): Promise<ApiResponse<Product[]>> {
  await delay();
  const products = companyId ? getProductsByCompany(companyId) : PRODUCTS;
  return { data: products };
}
// 국가 목록
export async function fetchCountries(): Promise<ApiResponse<Country[]>> {
  await delay();
  return { data: COUNTRIES };
}
// 탄소 시장 목록
export async function fetchCarbonMarkets(): Promise<
  ApiResponse<CarbonMarket[]>
> {
  await delay();
  return { data: CARBON_MARKETS };
}

// -- 쓰기 API (15% 확률로 실패) ----------
// 실패 시 throw -> 호출부에서 try/catch로 롤백 처리

// 인메모리 Post 저장소 (새로고침 시 초기화)
let postsStore: Post[] = [...POSTS];

// 새 게시글 작성
export async function createPost(
  post: Omit<Post, "id" | "dateTime">, // Post 에서 id, dateTime 만 제외 -> 서버가 자동 생성하니까 직접 안 넣어도 됨
): Promise<ApiResponse<Post>> {
  await delay();
  mayFail();

  const newPost: Post = {
    ...post, // 받은 내용 그대로
    id: `post-${Date.now()}`, // id 자동 생성 (현재 타임스탬프)
    dateTime: new Date().toISOString(), // 현재 시각 자동 입력
  };
  postsStore = [...postsStore, newPost]; // 기존 배열 + 새 게시글
  return { data: newPost };
}

// 게시글 수정
export async function updatePost(
  id: string,
  updates: Partial<Omit<Post, "id">>, // 모든 필드가 선택 사항 -> 제목만 바꾸고 싶다면 {title: "새 제목"} 으로 넘기면 됨
): Promise<ApiResponse<Post>> {
  await delay();
  mayFail();

  const index = postsStore.findIndex((p) => p.id === id);
  if (index === -1)
    return { data: null as never, error: "게시글을 찾을 수 없습니다." };

  const updated = { ...postsStore[index], ...updates };
  // 기존 데이터에 변경사항 덮어쓰기
  postsStore = postsStore.map((p) => (p.id === id ? updated : p));
  // 해당 id 것만 교체, 나머지는 그대로
  return { data: updated };
}

// 게시글 삭제
export async function deletePost(id: string): Promise<ApiResponse<null>> {
  await delay();
  mayFail();

  postsStore = postsStore.filter((p) => p.id !== id);
  // id가 다른 것들만 남김 -> 해당 게시글 제거
  return { data: null };
}

// 현재 postsStore 반환 (인메모리 상태 반영)
export async function fetchPostsFromStore(
  companyId?: string,
): Promise<ApiResponse<Post[]>> {
  await delay();
  const posts = companyId
    ? postsStore.filter((p) => p.resourceUid === companyId)
    : postsStore;
  return { data: posts };
}

// fetchPosts - POSTS(고정) : 초기 로딩
// fetchPostsFromStore - postsStore (변동) : 쓰기 작업 후 갱신
