import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { createClaim } from "@/lib/claims";
import { tgNotifyClaim } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const s = await getSettings();
  if (!s.warrantyEnabled) {
    return NextResponse.json({ ok: false, message: "Claims are currently disabled." });
  }
  const body = (await req.json()) as {
    orderNumber?: string;
    orderItemId?: string;
    customerEmail?: string;
    customerName?: string;
    customerPhone?: string;
    reason?: string;
    message?: string;
    photos?: string[];
  };
  if (!body.customerEmail) {
    return NextResponse.json({ ok: false, message: "Email is required." });
  }
  if (!body.reason) {
    return NextResponse.json({ ok: false, message: "Reason is required." });
  }
  if (s.claimsRequirePhoto && (!body.photos || body.photos.length === 0)) {
    return NextResponse.json({
      ok: false,
      message: "At least one photo is required.",
    });
  }
  const photos = (body.photos ?? []).slice(0, s.claimsMaxPhotos);

  const claim = await createClaim({
    orderNumber: body.orderNumber,
    orderItemId: body.orderItemId,
    customerEmail: body.customerEmail,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    reason: body.reason,
    message: body.message,
    photos,
  });

  // Fire-and-forget Telegram notification.
  tgNotifyClaim(claim.id).catch(() => null);

  return NextResponse.json({ ok: true, claim: { id: claim.id, number: claim.number } });
}
