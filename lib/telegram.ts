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
 * Render a template string by substituting {token} placeholders.
 * Unknown tokens are left empty (not the literal "{token}").
 */
export function renderTemplate(template: string, vars: Record<string, string | number | undefined>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

/**
 * Send a formatted order notification to the configured chat.
 */
export async function tgNotifyOrder(orderId: string) {
  const settings = await getSettings();
  if (!settings.tgEnabled || !settings.tgBotToken || !settings.tgChatId) return;
  if (!settings.tgNotifyOnNewOrder) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const itemsBlock = order.items
    .map(
      (item) =>
        ` • ${item.name}${item.variantName ? ` — ${item.variantName}` : ""} ×${item.quantity}  (${(item.total / 100).toFixed(2)} ${order.currency})`,
    )
    .join("\n");

  const customerLines: string[] = [];
  if (order.email) customerLines.push(`Email: ${order.email}`);
  if (order.name) customerLines.push(`Name: ${order.name}`);
  if (order.whatsapp) customerLines.push(`WhatsApp: ${order.whatsapp}`);
  if (order.phone) customerLines.push(`Phone: ${order.phone}`);
  const customer = customerLines.join("\n") || "(anonymous)";

  const text = renderTemplate(settings.tgOrderTemplate, {
    order: order.number,
    customer,
    items: itemsBlock,
    total: `${(order.total / 100).toFixed(2)} ${order.currency}`,
    currency: order.currency,
    status: order.status,
  });

  await tgSendMessage(settings.tgBotToken, settings.tgChatId, text);
}

export async function tgNotifyOrderPaid(orderId: string) {
  const settings = await getSettings();
  if (!settings.tgEnabled || !settings.tgBotToken || !settings.tgChatId) return;
  if (!settings.tgNotifyOnPaid) return;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const text = renderTemplate(settings.tgPaidTemplate, {
    order: order.number,
    customer: order.email || order.name || "(anonymous)",
    total: `${(order.total / 100).toFixed(2)} ${order.currency}`,
    currency: order.currency,
  });
  await tgSendMessage(settings.tgBotToken, settings.tgChatId, text);
}

export async function tgNotifyClaim(claimId: string) {
  const settings = await getSettings();
  if (!settings.tgEnabled || !settings.tgBotToken || !settings.tgChatId) return;
  if (!settings.tgNotifyOnClaim) return;

  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: { order: true },
  });
  if (!claim) return;

  const text = renderTemplate(settings.tgClaimTemplate, {
    claim: claim.number,
    customer: claim.customerName || claim.customerEmail,
    email: claim.customerEmail,
    reason: claim.reason,
    order: claim.order?.number || "(no order)",
    message: claim.message,
  });
  await tgSendMessage(settings.tgBotToken, settings.tgChatId, text);
}

export async function tgNotifyOffer(offerId: string) {
  const settings = await getSettings();
  if (!settings.tgEnabled || !settings.tgBotToken || !settings.tgChatId) return;
  if (!settings.tgNotifyOnOffer) return;

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { product: { select: { name: true } } },
  });
  if (!offer) return;

  const text = renderTemplate(settings.tgOfferTemplate, {
    offer: offer.number,
    product: offer.product?.name ?? "(unknown product)",
    customer: offer.customerName || offer.customerEmail,
    email: offer.customerEmail,
    price: `${(offer.proposedPrice / 100).toFixed(2)}`,
    message: offer.message,
  });
  await tgSendMessage(settings.tgBotToken, settings.tgChatId, text);
}
