"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { formatPrice } from "@/lib/utils";
import { Trash2 } from "lucide-react";

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
      <div className="card p-8 md:p-12 text-center">
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
    <>
      <div className="grid md:grid-cols-3 gap-6 md:gap-8 pb-28 md:pb-0">
        <div className="md:col-span-2 space-y-3">
          {lines.map((l) => (
            <div
              key={`${l.productId}-${l.variantId ?? ""}`}
              className="card p-3 md:p-4"
            >
              <div className="flex gap-3 md:gap-4 items-start">
                <Link
                  href={`/product/${l.product.slug}`}
                  className="h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden bg-muted-2 shrink-0"
                >
                  {l.product.thumbnail ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={l.product.thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${l.product.slug}`}
                    className="text-[14px] md:text-[15px] font-medium leading-tight line-clamp-2"
                  >
                    {l.product.name}
                  </Link>
                  {l.variantName ? (
                    <p className="text-xs text-muted mt-0.5">{l.variantName}</p>
                  ) : null}
                  <p className="mt-1 text-xs md:text-sm text-muted">
                    {formatPrice(l.unitPrice, currency)} each
                  </p>
                </div>
                <p className="text-right font-semibold text-[15px] shrink-0">
                  {formatPrice(l.lineTotal, currency)}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={pending}
                    onClick={() => update(l.productId, l.variantId, Math.max(1, l.quantity - 1))}
                    className="h-9 w-9 rounded-full border border-border hover:border-foreground active:bg-muted-2"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-sm tabular-nums">{l.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={pending}
                    onClick={() => update(l.productId, l.variantId, l.quantity + 1)}
                    className="h-9 w-9 rounded-full border border-border hover:border-foreground active:bg-muted-2"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => remove(l.productId, l.variantId)}
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground px-2 py-2"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop summary card */}
        <aside className="hidden md:block card p-6 h-fit md:sticky md:top-24">
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

      {/* Mobile-only sticky checkout bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border px-4 py-3 flex items-center gap-3 [padding-bottom:calc(env(safe-area-inset-bottom)+12px)]">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted">Subtotal</p>
          <p className="text-lg font-semibold leading-tight">{formatPrice(subtotal, currency)}</p>
        </div>
        <Link href="/checkout" className="btn btn-primary shrink-0">
          Checkout →
        </Link>
      </div>
    </>
  );
}
