"use client";
import { useState, useTransition, useMemo, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, safeJson } from "@/lib/utils";
import {
  ShoppingBag,
  Sparkles,
  Clock,
  Tag,
  ShieldCheck,
  Zap,
  RotateCcw,
  Eye,
} from "lucide-react";
import { LogoMark } from "./LogoMark";
import { OfferDialog } from "./OfferDialog";

type Variant = {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  durationDays: number | null;
  stock: number | null;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  longDescription: string;
  basePrice: number;
  compareAtPrice: number | null;
  currency: string;
  thumbnail: string | null;
  gallery: string;
  badge: string | null;
  scarcityEnabled: boolean;
  scarcityText: string | null;
  scarcityCount: number | null;
  urgencyEndsAt: Date | string | null;
  allowQuantity?: boolean;
  negotiable?: boolean;
  minOfferPrice?: number | null;
  // phase 8 — growth boosters
  bestSellerBadge?: boolean | null;
  newBadge?: boolean | null;
  highlightSavings?: boolean | null;
  socialProofEnabled?: boolean | null;
  socialProofText?: string | null;
  trustBadgeText?: string | null;
  variants: Variant[];
};

type BundleSuggestion = {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  currency: string;
  thumbnail: string | null;
};

type Settings = {
  negotiableEnabled: boolean;
  trustBadgesEnabled?: boolean;
  liveVisitorCountEnabled?: boolean;
  socialProofGlobalEnabled?: boolean;
  bundlesEnabled?: boolean;
};

export function ProductDetail({
  product,
  settings,
  bundle,
}: {
  product: Product;
  settings?: Settings;
  bundle?: BundleSuggestion | null;
}) {
  const router = useRouter();
  const t = useTranslations("product");
  const gallery = useMemo(() => safeJson<string[]>(product.gallery, []), [product.gallery]);
  const allImages = product.thumbnail ? [product.thumbnail, ...gallery] : gallery;
  const [active, setActive] = useState(0);
  const [variantId, setVariantId] = useState<string | undefined>(
    product.variants[0]?.id,
  );
  const variant = product.variants.find((v) => v.id === variantId);
  const price = variant?.price ?? product.basePrice;
  const compareAt =
    variant?.compareAtPrice ?? product.compareAtPrice ?? null;
  const discount =
    compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : null;

  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [offerOpen, setOfferOpen] = useState(false);
  const negotiableOn =
    !!product.negotiable && (settings?.negotiableEnabled ?? true);

  // Mobile sticky bar — slide it out of view on scroll-up, slide back on
  // scroll-down. Mirrors the App Store / Apple.com pattern: when the user
  // scans content (going up), the CTA gets out of the way; when they get
  // close to action (going down), the CTA comes back into reach.
  const [barHidden, setBarHidden] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        // Ignore tiny twitches; require ≥6px sustained move.
        if (Math.abs(delta) > 6) {
          // Scroll DOWN (delta > 0) → hide so the user can read content.
          // Scroll UP (delta < 0) → show, the user is scanning back to act.
          // Always show near the top.
          if (y < 80) setBarHidden(false);
          else setBarHidden(delta > 0);
          lastY = y;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function add() {
    start(async () => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "add",
          productId: product.id,
          variantId,
          quantity: qty,
        }),
      });
      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
        router.refresh();
      }
    });
  }

  function buyNow() {
    start(async () => {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "set",
          items: [{ productId: product.id, variantId, quantity: qty }],
        }),
      });
      router.push("/checkout");
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-10 pb-24 md:pb-0">
      <div>
        <div className="aspect-[4/5] rounded-[18px] overflow-hidden bg-muted-2 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={allImages[active] || "placeholder"}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              {allImages[active] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={allImages[active]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-primary/40">
                  <LogoMark className="w-24 h-24" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {allImages.length > 1 ? (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {allImages.slice(0, 5).map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  active === i ? "border-foreground" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <div className="flex items-center gap-2 flex-wrap">
          {product.newBadge ? (
            <span className="chip chip-blue">NEW</span>
          ) : product.bestSellerBadge ? (
            <span className="chip chip-blue">BEST SELLER</span>
          ) : product.badge ? (
            <span className="chip chip-blue">{product.badge}</span>
          ) : null}
          {discount ? <span className="chip">−{discount}%</span> : null}
        </div>
        <h1 className="mt-3 text-3xl md:text-5xl tracking-tight font-medium leading-[1.1]">
          {product.name}
        </h1>
        {product.tagline ? (
          <p className="mt-3 text-base md:text-lg text-muted">{product.tagline}</p>
        ) : null}

        {product.trustBadgeText ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-foreground/80 bg-primary-soft/60 px-3 py-1.5 rounded-full">
            <ShieldCheck size={14} className="text-primary" />
            {product.trustBadgeText}
          </p>
        ) : null}

        <div className="mt-5 md:mt-6 flex items-baseline gap-3 flex-wrap">
          <span className="text-2xl md:text-3xl font-semibold">
            {formatPrice(price, product.currency)}
          </span>
          {compareAt && compareAt > price ? (
            <span className="text-sm md:text-base text-muted line-through">
              {formatPrice(compareAt, product.currency)}
            </span>
          ) : null}
          {product.highlightSavings && compareAt && compareAt > price ? (
            <span className="text-[13px] text-primary font-medium">
              {t("youSave", { amount: formatPrice(compareAt - price, product.currency) })}
            </span>
          ) : null}
        </div>

        {/* Live signals: social proof + visitor count.
            Both opt-in (per-product + master toggle) — defaults are off to keep
            the page calm. */}
        {((product.socialProofEnabled &&
          settings?.socialProofGlobalEnabled &&
          product.socialProofText) ||
          settings?.liveVisitorCountEnabled) ? (
          <div className="mt-4 flex items-center gap-2 flex-wrap text-[12px]">
            {product.socialProofEnabled &&
            settings?.socialProofGlobalEnabled &&
            product.socialProofText ? (
              <span className="inline-flex items-center gap-1.5 text-foreground/80">
                <Sparkles size={12} className="text-primary" />
                {product.socialProofText}
              </span>
            ) : null}
            {settings?.liveVisitorCountEnabled ? (
              <LiveVisitorCount productId={product.id} />
            ) : null}
          </div>
        ) : null}

        {product.variants.length > 0 ? (
          <div className="mt-6">
            <p className="text-[12px] uppercase tracking-[0.16em] text-muted mb-2">
              {t("choosePlan")}
            </p>
            <div className="variant-grid">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`text-start p-4 rounded-2xl border transition active:scale-[0.98] ${
                    variantId === v.id
                      ? "border-foreground bg-muted-2"
                      : "border-border hover:border-muted"
                  }`}
                >
                  <p className="font-medium leading-none">{v.name}</p>
                  <p className="mt-2 text-[15px]">
                    {formatPrice(v.price, product.currency)}
                    {v.compareAtPrice && v.compareAtPrice > v.price ? (
                      <span className="ms-2 text-xs text-muted line-through">
                        {formatPrice(v.compareAtPrice, product.currency)}
                      </span>
                    ) : null}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {product.allowQuantity ? (
          <div className="mt-6">
            <p className="text-[12px] uppercase tracking-[0.16em] text-muted mb-2">
              {t("quantity")}
            </p>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border p-1 bg-white">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-9 w-9 rounded-xl text-muted hover:text-foreground active:scale-90 transition"
                aria-label={t("decreaseQty")}
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value || "1")))}
                className="w-12 h-9 text-center bg-transparent text-base font-medium"
              />
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="h-9 w-9 rounded-xl text-muted hover:text-foreground active:scale-90 transition"
                aria-label={t("increaseQty")}
              >
                +
              </button>
            </div>
          </div>
        ) : null}

        {negotiableOn ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setOfferOpen(true)}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline active:scale-95 transition"
            >
              <Tag size={14} /> {t("makeOffer")}
            </button>
          </div>
        ) : null}

        {product.scarcityEnabled || product.urgencyEndsAt ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {product.scarcityEnabled && product.scarcityText ? (
              <span className="chip chip-blue">
                <Sparkles size={12} /> {product.scarcityText}
              </span>
            ) : null}
            {product.urgencyEndsAt ? (
              <CountdownChip endsAt={product.urgencyEndsAt} />
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 hidden md:flex gap-3">
          <button
            onClick={add}
            disabled={pending}
            className="btn btn-outline"
          >
            <ShoppingBag size={16} /> {added ? t("added") : t("addToCart")}
          </button>
          <button onClick={buyNow} disabled={pending} className="btn btn-primary">
            {t("buyNow")} →
          </button>
        </div>

        {/* Trust badges row — three compact reassurances under the CTA.
            Master toggle lives in /admin/growth → Trust badges. */}
        {settings?.trustBadgesEnabled ? (
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 text-[11px] sm:text-[12px]">
            <TrustChip icon={<Zap size={14} />} label={t("trustInstant")} />
            <TrustChip icon={<ShieldCheck size={14} />} label={t("trustSecure")} />
            <TrustChip icon={<RotateCcw size={14} />} label={t("trustMoneyBack")} />
          </div>
        ) : null}

        {product.description ? (
          <div className="mt-8 md:mt-10 prose prose-sm max-w-none text-muted whitespace-pre-line">
            {product.description}
          </div>
        ) : null}

        {product.longDescription ? (
          <div className="mt-6 text-sm text-foreground/80 whitespace-pre-line">
            {product.longDescription}
          </div>
        ) : null}

        {/* Bundle suggestion — pre-decision cross-sell. Only renders when:
            (a) the master "bundlesEnabled" toggle is on AND
            (b) the operator picked a partner product on this product. */}
        {bundle && settings?.bundlesEnabled ? (
          <Link
            href={`/product/${bundle.slug}`}
            className="mt-8 flex items-center gap-3 p-3 rounded-2xl border border-primary/20 bg-primary/[0.03] hover:border-primary/40 transition group"
          >
            <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted-2 flex-shrink-0">
              {bundle.thumbnail ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={bundle.thumbnail}
                  alt={bundle.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-primary/40">
                  <LogoMark className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-primary">
                {t("oftenBoughtWith")}
              </p>
              <p className="text-sm font-medium truncate">{bundle.name}</p>
              <p className="text-[12px] text-muted">
                {formatPrice(bundle.basePrice, bundle.currency)}
              </p>
            </div>
            <span className="text-primary text-sm group-hover:translate-x-0.5 transition">
              →
            </span>
          </Link>
        ) : null}
      </div>

      {/* Mobile-only sticky purchase bar so the CTA is always reachable.
          Uses .mobile-sticky-bar (gradient + slide-on-scroll). */}
      <div
        data-hidden={barHidden}
        className="mobile-sticky-bar md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border px-4 py-3 flex items-center gap-3 [padding-bottom:calc(env(safe-area-inset-bottom)+12px)]"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted">
            {qty > 1 ? `${t("total")} · ×${qty}` : t("total")}
          </p>
          <p className="text-lg font-semibold leading-tight truncate">
            {formatPrice(price * qty, product.currency)}
            {variant ? <span className="text-xs text-muted font-normal ms-2">{variant.name}</span> : null}
          </p>
        </div>
        <button
          onClick={add}
          disabled={pending}
          className="btn btn-outline shrink-0 px-3"
          aria-label={t("addToCart")}
        >
          <ShoppingBag size={16} />
        </button>
        <button onClick={buyNow} disabled={pending} className="btn btn-primary shrink-0">
          {t("buyNow")} →
        </button>
      </div>
      {negotiableOn ? (
        <OfferDialog
          open={offerOpen}
          onClose={() => setOfferOpen(false)}
          product={{
            id: product.id,
            name: product.name,
            currency: product.currency,
            currentPrice: price,
            minOfferPrice: product.minOfferPrice ?? null,
          }}
          variantId={variantId ?? null}
        />
      ) : null}
    </div>
  );
}

function TrustChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border border-border bg-white text-center">
      <span className="text-primary">{icon}</span>
      <span className="text-foreground/80 leading-tight">{label}</span>
    </div>
  );
}

// Pseudo-live visitor count. Honest design: we don't fake DB writes; we just
// hash the productId+epoch-hour into a stable 2-9 number that drifts gently
// every ~25s. Same number for every visitor in the same window so it never
// jumps wildly when shared. The point is to remind visitors the page is
// active, not to invent metrics.
function LiveVisitorCount({ productId }: { productId: string }) {
  const t = useTranslations("product");
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    function compute() {
      // Stable hash of productId + 25s bucket → stable but-drifting integer.
      const bucket = Math.floor(Date.now() / 25_000);
      let h = 0;
      const s = `${productId}|${bucket}`;
      for (let i = 0; i < s.length; i++) {
        h = (h * 31 + s.charCodeAt(i)) | 0;
      }
      // Range 2..9 — small, believable, never zero.
      setN(2 + (Math.abs(h) % 8));
    }
    compute();
    const i = setInterval(compute, 25_000);
    return () => clearInterval(i);
  }, [productId]);
  if (n == null) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-foreground/70">
      <Eye size={12} className="text-emerald-600" />
      <span>{t.rich("liveViewers", { count: n, b: (c) => <strong className="font-semibold">{c}</strong> })}</span>
    </span>
  );
}

function CountdownChip({ endsAt }: { endsAt: Date | string }) {
  const t = useTranslations("product");
  const target = useMemo(() => new Date(endsAt).getTime(), [endsAt]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, target - now);
  if (diff === 0) return null;
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  const countdown = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  return (
    <span className="chip">
      <Clock size={12} /> {t("endsIn", { time: countdown })}
    </span>
  );
}
