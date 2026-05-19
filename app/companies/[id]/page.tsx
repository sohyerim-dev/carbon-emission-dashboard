import CompanyContent from "@/components/company/CompanyContent";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 16: params가 Promise로 바뀜 — await 필수
  const { id } = await params;
  return <CompanyContent companyId={id} />;
}
