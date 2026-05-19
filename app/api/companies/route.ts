import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Company, GhgScope } from "@/types";

type CompanyWithEmissions = Prisma.CompanyGetPayload<{ include: { emissions: true } }>;

export async function GET() {
  try {
    const rows = await prisma.company.findMany({
      include: { emissions: true },
    });

    const companies: Company[] = rows.map((c: CompanyWithEmissions) => ({
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
    }));

    return NextResponse.json({ data: companies });
  } catch (error) {
    console.error("[GET /api/companies]", error);
    return NextResponse.json({ data: [], error: "서버 오류" }, { status: 500 });
  }
}
