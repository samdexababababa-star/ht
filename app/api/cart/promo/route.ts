import { NextRequest, NextResponse } from "next/server";
import { findPromotionByCode, isPromotionActive, computeDiscount } from "@/lib/promotions";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = String(body?.code ?? "").trim();
  const subtotal = Math.max(0, Number(body?.subtotal ?? 0));
  if (!code) return NextResponse.json({ discount: 0 });

  const promo = await findPromotionByCode(code);
  if (!promo) return NextResponse.json({ discount: 0 }, { status: 404 });
  if (!isPromotionActive(promo, subtotal)) {
    return NextResponse.json({ discount: 0, reason: "inactive" });
  }
  const discount = computeDiscount(promo, subtotal);
  return NextResponse.json({ discount, title: promo.title, type: promo.type });
}
