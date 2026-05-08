import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { PRODUCT_DEFAULTS } from "@/lib/content-defaults";
import { LogoMark } from "./LogoMark";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  thumbnail?: string | null;
  basePrice: number;
  compareAtPrice?: number | null;
  currency: string;
  badge?: string | null;
  scarcityEnabled: boolean;
  scarcityText?: string | null;
  // phase 8 — growth boosters
  bestSellerBadge?: boolean | null;
  newBadge?: boolean | null;
  highlightSavings?: boolean | null;
};

export async function ProductCard({ p }: { p: ProductCardData }) {
  const t = await getTranslations("product");
  const hasCompare =
    !!p.compareAtPrice && p.compareAtPrice > p.basePrice;
  const discountPct = hasCompare
    ? Math.round(((p.compareAtPrice! - p.basePrice) / p.compareAtPrice!) * 100)
    : null;
  const savings = hasCompare ? p.compareAtPrice! - p.basePrice : null;
  // Auto-derived corner badge: NEW > BEST SELLER > custom badge string.
  // Order matters because "NEW" beats "BEST SELLER" when both are checked
  // (newer products earn the spotlight). Built-in badges run through next-intl
  // so /fr and /ar don't show English. Admin-supplied custom badge strings
  // pass through unchanged (admin override wins).
  const cornerBadge = p.newBadge
    ? t("badgeNew")
    : p.bestSellerBadge
      ? t("badgeBestSeller")
      : p.badge ?? null;
  // Same translate-by-default trick as Hero/tagline: when stored value still
  // matches the seed default, we render the translation; otherwise the
  // admin-customised string wins.
  const scarcityLabel =
    p.scarcityEnabled && p.scarcityText
      ? p.scarcityText === PRODUCT_DEFAULTS.scarcityText
        ? t("scarcityDefault")
        : p.scarcityText
      : null;

  return (
    <Link href={`/product/${p.slug}`} className="group">
      <article className="card overflow-hidden">
        <div className="relative aspect-[4/5] bg-muted-2 overflow-hidden">
          {p.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.thumbnail}
              alt={p.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-primary/40">
              <LogoMark className="w-16 h-16" />
            </div>
          )}

          {cornerBadge ? (
            <span className="absolute top-3 start-3 chip chip-blue">{cornerBadge}</span>
          ) : null}
          {hasCompare ? (
            <span className="absolute top-3 end-3 chip">
              {p.highlightSavings && savings != null
                ? t("savePrefix", {
                    amount: formatPrice(savings, p.currency),
                  })
                : `−${discountPct}%`}
            </span>
          ) : null}
        </div>
        <div className="p-4">
          <p className="text-[15px] font-medium leading-tight">{p.name}</p>
          {p.tagline ? (
            <p className="mt-0.5 text-[13px] text-muted line-clamp-1">{p.tagline}</p>
          ) : null}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[15px] font-semibold">
              {formatPrice(p.basePrice, p.currency)}
            </span>
            {hasCompare ? (
              <span className="text-[12px] text-muted line-through">
                {formatPrice(p.compareAtPrice!, p.currency)}
              </span>
            ) : null}
          </div>
          {scarcityLabel ? (
            <p className="mt-2 text-[11px] uppercase tracking-wide text-primary">
              {scarcityLabel}
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
