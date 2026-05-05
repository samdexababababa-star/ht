"use client";
import { useState, useTransition } from "react";

export function PaymentLinkForm() {
  const [pending, start] = useTransition();
  const [variantId, setVariantId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{ url?: string; orderNumber?: string; error?: string } | null>(null);

  function generate() {
    setResult(null);
    start(async () => {
      const r = await fetch("/api/admin/payment-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ variantId, email, name, note }),
      });
      const j = await r.json();
      if (!r.ok) setResult({ error: j.message ?? "Failed" });
      else setResult({ url: j.url, orderNumber: j.orderNumber });
    });
  }

  return (
    <div className="space-y-3 max-w-xl">
      <div className="card p-6 space-y-3">
        <p className="text-sm text-muted">
          Generate a one-off LemonSqueezy checkout URL for a custom deal. You need the
          target variant&apos;s LemonSqueezy variant ID — find it in your LS dashboard.
        </p>
        <input
          placeholder="LemonSqueezy variant ID"
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="w-full h-11 rounded-xl border border-border px-3 text-sm"
        />
        <div className="grid sm:grid-cols-2 gap-2">
          <input
            placeholder="Customer email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border border-border px-3 text-sm"
          />
          <input
            placeholder="Customer name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl border border-border px-3 text-sm"
          />
        </div>
        <textarea
          placeholder="Internal note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border px-3 py-2 text-sm"
        />
        <button type="button" onClick={generate} disabled={pending} className="btn btn-primary">
          {pending ? "Generating…" : "Generate link"}
        </button>
      </div>

      {result?.error ? (
        <div className="card p-4 text-sm text-red-500">{result.error}</div>
      ) : null}
      {result?.url ? (
        <div className="card p-4 text-sm space-y-2">
          <p>
            <strong>Order #{result.orderNumber}</strong> created. Send this link to your customer:
          </p>
          <a href={result.url} target="_blank" className="text-primary underline break-all">
            {result.url}
          </a>
        </div>
      ) : null}
    </div>
  );
}
