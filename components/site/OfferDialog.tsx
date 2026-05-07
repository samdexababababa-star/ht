"use client";
import { useEffect, useState, useTransition } from "react";
import { Tag, X, Send, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  currency: string;
  currentPrice: number;
  minOfferPrice: number | null;
};

export function OfferDialog(props: {
  open: boolean;
  onClose: () => void;
  product: Product;
  variantId: string | null;
}) {
  if (!props.open) return null;
  return <OfferDialogInner {...props} />;
}

function OfferDialogInner({
  onClose,
  product,
  variantId,
}: {
  open: boolean;
  onClose: () => void;
  product: Product;
  variantId: string | null;
}) {
  const [offer, setOffer] = useState<string>("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ ref: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit() {
    setError(null);
    const cents = Math.round(parseFloat(offer || "0") * 100);
    if (!cents || cents <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (product.minOfferPrice && cents < product.minOfferPrice) {
      setError(
        `Lowest acceptable offer is ${formatPrice(
          product.minOfferPrice,
          product.currency,
        )}.`,
      );
      return;
    }
    if (!email || !email.includes("@")) {
      setError("A valid email is required so we can reply.");
      return;
    }
    start(async () => {
      const r = await fetch("/api/offers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId,
          amount: cents,
          currency: product.currency,
          customerEmail: email,
          customerName: name || null,
          message: message || null,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as {
        ok: boolean;
        message?: string;
        offer?: { number: string };
      };
      if (!j.ok) {
        setError(j.message ?? "Could not send offer.");
        return;
      }
      setDone({ ref: j.offer?.number ?? "" });
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white border border-border p-5 sm:p-6 shadow-xl max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Make an offer
            </p>
            <h2 className="mt-1 text-2xl tracking-tight">{product.name}</h2>
            <p className="mt-1 text-xs text-muted">
              Listed at {formatPrice(product.currentPrice, product.currency)}
              {product.minOfferPrice
                ? ` · min ${formatPrice(product.minOfferPrice, product.currency)}`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted-2 flex items-center justify-center text-muted"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {done ? (
          <div className="mt-6 text-center space-y-2 py-6">
            <CheckCircle2
              className="mx-auto text-primary"
              size={36}
              strokeWidth={1.5}
            />
            <p className="text-base font-medium">Offer sent.</p>
            <p className="text-sm text-muted">
              We&apos;ll reply by email within a day.
              {done.ref ? (
                <>
                  <br />
                  Reference <span className="font-mono">{done.ref}</span>.
                </>
              ) : null}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary mt-4"
            >
              Got it
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">
                Your offer ({product.currency})
              </span>
              <div className="mt-1 relative">
                <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted">
                  <Tag size={16} />
                </span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  inputMode="decimal"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-11 rounded-xl border border-border ps-10 pe-3 text-base"
                />
              </div>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-muted">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full h-11 rounded-xl border border-border px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-muted">
                  Name (optional)
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full h-11 rounded-xl border border-border px-3 text-sm"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">
                Message (optional)
              </span>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="A short note can help us decide."
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm leading-relaxed"
              />
            </label>
            {error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : null}
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="btn btn-primary w-full"
            >
              <Send size={16} />
              {pending ? "Sending…" : "Send offer"}
            </button>
            <p className="text-xs text-muted text-center">
              We&apos;ll counter or accept within 24h.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
