import { NextRequest, NextResponse } from "next/server";
import { getCart, clearCart } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { findPromotionByCode, isPromotionActive, computeDiscount } from "@/lib/promotions";
import { generateOrderNumber } from "@/lib/utils";
import { createLemonCheckout } from "@/lib/lemonsqueezy";
import { tgNotifyOrder } from "@/lib/telegram";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional().default(""),
  whatsapp: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  promotionCode: z.string().optional().default(""),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid input." }, { status: 400 });
  }
  const cart = await getCart();
  if (cart.length === 0) {
    return NextResponse.json({ ok: false, message: "Cart is empty." }, { status: 400 });
  }

  const productIds = [...new Set(cart.map((c) => c.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { variants: true },
  });

  const lineItems = cart.map((c) => {
    const p = products.find((x) => x.id === c.productId);
    if (!p) return null;
    const v = c.variantId ? p.variants.find((x) => x.id === c.variantId) : undefined;
    const unitPrice = v?.price ?? p.basePrice;
    return {
      productId: p.id,
      variantId: v?.id,
      productName: p.name,
      variantName: v?.name,
      lsVariantId: v?.lsVariantId,
      quantity: c.quantity,
      unitPrice,
      total: unitPrice * c.quantity,
      currency: p.currency,
    };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  if (lineItems.length === 0) {
    return NextResponse.json({ ok: false, message: "No valid items." }, { status: 400 });
  }

  const subtotal = lineItems.reduce((a, l) => a + l.total, 0);
  const currency = lineItems[0].currency;

  // promotion
  let discount = 0;
  let promoId: string | null = null;
  if (parsed.data.promotionCode) {
    const promo = await findPromotionByCode(parsed.data.promotionCode);
    if (promo && isPromotionActive(promo, subtotal)) {
      discount = computeDiscount(promo, subtotal);
      promoId = promo.id;
    }
  }

  const total = Math.max(0, subtotal - discount);
  const settings = await getSettings();

  // create the order in DB
  const order = await prisma.order.create({
    data: {
      number: generateOrderNumber(),
      email: parsed.data.email,
      name: parsed.data.name,
      whatsapp: parsed.data.whatsapp,
      notes: parsed.data.notes,
      subtotal,
      discount,
      total,
      currency,
      promotionCode: parsed.data.promotionCode || null,
      paymentProvider: settings.paymentsEnabled && settings.lsApiKey ? "lemonsqueezy" : null,
      source: "site",
      items: {
        create: lineItems.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          name: l.productName,
          variantName: l.variantName,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          total: l.total,
        })),
      },
    },
  });

  // bump promo usage
  if (promoId) {
    await prisma.promotion.update({
      where: { id: promoId },
      data: { uses: { increment: 1 } },
    });
  }

  let redirectUrl: string | null = null;

  // — payment provider —
  const lsReady = settings.paymentsEnabled && settings.lsApiKey && settings.lsStoreId;
  const firstLs = lineItems.find((l) => l.lsVariantId)?.lsVariantId;
  if (lsReady && firstLs) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
      redirectUrl = await createLemonCheckout({
        storeId: settings.lsStoreId!,
        variantId: firstLs,
        email: parsed.data.email,
        name: parsed.data.name,
        custom: { orderId: order.id, orderNumber: order.number },
        redirectUrl: `${baseUrl}/checkout/success?order=${order.number}`,
      });
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentUrl: redirectUrl },
      });
    } catch {
      // fall through — show success page anyway
    }
  }

  // WhatsApp redirect (before payment) wins over LS if configured that way
  if (
    !redirectUrl &&
    settings.waEnabled &&
    settings.waNumber &&
    (settings.waRedirectMode === "before" || settings.waRedirectMode === "both")
  ) {
    const wa = await buildWhatsAppLink({
      productName: lineItems[0].productName,
      variantName: lineItems[0].variantName,
      order,
    });
    if (wa) redirectUrl = wa;
  }

  // ping the operator on Telegram
  tgNotifyOrder(order.id).catch(() => null);

  // clear cart server-side
  await clearCart();

  return NextResponse.json({
    ok: true,
    orderNumber: order.number,
    redirectUrl,
  });
}
