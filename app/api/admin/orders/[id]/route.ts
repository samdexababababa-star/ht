import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("status" in body) data.status = body.status;
  if ("notes" in body) data.notes = body.notes;
  if (body.status === "paid") data.paidAt = new Date();
  return NextResponse.json({ ok: true, order: await prisma.order.update({ where: { id }, data }) });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const { id } = await params;
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
