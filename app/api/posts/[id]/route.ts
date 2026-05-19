import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Post, PostCategory } from "@/types";

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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.category !== undefined && { category: body.category }),
      },
    });
    return NextResponse.json({ data: mapPost(updated) });
  } catch (error) {
    console.error("[PUT /api/posts/[id]]", error);
    return NextResponse.json({ data: null, error: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ data: null });
  } catch (error) {
    console.error("[DELETE /api/posts/[id]]", error);
    return NextResponse.json({ data: null, error: "서버 오류" }, { status: 500 });
  }
}
