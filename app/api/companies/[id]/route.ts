import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Company, GhgScope, PcfStage, PostCategory } from "@/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const c = await prisma.company.findUnique({
      where: { id },
      include: {
        emissions: true,
        products: { include: { pcf: true } },
        posts: { orderBy: { dateTime: "desc" } },
      },
    });

    if (!c) {
      return NextResponse.json(
        { data: null, error: "기업을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const company: Company & { posts?: unknown[] } = {
      id: c.id,
      name: c.name,
      country: c.country,
      industry: c.industry as Company["industry"],
      emissions: c.emissions.map((e) => ({
        id: e.id,
        yearMonth: e.yearMonth,
        sourceId: e.sourceId,
        scope: e.scope as GhgScope,
        activityData: e.activityData,
        emissions: e.emissions,
      })),
      products: c.products.map((p) => ({
        id: p.id,
        companyId: p.companyId,
        name: p.name,
        functionalUnit: p.functionalUnit,
        totalEmissions: p.totalEmissions,
        pcf: p.pcf.map((entry) => ({
          stage: entry.stage as PcfStage,
          emissions: entry.emissions,
          description: entry.description ?? undefined,
        })),
      })),
      posts: c.posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        category: p.category as PostCategory,
        resourceUid: p.companyId,
        dateTime: p.dateTime.toISOString(),
      })),
    };

    return NextResponse.json({ data: company });
  } catch (error) {
    console.error("[GET /api/companies/[id]]", error);
    return NextResponse.json({ data: null, error: "서버 오류" }, { status: 500 });
  }
}
