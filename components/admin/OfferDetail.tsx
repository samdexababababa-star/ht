"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

type Offer = {
  id: string;
  number: string;
  status: string;
  proposedPrice: number;
  counterPrice: number | null;
  adminNote: string;
  customerEmail: string;
  customerName: string | null;
  message: string;
  createdAt: string;
  productName: string | null;
  productCurrency: string;
  productPrice: number;
};

const STATUS_OPTIONS = ["open", "accepted", "rejected", "counter", "expired"];

export function OfferDetail({ offer }: { offer: Offer }) {
  const router = useRouter();
  const [status, setStatus] = useState(offer.status);
  const [adminNote, setAdminNote] = useState(offer.adminNote);
  const [counter, setCounter] = useState<string>(
    offer.counterPrice ? (offer.counterPrice / 100).toFixed(2) : "",
  );
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function save() {
    start(async () => {
      const counterCents = counter ? Math.round(parseFloat(counter) * 100) : null;
      const r = await fetch(`/api/admin/offers/${offer.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status,
          adminNote,
          counterPrice: counterCents,
        }),
      });
      if (r.ok) {
        setSavedAt(new Date().toLocaleTimeString());
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-3 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Offer</p>
        <h1 className="mt-1 text-3xl tracking-tight font-mono">{offer.number}</h1>
        <p className="mt-1 text-sm text-muted">
          Filed {new Date(offer.createdAt).toLocaleString()}
        </p>
      </header>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg tracking-tight">Proposal</h2>
        <dl className="grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">
              Listed
            </dt>
            <dd className="mt-0.5">
              {formatPrice(offer.productPrice, offer.productCurrency)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">
              Customer offer
            </dt>
            <dd className="mt-0.5 text-primary font-medium">
              {formatPrice(offer.proposedPrice, offer.productCurrency)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">
              Discount
            </dt>
            <dd className="mt-0.5">
              {offer.productPrice > 0
                ? `${Math.round(
                    ((offer.productPrice - offer.proposedPrice) /
                      offer.productPrice) *
                      100,
                  )}%`
                : "—"}
            </dd>
          </div>
        </dl>
        <p className="text-sm">
          <span className="text-muted">Product:</span>{" "}
          {offer.productName ?? "—"}
        </p>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg tracking-tight">Customer</h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">
              Email
            </dt>
            <dd className="mt-0.5">{offer.customerEmail}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">
              Name
            </dt>
            <dd className="mt-0.5">{offer.customerName || "—"}</dd>
          </div>
        </dl>
        {offer.message ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">
              Message
            </dt>
            <p className="mt-1 text-sm whitespace-pre-wrap">{offer.message}</p>
          </div>
        ) : null}
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg tracking-tight">Decision</h2>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full max-w-xs h-10 rounded-xl border border-border px-3 text-sm bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        {status === "counter" ? (
          <label className="block">
            <span className="text-xs uppercase tracking-[0.16em] text-muted">
              Counter price ({offer.productCurrency})
            </span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={counter}
              onChange={(e) => setCounter(e.target.value)}
              placeholder="0.00"
              className="mt-1 w-full max-w-xs h-10 rounded-xl border border-border px-3 text-sm"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Internal note
          </span>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm leading-relaxed"
          />
        </label>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={save} disabled={pending} className="btn btn-primary">
            {pending ? "Saving…" : "Save changes"}
          </button>
          {savedAt ? (
            <span className="text-xs text-muted">Saved {savedAt}</span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
