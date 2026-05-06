"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { LogoMark } from "./LogoMark";
import {
  STORAGE_KEY,
  type RecentlyViewedItem,
} from "./RecentlyViewedTracker";

// Footer-mounted row that surfaces the products the user has visited recently.
// All client-side: lives in localStorage. Renders nothing if there's no
// history yet (so a brand-new visitor doesn't see an awkward empty section).
//
// Master toggle handled by the parent (Footer/layout) — this component just
// reads + renders.

export function RecentlyViewedRow() {
  const [items, setItems] = useState<RecentlyViewedItem[] | null>(null);

  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setItems(raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : []);
      } catch {
        setItems([]);
      }
    }
    read();
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section className="border-t border-border">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted mb-3">
          Recently viewed
        </p>
        <div className="flex gap-3 overflow-x-auto -mx-5 px-5 snap-x snap-mandatory">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="snap-start flex-shrink-0 w-[140px] group"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-muted-2 mb-2 transition-transform group-hover:scale-[1.02]">
                {p.thumbnail ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-primary/40">
                    <LogoMark className="w-8 h-8" />
                  </div>
                )}
              </div>
              <p className="text-[13px] font-medium leading-tight line-clamp-1">
                {p.name}
              </p>
              <p className="text-[12px] text-muted">
                {formatPrice(p.basePrice, p.currency)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
