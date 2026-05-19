import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Post, PostCategory } from "@/types";

// Prisma Post row → our Post type (companyId → resourceUid)
function mapPost(p: {
  id: string;
  title: string;
  content: string;
  category: string;
  companyId: string;
  dateTime: Date;
}): Post {
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    category: p.category as PostCategory,
    resourceUid: p.companyId,
    dateTime: p.dateTime.toISOString(),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  try {
    const rows = await prisma.post.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { dateTime: "desc" },
    });
    return NextResponse.json({ data: rows.map(mapPost) });
  } catch (error) {
    console.error("[GET /api/posts]", error);
    return NextResponse.json({ data: [], error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        category: body.category,
        companyId: body.resourceUid,
        dateTime: new Date(),
      },
    });
    return NextResponse.json({ data: mapPost(post) }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/posts]", error);
    return NextResponse.json({ data: null, error: "서버 오류" }, { status: 500 });
  }
}
