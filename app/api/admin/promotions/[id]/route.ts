import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const { id } = await params;
  const b = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["title", "description", "appliesTo", "bannerText"]) if (k in b) data[k] = b[k] || null;
  if ("code" in b) data.code = b.code ? String(b.code).toUpperCase() : null;
  if ("type" in b) data.type = b.type === "fixed" ? "fixed" : "percent";
  for (const k of ["value", "minSubtotal", "maxUses"]) if (k in b) data[k] = b[k] ? Number(b[k]) : null;
  if ("active" in b) data.active = Boolean(b.active);
  if ("startsAt" in b) data.startsAt = b.startsAt ? new Date(b.startsAt) : null;
  if ("endsAt" in b) data.endsAt = b.endsAt ? new Date(b.endsAt) : null;
  return NextResponse.json({ ok: true, promotion: await prisma.promotion.update({ where: { id }, data }) });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const { id } = await params;
  await prisma.promotion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
