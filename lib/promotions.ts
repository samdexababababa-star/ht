import { prisma } from "./db";

export type AppliedPromotion = {
  id: string;
  code: string | null;
  title: string;
  type: "percent" | "fixed";
  value: number;
  discountCents: number;
};

export async function findPromotionByCode(code: string) {
  if (!code) return null;
  return prisma.promotion.findUnique({ where: { code: code.toUpperCase() } });
}

export function isPromotionActive(p: {
  active: boolean;
  startsAt?: Date | null;
  endsAt?: Date | null;
  maxUses?: number | null;
  uses: number;
  minSubtotal?: number | null;
}, subtotal: number) {
  if (!p.active) return false;
  const now = Date.now();
  if (p.startsAt && p.startsAt.getTime() > now) return false;
  if (p.endsAt && p.endsAt.getTime() < now) return false;
  if (p.maxUses != null && p.uses >= p.maxUses) return false;
  if (p.minSubtotal != null && subtotal < p.minSubtotal) return false;
  return true;
}

export function computeDiscount(p: { type: string; value: number }, subtotal: number) {
  if (p.type === "percent") {
    return Math.round((subtotal * p.value) / 100);
  }
  return Math.min(p.value, subtotal);
}
