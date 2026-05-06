"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Claim = {
  id: string;
  number: string;
  status: string;
  reason: string;
  message: string;
  adminNote: string;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  createdAt: string;
  orderNumber: string | null;
  photos: string[];
};

const STATUS_OPTIONS = ["open", "reviewing", "resolved", "rejected"];

export function ClaimDetail({ claim }: { claim: Claim }) {
  const router = useRouter();
  const [status, setStatus] = useState(claim.status);
  const [adminNote, setAdminNote] = useState(claim.adminNote);
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState<string | null>(null);

  function save() {
    start(async () => {
      const r = await fetch(`/api/admin/claims/${claim.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
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
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Claim</p>
        <h1 className="mt-1 text-3xl tracking-tight font-mono">{claim.number}</h1>
        <p className="mt-1 text-sm text-muted">
          Filed {new Date(claim.createdAt).toLocaleString()}
          {claim.orderNumber ? ` · order ${claim.orderNumber}` : ""}
        </p>
      </header>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg tracking-tight">Customer</h2>
        <dl className="grid sm:grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">Email</dt>
            <dd className="mt-0.5">{claim.customerEmail}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">Name</dt>
            <dd className="mt-0.5">{claim.customerName || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">Phone</dt>
            <dd className="mt-0.5">{claim.customerPhone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">Reason</dt>
            <dd className="mt-0.5 capitalize">{claim.reason.replaceAll("_", " ")}</dd>
          </div>
        </dl>
        {claim.message ? (
          <div>
            <dt className="text-xs uppercase tracking-[0.16em] text-muted">Message</dt>
            <p className="mt-1 text-sm whitespace-pre-wrap">{claim.message}</p>
          </div>
        ) : null}
      </section>

      {claim.photos.length > 0 ? (
        <section className="card p-5">
          <h2 className="text-lg tracking-tight">Photos</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {claim.photos.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setZoomed(p)}
                className="h-28 w-28 rounded-xl overflow-hidden border border-border hover:opacity-90"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p}
                  alt={`Claim photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card p-5 space-y-3">
        <h2 className="text-lg tracking-tight">Resolution</h2>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">Status</span>
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
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Admin note
          </span>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={4}
            placeholder="Internal notes / what you sent the customer…"
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm leading-relaxed"
          />
        </label>
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={save} disabled={pending} className="btn btn-primary">
            {pending ? "Saving…" : "Save changes"}
          </button>
          {savedAt ? <span className="text-xs text-muted">Saved {savedAt}</span> : null}
        </div>
      </section>

      {zoomed ? (
        <button
          type="button"
          onClick={() => setZoomed(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
          aria-label="Close zoomed photo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoomed}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-2xl"
          />
        </button>
      ) : null}
    </div>
  );
}
