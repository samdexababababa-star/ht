import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { tgGetMe } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const { token } = await req.json();
  if (!token) return NextResponse.json({ ok: false, message: "Token required." }, { status: 400 });
  const me = await tgGetMe(String(token));
  if (!me.ok) return NextResponse.json({ ok: false, message: me.description ?? "Bot token invalid." });
  return NextResponse.json({ ok: true, me: me.result });
}
