import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/settings";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  return NextResponse.json({ ok: true, settings: await getSettings() });
}

// Fields that are nullable in the schema — empty string becomes null.
const nullableStringFields = new Set<string>([
  "logoUrl", "faviconUrl", "supportEmail", "lsApiKey", "lsStoreId",
  "lsWebhookSecret", "tgBotToken", "tgChatId", "waNumber", "adminEmail",
  "announcementBar",
]);

const allowedFields = [
  // brand
  "brandName", "tagline", "logoUrl", "faviconUrl", "primaryColor", "accentColor",
  "supportEmail", "defaultCurrency", "defaultLocale",
  // payments
  "lsApiKey", "lsStoreId", "lsWebhookSecret", "paymentsEnabled",
  // telegram
  "tgBotToken", "tgChatId", "tgEnabled",
  "tgNotifyOnNewOrder", "tgNotifyOnPaid", "tgNotifyOnClaim", "tgNotifyOnOffer", "tgNotifyOnError",
  "tgOrderTemplate", "tgPaidTemplate", "tgClaimTemplate", "tgOfferTemplate",
  // whatsapp
  "waNumber", "waEnabled", "waRedirectMode", "waPrefilledMessage",
  // homepage
  "heroTitle", "heroSubtitle", "heroCtaLabel", "heroCtaHref",
  // marketplace
  "marketplaceEnabled", "vendorSignupOpen",
  // warranty / claims
  "warrantyEnabled", "warrantyDefaultDays", "claimsRequirePhoto", "claimsAllowMessage", "claimsMaxPhotos",
  // order grouping
  "orderGroupingEnabled",
  // per-product defaults
  "allowQuantityByDefault", "negotiableEnabled",
  // visual polish
  "depthEffectsEnabled", "scrollRevealEnabled", "parallaxEnabled",
  // misc
  "announcementBar",
] as const;

export async function PATCH(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of allowedFields) {
    if (k in body) {
      const v = body[k];
      if (typeof v === "string" && v === "" && nullableStringFields.has(k)) {
        data[k] = null;
      } else {
        data[k] = v;
      }
    }
  }
  return NextResponse.json({ ok: true, settings: await updateSettings(data) });
}
