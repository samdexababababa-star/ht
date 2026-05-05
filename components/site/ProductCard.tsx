import Link from "next/link";
import { formatPrice } from "@/lib/utils";

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
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const discount =
    p.compareAtPrice && p.compareAtPrice > p.basePrice
      ? Math.round(((p.compareAtPrice - p.basePrice) / p.compareAtPrice) * 100)
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
              <svg viewBox="0 0 64 64" fill="currentColor" className="w-16 h-16 sparkle">
                <path d="M32 8 L38 18 L49 15 L46 26 L56 32 L46 38 L49 49 L38 46 L32 56 L26 46 L15 49 L18 38 L8 32 L18 26 L15 15 L26 18 Z" />
              </svg>
            </div>
          )}

          {p.badge ? (
            <span className="absolute top-3 left-3 chip chip-blue">{p.badge}</span>
          ) : null}
          {discount ? (
            <span className="absolute top-3 right-3 chip">−{discount}%</span>
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
            {p.compareAtPrice && p.compareAtPrice > p.basePrice ? (
              <span className="text-[12px] text-muted line-through">
                {formatPrice(p.compareAtPrice, p.currency)}
              </span>
            ) : null}
          </div>
          {p.scarcityEnabled && p.scarcityText ? (
            <p className="mt-2 text-[11px] uppercase tracking-wide text-primary">
              {p.scarcityText}
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
