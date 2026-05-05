import { getSettings } from "./settings";
import { prisma } from "./db";

const TG_API = "https://api.telegram.org";

type TgResponse<T> = { ok: boolean; result?: T; description?: string };

async function tg<T>(token: string, method: string, body?: unknown) {
  const res = await fetch(`${TG_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  return (await res.json()) as TgResponse<T>;
}

export async function tgGetMe(token: string) {
  return tg<{ id: number; username: string; first_name: string }>(
    token,
    "getMe",
  );
}

export async function tgGetUpdates(token: string) {
  return tg<
    Array<{
      update_id: number;
      message?: {
        chat: { id: number; type: string; title?: string; username?: string };
        text?: string;
      };
    }>
  >(token, "getUpdates", { timeout: 0 });
}

export async function tgSendMessage(
  token: string,
  chatId: string | number,
  text: string,
  opts?: { parseMode?: "HTML" | "MarkdownV2" },
) {
  return tg(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: opts?.parseMode,
    disable_web_page_preview: true,
  });
}

/**
 * Auto-detect chat: poll getUpdates and pick the most recent message's chat id.
 * Admin instructed to start a chat with the bot first.
 */
export async function tgAutoDetectChat(token: string) {
  const upd = await tgGetUpdates(token);
  if (!upd.ok || !upd.result || upd.result.length === 0) {
    return { ok: false, message: "No messages received yet — send /start to your bot first." };
  }
  const last = upd.result[upd.result.length - 1];
  const chatId = last.message?.chat.id;
  if (!chatId) return { ok: false, message: "Could not detect a chat from updates." };
  return {
    ok: true,
    chatId: String(chatId),
    chatTitle: last.message?.chat.title || last.message?.chat.username || "private chat",
  };
}

/**
 * Send a formatted order notification to the configured chat.
 */
export async function tgNotifyOrder(orderId: string) {
  const settings = await getSettings();
  if (!settings.tgEnabled || !settings.tgBotToken || !settings.tgChatId) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const lines: string[] = [];
  lines.push(`🛒 <b>New order</b> ${order.number}`);
  lines.push(`Status: <b>${order.status}</b>`);
  if (order.email) lines.push(`Email: ${order.email}`);
  if (order.name) lines.push(`Name: ${order.name}`);
  if (order.whatsapp) lines.push(`WhatsApp: ${order.whatsapp}`);
  if (order.phone) lines.push(`Phone: ${order.phone}`);
  if (order.notes) lines.push(`Notes: ${order.notes}`);
  lines.push("");
  lines.push("<b>Items:</b>");
  for (const item of order.items) {
    lines.push(
      ` • ${item.name}${item.variantName ? ` — ${item.variantName}` : ""} ×${item.quantity}  (${(item.total / 100).toFixed(2)} ${order.currency})`,
    );
  }
  lines.push("");
  lines.push(`Subtotal: ${(order.subtotal / 100).toFixed(2)} ${order.currency}`);
  if (order.discount) lines.push(`Discount: -${(order.discount / 100).toFixed(2)} ${order.currency}`);
  lines.push(`<b>Total: ${(order.total / 100).toFixed(2)} ${order.currency}</b>`);
  if (order.paymentUrl) lines.push(`Payment link: ${order.paymentUrl}`);

  await tgSendMessage(settings.tgBotToken, settings.tgChatId, lines.join("\n"), {
    parseMode: "HTML",
  });
}
