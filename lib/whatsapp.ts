import type { Order } from "@/app/generated/prisma/client";
import { getSettings } from "./settings";

/**
 * Build a wa.me link with a prefilled message.
 * Template tokens supported: {product}, {variant}, {order}, {total}, {currency}
 */
export async function buildWhatsAppLink(opts: {
  productName?: string;
  variantName?: string;
  order?: Pick<Order, "number" | "total" | "currency"> | null;
}) {
  const s = await getSettings();
  if (!s.waEnabled || !s.waNumber) return null;

  const tpl = s.waPrefilledMessage || "";
  const text = tpl
    .replaceAll("{product}", opts.productName ?? "")
    .replaceAll("{variant}", opts.variantName ?? "")
    .replaceAll("{order}", opts.order?.number ?? "")
    .replaceAll(
      "{total}",
      opts.order ? (opts.order.total / 100).toFixed(2) : "",
    )
    .replaceAll("{currency}", opts.order?.currency ?? s.defaultCurrency);

  const url = new URL(`https://wa.me/${s.waNumber.replace(/[^0-9]/g, "")}`);
  if (text.trim()) url.searchParams.set("text", text);
  return url.toString();
}
