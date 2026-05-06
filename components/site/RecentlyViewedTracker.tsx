"use client";
import { useEffect } from "react";

// Pure side-effect component: when mounted on a product page, records the
// product into a localStorage list (de-duped, capped at 6). The footer reads
// that list and renders a thin row.
//
// Master toggle: Settings.recentlyViewedEnabled — when off, the tracker is
// a no-op (we don't even mount it) so we don't write to localStorage when
// the feature is disabled.

export const STORAGE_KEY = "salma:recently-viewed";
export const MAX = 6;

export type RecentlyViewedItem = {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  currency: string;
  thumbnail: string | null;
};

export function RecentlyViewedTracker({
  enabled,
  product,
}: {
  enabled: boolean;
  product: RecentlyViewedItem;
}) {
  useEffect(() => {
    if (!enabled) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];
      // Move-to-front semantics: drop existing entry, prepend, then cap.
      const next = [
        product,
        ...list.filter((p) => p.id !== product.id),
      ].slice(0, MAX);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }, [enabled, product]);
  return null;
}
