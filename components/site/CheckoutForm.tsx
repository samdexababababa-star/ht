"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

type Line = {
  productId: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  productName: string;
};

export function CheckoutForm({
  lines,
  subtotal,
  currency,
  paymentsEnabled,
  whatsappEnabled,
  whatsappBeforePayment,
}: {
  lines: Line[];
  subtotal: number;
  currency: string;
  paymentsEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappBeforePayment: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function applyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    const r = await fetch("/api/cart/promo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, subtotal }),
    });
    if (r.ok) {
      const data = await r.json();
      setDiscount(data.discount ?? 0);
      setError(data.discount > 0 ? null : "Promotion not applicable.");
    } else {
      setError("Invalid promotion code.");
    }
  }

  function submit() {
    setError(null);
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    start(async () => {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          whatsapp,
          notes,
          promotionCode: code,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.message ?? "Checkout failed.");
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else if (data.orderNumber) {
        router.push(`/checkout/success?order=${data.orderNumber}`);
      }
    });
  }

  const total = Math.max(0, subtotal - discount);

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-5">
        <div className="card p-6">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Contact</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <input
              required
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border border-border px-4 text-sm focus:outline-none focus:border-foreground"
            />
            <input
              type="text"
              placeholder="Full name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl border border-border px-4 text-sm focus:outline-none focus:border-foreground"
            />
          </div>
          {whatsappEnabled ? (
            <input
              type="tel"
              placeholder="WhatsApp number (optional)"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-3 w-full h-11 rounded-xl border border-border px-4 text-sm focus:outline-none focus:border-foreground"
            />
          ) : null}
          <textarea
            placeholder="Notes / special requests (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground"
          />
        </div>

        <form onSubmit={applyCode} className="card p-6 flex gap-2">
          <input
            type="text"
            placeholder="Have a code?"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 h-11 rounded-xl border border-border px-4 text-sm uppercase focus:outline-none focus:border-foreground"
          />
          <button type="submit" className="btn btn-outline">Apply</button>
        </form>

        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : null}
      </div>

      <aside className="card p-6 h-fit md:sticky md:top-24">
        <p className="text-[12px] uppercase tracking-[0.18em] text-muted">Order</p>
        <div className="mt-3 space-y-2">
          {lines.map((l) => (
            <div key={`${l.productId}-${l.variantId ?? ""}`} className="flex justify-between text-sm">
              <span className="truncate pr-2">
                {l.productName}
                {l.variantName ? ` — ${l.variantName}` : ""} × {l.quantity}
              </span>
              <span>{formatPrice(l.lineTotal, currency)}</span>
            </div>
          ))}
        </div>
        <div className="my-4 border-t border-border" />
        <div className="text-sm flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal, currency)}</span></div>
        {discount > 0 ? (
          <div className="text-sm flex justify-between text-primary mt-1">
            <span>Discount</span>
            <span>−{formatPrice(discount, currency)}</span>
          </div>
        ) : null}
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-medium">Total</span>
          <span className="text-xl font-semibold">{formatPrice(total, currency)}</span>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="btn btn-primary w-full mt-6"
        >
          {pending
            ? "Processing…"
            : paymentsEnabled
              ? "Pay securely →"
              : whatsappBeforePayment
                ? "Continue on WhatsApp →"
                : "Place order →"}
        </button>
        <p className="mt-3 text-[11px] text-muted text-center">
          By placing this order, you agree that your contact info will be used to deliver your products.
        </p>
      </aside>
    </div>
  );
}
