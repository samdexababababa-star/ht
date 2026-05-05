import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { tgAutoDetectChat, tgSendMessage } from "@/lib/telegram";
import { updateSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ ok: false }, { status: 401 }); }
  const { token, save } = await req.json();
  if (!token) return NextResponse.json({ ok: false, message: "Token required." }, { status: 400 });
  const detected = await tgAutoDetectChat(String(token));
  if (!detected.ok) return NextResponse.json(detected, { status: 200 });
  if (save) {
    await updateSettings({ tgBotToken: String(token), tgChatId: detected.chatId, tgEnabled: true });
    await tgSendMessage(String(token), detected.chatId!, "✦ Salma is now connected. New orders will appear here.");
  }
  return NextResponse.json(detected);
}
