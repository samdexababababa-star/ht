import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  return NextResponse.json({
    ok: true,
    promotions: await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
  });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const b = await req.json();
  const created = await prisma.promotion.create({
    data: {
      code: b.code ? String(b.code).toUpperCase() : null,
      title: String(b.title ?? "Promotion"),
      description: b.description || null,
      type: b.type === "fixed" ? "fixed" : "percent",
      value: Number(b.value ?? 0),
      appliesTo: b.appliesTo || "all",
      minSubtotal: b.minSubtotal ? Number(b.minSubtotal) : null,
      maxUses: b.maxUses ? Number(b.maxUses) : null,
      startsAt: b.startsAt ? new Date(b.startsAt) : null,
      endsAt: b.endsAt ? new Date(b.endsAt) : null,
      bannerText: b.bannerText || null,
      active: b.active ?? true,
    },
  });
  return NextResponse.json({ ok: true, promotion: created });
}
