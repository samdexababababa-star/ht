import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { findOrderForClaim } from "@/lib/claims";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const s = await getSettings();
  if (!s.warrantyEnabled) {
    return NextResponse.json({ ok: false, message: "Claims are currently disabled." });
  }
  const body = (await req.json()) as { orderNumber?: string; email?: string };
  if (!body.orderNumber || !body.email) {
    return NextResponse.json({ ok: false, message: "Order number and email required." });
  }
  const r = await findOrderForClaim({
    orderNumber: body.orderNumber,
    email: body.email,
  });
  if (!r.ok) return NextResponse.json(r);

  // Window check: if every item's product has a per-product window, use the max,
  // otherwise fall back to settings.warrantyDefaultDays.
  const productIds = r.order.items.map((i) => i.productId).filter(Boolean) as string[];
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, warrantyDays: true },
      })
    : [];
  const days = Math.max(
    s.warrantyDefaultDays,
    ...products.map((p) => p.warrantyDays ?? s.warrantyDefaultDays),
    0,
  );
  const ageMs = Date.now() - r.order.createdAt.getTime();
  if (ageMs > days * 24 * 3600 * 1000) {
    return NextResponse.json({
      ok: false,
      message: `This order is past its ${days}-day warranty window.`,
    });
  }

  return NextResponse.json({
    ok: true,
    order: {
      id: r.order.id,
      number: r.order.number,
      email: r.order.email,
      createdAt: r.order.createdAt.toISOString(),
      total: r.order.total,
      currency: r.order.currency,
      items: r.order.items.map((i) => ({
        id: i.id,
        name: i.name,
        variantName: i.variantName,
        quantity: i.quantity,
      })),
    },
  });
}
