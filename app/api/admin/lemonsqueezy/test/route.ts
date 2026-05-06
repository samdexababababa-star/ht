import { NextRequest, NextResponse } from "next/server";
import { lemonSqueezySetup, getStore } from "@lemonsqueezy/lemonsqueezy.js";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as { apiKey?: string; storeId?: string };
  if (!body.apiKey) {
    return NextResponse.json({ ok: false, message: "API key missing." });
  }
  if (!body.storeId) {
    return NextResponse.json({ ok: false, message: "Store ID missing." });
  }
  lemonSqueezySetup({ apiKey: body.apiKey });
  try {
    const res = await getStore(body.storeId);
    if (res.error) {
      return NextResponse.json({ ok: false, message: res.error.message });
    }
    const name = res.data?.data?.attributes?.name ?? null;
    return NextResponse.json({ ok: true, storeName: name });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      message: e instanceof Error ? e.message : "Unknown error",
    });
  }
}
