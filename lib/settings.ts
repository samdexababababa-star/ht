import { prisma } from "./db";
import type { Setting } from "@/app/generated/prisma/client";

/**
 * Schema defaults for admin-controlled strings rendered on the public site.
 * When the stored value still equals the default, public components fall back
 * to next-intl translations so the visible copy follows the user's locale
 * instead of being stuck in English. Once an admin overrides the field, that
 * single string wins across every locale (one global override).
 *
 * Keep these in sync with prisma/schema.prisma defaults.
 */
export const SETTING_DEFAULTS = {
  tagline: "Premium digital subscriptions, services & boosts.",
  heroTitle: "One platform.\nEvery digital subscription.",
  heroSubtitle:
    "Streaming, AI, gaming, social — premium quality, instant delivery.",
  heroCtaLabel: "Browse the catalog",
  heroCtaHref: "/catalog",
  stickyPromoText: "Free instant delivery on every order",
  exitIntentText: "Wait — get 10% off your first order",
} as const;

/**
 * Single-row settings model. We use an upsert so concurrent renders during
 * `next build` (which prerender many pages in parallel) don't race on the
 * unique constraint.
 */
export async function getSettings(): Promise<Setting> {
  return prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}

export async function updateSettings(data: Partial<Setting>): Promise<Setting> {
  return prisma.setting.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
}
