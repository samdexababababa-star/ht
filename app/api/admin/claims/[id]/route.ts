import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id } = await params;
  const body = (await req.json()) as { status?: string; adminNote?: string };
  const data: Record<string, unknown> = {};
  if (typeof body.status === "string") {
    data.status = body.status;
    if (body.status === "resolved" || body.status === "rejected") {
      data.resolvedAt = new Date();
    }
  }
  if (typeof body.adminNote === "string") data.adminNote = body.adminNote;
  const claim = await prisma.claim.update({ where: { id }, data });
  return NextResponse.json({ ok: true, claim });
}
