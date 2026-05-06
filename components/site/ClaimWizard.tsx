"use client";
import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, ChevronRight, Loader2 } from "lucide-react";

type OrderShape = {
  id: string;
  number: string;
  email: string | null;
  createdAt: string;
  total: number;
  currency: string;
  items: { id: string; name: string; variantName: string | null; quantity: number }[];
};

type Step = "lookup" | "details" | "submitting" | "done";

export function ClaimWizard({
  requirePhoto,
  allowMessage,
  maxPhotos,
  warrantyDefaultDays,
}: {
  requirePhoto: boolean;
  allowMessage: boolean;
  maxPhotos: number;
  warrantyDefaultDays: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("lookup");
  const [order, setOrder] = useState<OrderShape | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderItemId, setOrderItemId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function lookup() {
    setError(null);
    if (!orderNumber || !email) {
      setError("Please enter both order number and email.");
      return;
    }
    start(async () => {
      const r = await fetch("/api/claims/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber: orderNumber.trim().toUpperCase(), email: email.trim() }),
      });
      const j = await r.json();
      if (!j.ok) {
        setError(j.message || "Order not found.");
        return;
      }
      setOrder(j.order);
      if (j.order.items.length === 1) setOrderItemId(j.order.items[0].id);
      setStep("details");
    });
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, maxPhotos - photos.length);
    Promise.all(
      list.map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            if (!f.type.startsWith("image/")) {
              reject(new Error("Not an image"));
              return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(f);
          }),
      ),
    )
      .then((urls) => setPhotos((p) => [...p, ...urls].slice(0, maxPhotos)))
      .catch(() => setError("One or more files could not be read."));
  }

  function removePhoto(idx: number) {
    setPhotos((p) => p.filter((_, i) => i !== idx));
  }

  async function submit() {
    setError(null);
    if (!reason.trim()) {
      setError("Please choose a reason.");
      return;
    }
    if (requirePhoto && photos.length === 0) {
      setError("At least one photo is required.");
      return;
    }
    setStep("submitting");
    const r = await fetch("/api/claims", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderNumber: order?.number ?? orderNumber,
        orderItemId,
        customerEmail: email.trim(),
        customerName: name.trim() || undefined,
        customerPhone: phone.trim() || undefined,
        reason,
        message: message.trim() || undefined,
        photos,
      }),
    });
    const j = await r.json();
    if (!j.ok) {
      setError(j.message || "Could not submit your claim.");
      setStep("details");
      return;
    }
    router.push(`/warranty/success?ref=${encodeURIComponent(j.claim.number)}`);
  }

  if (step === "lookup") {
    return (
      <div className="card p-6 space-y-4">
        <h2 className="text-lg tracking-tight">Find your order</h2>
        <p className="text-sm text-muted">
          We need to confirm the purchase before opening a claim.
        </p>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Order number
          </span>
          <input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="SAL-XXXXXX"
            className="input mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm font-mono uppercase"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Email used at checkout
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm"
          />
        </label>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button
          onClick={lookup}
          disabled={pending}
          className="btn btn-primary inline-flex items-center gap-1"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : null}
          Continue <ChevronRight size={14} />
        </button>
        <p className="text-xs text-muted">
          Within {warrantyDefaultDays} days of your purchase by default — admins can
          extend per product.
        </p>
      </div>
    );
  }

  if (step === "submitting") {
    return (
      <div className="card p-10 text-center">
        <Loader2 size={32} className="mx-auto animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted">Submitting your claim…</p>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="rounded-xl bg-muted-2 p-4 text-sm">
        <p className="font-medium">Order {order?.number}</p>
        <p className="text-muted text-xs mt-0.5">
          Placed{" "}
          {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""} ·{" "}
          {order?.email ?? "no email"}
        </p>
      </div>

      {order && order.items.length > 1 ? (
        <fieldset className="space-y-2">
          <legend className="text-xs uppercase tracking-[0.16em] text-muted">
            Which item?
          </legend>
          {order.items.map((it) => (
            <label
              key={it.id}
              className={`flex gap-3 items-center rounded-xl border px-3 py-2 cursor-pointer ${
                orderItemId === it.id
                  ? "border-primary bg-primary-soft"
                  : "border-border"
              }`}
            >
              <input
                type="radio"
                name="item"
                value={it.id}
                checked={orderItemId === it.id}
                onChange={() => setOrderItemId(it.id)}
              />
              <span className="text-sm">
                {it.name}
                {it.variantName ? ` — ${it.variantName}` : ""} ×{it.quantity}
              </span>
            </label>
          ))}
        </fieldset>
      ) : null}

      <label className="block">
        <span className="text-xs uppercase tracking-[0.16em] text-muted">
          Reason
        </span>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm bg-white"
        >
          <option value="">Choose a reason…</option>
          <option value="not_delivered">Not delivered</option>
          <option value="wrong_item">Wrong item received</option>
          <option value="not_working">Doesn&apos;t work</option>
          <option value="quality_issue">Quality issue</option>
          <option value="other">Other</option>
        </select>
      </label>

      {allowMessage ? (
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Tell us more {requirePhoto ? "" : "(optional)"}
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="What happened, when, what you tried…"
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm leading-relaxed"
          />
        </label>
      ) : null}

      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted">
          Photos {requirePhoto ? <span className="text-red-500 normal-case">required</span> : <span className="normal-case">(optional)</span>}
        </p>
        <p className="text-xs text-muted">
          Up to {maxPhotos} images. We use them to investigate faster.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div
              key={i}
              className="relative h-20 w-20 rounded-xl overflow-hidden border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 rounded-full bg-black/70 text-white p-1 hover:bg-black"
                aria-label="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {photos.length < maxPhotos ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="h-20 w-20 rounded-xl border border-dashed border-border text-muted hover:border-foreground hover:text-foreground inline-flex flex-col items-center justify-center gap-1"
            >
              <ImagePlus size={18} />
              <span className="text-[10px] uppercase tracking-wider">Add</span>
            </button>
          ) : null}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFiles(e.target.files)}
          className="hidden"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Your name (optional)
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-[0.16em] text-muted">
            Phone / WhatsApp (optional)
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm"
          />
        </label>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={submit} className="btn btn-primary">
          Submit claim
        </button>
        <button
          onClick={() => setStep("lookup")}
          className="btn btn-outline"
          type="button"
        >
          Different order
        </button>
      </div>
    </div>
  );
}
