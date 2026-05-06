import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id, itemId } = await params;
  const body = (await req.json()) as { quantity?: number };
  if (typeof body.quantity !== "number" || body.quantity < 1) {
    return NextResponse.json({ ok: false, message: "Invalid quantity." }, { status: 400 });
  }
  const result = await prisma.$transaction(async (tx) => {
    const item = await tx.orderItem.findUnique({ where: { id: itemId } });
    if (!item || item.orderId !== id) {
      throw new Error("Item not found.");
    }
    const newTotal = item.unitPrice * body.quantity!;
    await tx.orderItem.update({
      where: { id: itemId },
      data: { quantity: body.quantity!, total: newTotal },
    });
    const items = await tx.orderItem.findMany({ where: { orderId: id } });
    const subtotal = items.reduce((a, i) => a + i.total, 0);
    const order = await tx.order.findUnique({ where: { id } });
    const total = subtotal - (order?.discount ?? 0);
    const updated = await tx.order.update({
      where: { id },
      data: { subtotal, total },
    });
    return updated;
  });
  return NextResponse.json({ ok: true, order: result });
}
