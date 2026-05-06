import { prisma } from "./db";
import { generateClaimNumber } from "./utils";

export type ClaimPhoto = string; // data: URL or storage URL

export type CreateClaimInput = {
  orderNumber?: string;
  orderItemId?: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  reason: string;
  message?: string;
  photos?: ClaimPhoto[];
};

/**
 * Look up an order by its public number (e.g. "SOH-XXXXX") and email pair —
 * used to validate eligibility before letting a customer file a claim.
 */
export async function findOrderForClaim(opts: {
  orderNumber: string;
  email: string;
}) {
  const order = await prisma.order.findUnique({
    where: { number: opts.orderNumber },
    include: { items: true },
  });
  if (!order) return { ok: false as const, message: "Order not found." };
  if (
    order.email &&
    order.email.toLowerCase() !== opts.email.trim().toLowerCase()
  ) {
    return { ok: false as const, message: "Email does not match this order." };
  }
  return { ok: true as const, order };
}

export async function createClaim(input: CreateClaimInput) {
  let orderId: string | null = null;
  if (input.orderNumber) {
    const o = await prisma.order.findUnique({
      where: { number: input.orderNumber },
      select: { id: true },
    });
    orderId = o?.id ?? null;
  }
  return prisma.claim.create({
    data: {
      number: generateClaimNumber(),
      orderId: orderId,
      orderItemId: input.orderItemId ?? null,
      customerEmail: input.customerEmail,
      customerName: input.customerName ?? null,
      customerPhone: input.customerPhone ?? null,
      reason: input.reason,
      message: input.message ?? "",
      photos: JSON.stringify(input.photos ?? []),
    },
  });
}
