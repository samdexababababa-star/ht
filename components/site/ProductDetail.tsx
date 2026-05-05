"use client";
import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, safeJson } from "@/lib/utils";
import { ShoppingBag, Sparkles, Clock } from "lucide-react";

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
  variants: Variant[];
};

export function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
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

  function add() {
    start(async () => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "add",
          productId: product.id,
          variantId,
          quantity: 1,
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
          items: [{ productId: product.id, variantId, quantity: 1 }],
        }),
      });
      router.push("/checkout");
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-10">
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
                  <svg viewBox="0 0 64 64" fill="currentColor" className="w-24 h-24 sparkle">
                    <path d="M32 4l3.6 22.4 21.4-7L40 32l21.4 12.6-21.4-7L32 60l-3.6-22.4-21.4 7L24 32 2.6 19.4l21.4 7L32 4z" />
                  </svg>
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
        <div className="flex items-center gap-2">
          {product.badge ? <span className="chip chip-blue">{product.badge}</span> : null}
          {discount ? <span className="chip">−{discount}%</span> : null}
        </div>
        <h1 className="mt-3 text-4xl md:text-5xl tracking-tight font-medium">
          {product.name}
        </h1>
        {product.tagline ? (
          <p className="mt-3 text-lg text-muted">{product.tagline}</p>
        ) : null}

        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-3xl font-semibold">
            {formatPrice(price, product.currency)}
          </span>
          {compareAt && compareAt > price ? (
            <span className="text-base text-muted line-through">
              {formatPrice(compareAt, product.currency)}
            </span>
          ) : null}
        </div>

        {product.variants.length > 0 ? (
          <div className="mt-6">
            <p className="text-[12px] uppercase tracking-[0.16em] text-muted mb-2">
              Choose your plan
            </p>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`text-left p-4 rounded-2xl border transition ${
                    variantId === v.id
                      ? "border-foreground bg-muted-2"
                      : "border-border hover:border-muted"
                  }`}
                >
                  <p className="font-medium leading-none">{v.name}</p>
                  <p className="mt-2 text-[15px]">
                    {formatPrice(v.price, product.currency)}
                    {v.compareAtPrice && v.compareAtPrice > v.price ? (
                      <span className="ml-2 text-xs text-muted line-through">
                        {formatPrice(v.compareAtPrice, product.currency)}
                      </span>
                    ) : null}
                  </p>
                </button>
              ))}
            </div>
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

        <div className="mt-8 flex gap-3">
          <button
            onClick={add}
            disabled={pending}
            className="btn btn-outline"
          >
            <ShoppingBag size={16} /> {added ? "Added!" : "Add to cart"}
          </button>
          <button onClick={buyNow} disabled={pending} className="btn btn-primary">
            Buy now →
          </button>
        </div>

        {product.description ? (
          <div className="mt-10 prose prose-sm max-w-none text-muted whitespace-pre-line">
            {product.description}
          </div>
        ) : null}

        {product.longDescription ? (
          <div className="mt-6 text-sm text-foreground/80 whitespace-pre-line">
            {product.longDescription}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CountdownChip({ endsAt }: { endsAt: Date | string }) {
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
  return (
    <span className="chip">
      <Clock size={12} /> Ends in {hours.toString().padStart(2, "0")}:
      {minutes.toString().padStart(2, "0")}:
      {seconds.toString().padStart(2, "0")}
    </span>
  );
}
