import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { tgSendMessage } from "@/lib/telegram";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const s = await getSettings();
  if (!s.tgBotToken || !s.tgChatId) {
    return NextResponse.json({ ok: false, message: "Token or chat not configured." });
  }
  const r = await tgSendMessage(
    s.tgBotToken,
    s.tgChatId,
    `🔔 <b>Test ping from ${s.brandName}</b>\nIf you see this, your Telegram setup works.`,
    { parseMode: "HTML" },
  );
  if (!r.ok) {
    return NextResponse.json({
      ok: false,
      message: r.description || "Telegram rejected the test send.",
    });
  }
  return NextResponse.json({ ok: true });
}
