import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { generateOfferNumber } from "@/lib/utils";
import { tgNotifyOffer } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const s = await getSettings();
  if (!s.negotiableEnabled) {
    return NextResponse.json({
      ok: false,
      message: "Offers are currently disabled.",
    });
  }

  const body = (await req.json().catch(() => ({}))) as {
    productId?: string;
    variantId?: string | null;
    amount?: number;
    currency?: string;
    customerEmail?: string;
    customerName?: string | null;
    message?: string | null;
  };

  if (!body.productId) {
    return NextResponse.json({ ok: false, message: "Missing product." });
  }
  if (!body.amount || body.amount <= 0) {
    return NextResponse.json({ ok: false, message: "Invalid amount." });
  }
  if (!body.customerEmail || !body.customerEmail.includes("@")) {
    return NextResponse.json({
      ok: false,
      message: "A valid email is required.",
    });
  }

  const product = await prisma.product.findUnique({
    where: { id: body.productId },
  });
  if (!product || !product.visible || !product.negotiable) {
    return NextResponse.json({
      ok: false,
      message: "This product is not negotiable.",
    });
  }
  if (
    product.minOfferPrice &&
    body.amount < product.minOfferPrice
  ) {
    return NextResponse.json({
      ok: false,
      message: "Offer below minimum allowed.",
    });
  }

  const offer = await prisma.offer.create({
    data: {
      number: generateOfferNumber(),
      productId: product.id,
      variantId: body.variantId || null,
      proposedPrice: body.amount,
      status: "open",
      customerEmail: body.customerEmail,
      customerName: body.customerName || null,
      message: body.message || "",
    },
  });

  tgNotifyOffer(offer.id).catch(() => null);

  return NextResponse.json({
    ok: true,
    offer: { id: offer.id, number: offer.number },
  });
}
