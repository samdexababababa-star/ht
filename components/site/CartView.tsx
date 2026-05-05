"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { formatPrice } from "@/lib/utils";

type CartLine = {
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    name: string;
    slug: string;
    thumbnail: string | null;
    currency: string;
  };
  variantName?: string;
  unitPrice: number;
  lineTotal: number;
};

export function CartView({
  lines,
  subtotal,
  currency,
}: {
  lines: CartLine[];
  subtotal: number;
  currency: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function update(productId: string, variantId: string | undefined, quantity: number) {
    start(async () => {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "update", productId, variantId, quantity }),
      });
      router.refresh();
    });
  }

  function remove(productId: string, variantId: string | undefined) {
    start(async () => {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "remove", productId, variantId }),
      });
      router.refresh();
    });
  }

  if (lines.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-2xl tracking-tight">
          Your cart is <span className="serif-italic text-primary">empty</span>.
        </p>
        <Link href="/catalog" className="btn btn-primary mt-6">
          Browse the catalog →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-3">
        {lines.map((l) => (
          <div
            key={`${l.productId}-${l.variantId ?? ""}`}
            className="card p-4 flex gap-4 items-center"
          >
            <Link
              href={`/product/${l.product.slug}`}
              className="h-20 w-20 rounded-lg overflow-hidden bg-muted-2 shrink-0"
            >
              {l.product.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.product.thumbnail} alt="" className="h-full w-full object-cover" />
              ) : null}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/product/${l.product.slug}`} className="font-medium leading-tight">
                {l.product.name}
              </Link>
              {l.variantName ? (
                <p className="text-xs text-muted">{l.variantName}</p>
              ) : null}
              <p className="mt-2 text-sm">
                {formatPrice(l.unitPrice, currency)} × {l.quantity}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={pending}
                onClick={() => update(l.productId, l.variantId, Math.max(1, l.quantity - 1))}
                className="h-8 w-8 rounded-full border border-border hover:border-foreground"
              >
                −
              </button>
              <span className="w-6 text-center text-sm">{l.quantity}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => update(l.productId, l.variantId, l.quantity + 1)}
                className="h-8 w-8 rounded-full border border-border hover:border-foreground"
              >
                +
              </button>
            </div>
            <p className="w-24 text-right font-semibold">
              {formatPrice(l.lineTotal, currency)}
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={() => remove(l.productId, l.variantId)}
              className="text-xs text-muted hover:text-foreground"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <aside className="card p-6 h-fit md:sticky md:top-24">
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Summary</p>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-sm text-muted">Subtotal</span>
          <span className="text-lg font-semibold">{formatPrice(subtotal, currency)}</span>
        </div>
        <Link href="/checkout" className="btn btn-primary w-full mt-6">
          Checkout →
        </Link>
        <Link
          href="/catalog"
          className="block text-center text-sm text-muted hover:text-foreground mt-4"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
