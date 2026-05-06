import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { createLemonCheckout } from "@/lib/lemonsqueezy";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }

  const body = await req.json();
  const variantId = String(body.variantId ?? "").trim();
  const email = body.email ? String(body.email) : undefined;
  const name = body.name ? String(body.name) : undefined;
  const note = body.note ? String(body.note) : "";

  if (!variantId) {
    return NextResponse.json({ ok: false, message: "LemonSqueezy variant ID required." }, { status: 400 });
  }

  const settings = await getSettings();
  if (!settings.lsStoreId) {
    return NextResponse.json({ ok: false, message: "Set your LemonSqueezy Store ID first in Settings." }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      number: generateOrderNumber(),
      email,
      name,
      notes: note,
      paymentProvider: "manual_link",
      source: "manual",
    },
  });

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const url = await createLemonCheckout({
      storeId: settings.lsStoreId,
      variantId,
      email,
      name,
      custom: { orderId: order.id, orderNumber: order.number, manualLink: "1" },
      redirectUrl: `${baseUrl}/checkout/success?order=${order.number}`,
    });
    await prisma.order.update({ where: { id: order.id }, data: { paymentUrl: url } });
    return NextResponse.json({ ok: true, url, orderNumber: order.number });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Failed to create checkout." },
      { status: 500 },
    );
  }
}
