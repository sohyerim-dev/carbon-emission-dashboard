import type { Company, Post, Product, Country, CarbonMarket, ApiResponse } from "@/types";
import { COUNTRIES, CARBON_MARKETS } from "@/lib/data";

// 쓰기 작업 실패 시뮬레이션 (15% 확률)
// 실제 DB를 건드리기 전에 throw → 클라이언트의 에러 처리·롤백 흐름 검증용
const WRITE_FAILURE_RATE = 0.15;
function mayFail() {
  if (Math.random() < WRITE_FAILURE_RATE) {
    throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
}

// -- 읽기 ----------

export async function fetchCompanies(): Promise<ApiResponse<Company[]>> {
  const res = await fetch("/api/companies");
  return res.json();
}

export async function fetchCompany(id: string): Promise<ApiResponse<Company>> {
  const res = await fetch(`/api/companies/${id}`);
  return res.json();
}

export async function fetchPosts(companyId?: string): Promise<ApiResponse<Post[]>> {
  const url = companyId ? `/api/posts?companyId=${companyId}` : "/api/posts";
  const res = await fetch(url);
  return res.json();
}

// SWR 키 "posts" 로 사용 중인 함수 — fetchPosts 와 동일
export async function fetchPostsFromStore(companyId?: string): Promise<ApiResponse<Post[]>> {
  return fetchPosts(companyId);
}

export async function fetchProducts(companyId?: string): Promise<ApiResponse<Product[]>> {
  if (companyId) {
    const res = await fetch(`/api/companies/${companyId}`);
    const json: ApiResponse<Company> = await res.json();
    return { data: json.data?.products ?? [], error: json.error };
  }
  return { data: [] };
}

// 국가·탄소 시장은 정적 데이터 — DB 불필요
export async function fetchCountries(): Promise<ApiResponse<Country[]>> {
  return { data: COUNTRIES };
}

export async function fetchCarbonMarkets(): Promise<ApiResponse<CarbonMarket[]>> {
  return { data: CARBON_MARKETS };
}

// -- 쓰기 ----------

export async function createPost(
  post: Omit<Post, "id" | "dateTime">,
): Promise<ApiResponse<Post>> {
  mayFail();
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  return res.json();
}

export async function updatePost(
  id: string,
  updates: Partial<Omit<Post, "id">>,
): Promise<ApiResponse<Post>> {
  mayFail();
  const res = await fetch(`/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deletePost(id: string): Promise<ApiResponse<null>> {
  mayFail();
  const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
  return res.json();
}
