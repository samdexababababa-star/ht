import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { tgNotifyOrderPaid } from "@/lib/telegram";

/**
 * LemonSqueezy webhook receiver.
 * Verifies the X-Signature using the secret saved in Settings, then flips the
 * matching Order to "paid".
 */
export async function POST(req: NextRequest) {
  const settings = await getSettings();
  const raw = await req.text();
  const signature = req.headers.get("x-signature") || "";

  if (settings.lsWebhookSecret) {
    const hmac = crypto.createHmac("sha256", settings.lsWebhookSecret);
    const digest = hmac.update(raw).digest("hex");
    if (
      signature.length !== digest.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
    ) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  let payload: {
    meta?: { event_name?: string; custom_data?: Record<string, string> };
    data?: { id?: string };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const event = payload?.meta?.event_name ?? "";
  const orderId = payload?.meta?.custom_data?.orderId;
  const orderNumber = payload?.meta?.custom_data?.orderNumber;
  const lsRef = payload?.data?.id;

  if (
    event &&
    (event === "order_created" ||
      event === "order_paid" ||
      event === "subscription_created" ||
      event === "subscription_updated")
  ) {
    const where = orderId ? { id: orderId } : orderNumber ? { number: orderNumber } : null;
    if (where) {
      const updated = await prisma.order.update({
        where,
        data: { status: "paid", paidAt: new Date(), paymentRef: lsRef ?? null },
      });
      tgNotifyOrderPaid(updated.id).catch(() => null);
    }
  }
  return NextResponse.json({ ok: true });
}
