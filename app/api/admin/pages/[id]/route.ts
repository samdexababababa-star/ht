import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const { id } = await params;
  const b = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["title", "slug", "kind", "seoTitle", "seoDescription"]) if (k in b) data[k] = b[k] || null;
  if ("content" in b) data.content = typeof b.content === "string" ? b.content : JSON.stringify(b.content);
  if ("visible" in b) data.visible = Boolean(b.visible);
  return NextResponse.json({ ok: true, page: await prisma.page.update({ where: { id }, data }) });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const { id } = await params;
  await prisma.page.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
