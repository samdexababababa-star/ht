/**
 * Schema/seed defaults for admin-controlled strings rendered on the public
 * site. When the stored value still equals one of these defaults, public
 * components fall back to next-intl translations so /fr and /ar pages don't
 * leak English. As soon as an admin overrides a field, that single string
 * wins across every locale (one global override). The trade-off: admins
 * either translate themselves or rely on this default fallback.
 *
 * This module is import-safe from both server and client components — it
 * has no Prisma/db side-effects on purpose. Keep these in sync with
 * prisma/schema.prisma and prisma/seed.ts.
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

export const PRODUCT_DEFAULTS = {
  scarcityText: "Only 6 left at this price",
} as const;
