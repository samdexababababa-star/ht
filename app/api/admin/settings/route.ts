import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/settings";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  return NextResponse.json({ ok: true, settings: await getSettings() });
}

const allowedFields = [
  "brandName", "tagline", "logoUrl", "faviconUrl", "primaryColor", "accentColor",
  "supportEmail", "defaultCurrency", "defaultLocale",
  "lsApiKey", "lsStoreId", "lsWebhookSecret", "paymentsEnabled",
  "tgBotToken", "tgChatId", "tgEnabled",
  "waNumber", "waEnabled", "waRedirectMode", "waPrefilledMessage",
  "heroTitle", "heroSubtitle", "heroCtaLabel", "heroCtaHref",
  "marketplaceEnabled", "vendorSignupOpen",
  "announcementBar",
] as const;

export async function PATCH(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of allowedFields) {
    if (k in body) {
      if (typeof body[k] === "string" && body[k] === "") {
        data[k] = null;
      } else {
        data[k] = body[k];
      }
    }
  }
  return NextResponse.json({ ok: true, settings: await updateSettings(data) });
}
