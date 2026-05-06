"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProductGrowthAdvice } from "./ProductGrowthAdvice";
import { productCompletenessScore } from "@/lib/growth";

type Variant = {
  id?: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  durationDays?: number | null;
  stock?: number | null;
  lsVariantId?: string | null;
};

type Category = { id: string; name: string };
type ProductLite = { id: string; name: string };

export type ProductFormData = {
  id?: string;
  name?: string;
  slug?: string;
  tagline?: string | null;
  description?: string;
  longDescription?: string;
  basePrice?: number;
  currency?: string;
  compareAtPrice?: number | null;
  thumbnail?: string | null;
  gallery?: string;
  kind?: string;
  durationDays?: number | null;
  visible?: boolean;
  featured?: boolean;
  badge?: string | null;
  deliveryMode?: string;
  deliveryNotes?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  categoryId?: string | null;
  scarcityEnabled?: boolean;
  scarcityText?: string | null;
  scarcityCount?: number | null;
  urgencyEndsAt?: string | null;
  // phase 7
  warrantyDays?: number | null;
  allowQuantity?: boolean;
  negotiable?: boolean;
  minOfferPrice?: number | null;
  // phase 8 — growth boosters (per-product)
  socialProofEnabled?: boolean;
  socialProofText?: string | null;
  trustBadgeText?: string | null;
  bestSellerBadge?: boolean;
  newBadge?: boolean;
  highlightSavings?: boolean;
  bundleProductId?: string | null;
  variants?: Variant[];
};

// Site-level master toggles the form needs to know about so it can grey-out
// per-product levers whose feature is globally disabled.
export type SiteFlags = {
  bundlesEnabled: boolean;
  socialProofGlobalEnabled: boolean;
};

export function ProductForm({
  initial,
  categories,
  otherProducts,
  siteFlags,
}: {
  initial: ProductFormData;
  categories: Category[];
  otherProducts?: ProductLite[];
  siteFlags?: SiteFlags;
}) {
  const router = useRouter();
  const [data, setData] = useState<ProductFormData>(initial);
  const [variants, setVariants] = useState<Variant[]>(initial.variants ?? []);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function up<K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  // Live "completeness score" — recomputes as the operator types. Powers the
  // Conseils sidebar's gauge.
  const completeness = useMemo(
    () => productCompletenessScore(data),
    [data],
  );

  function save() {
    setError(null);
    start(async () => {
      const url = data.id ? `/api/admin/products/${data.id}` : "/api/admin/products";
      const method = data.id ? "PATCH" : "POST";
      const body = { ...data, variants };
      const r = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        setError(err?.message ?? "Save failed.");
        return;
      }
      const json = await r.json();
      if (!data.id && json?.product?.id) {
        router.push(`/admin/products/${json.product.id}`);
      }
      router.refresh();
    });
  }

  function remove() {
    if (!data.id) return;
    if (!confirm("Delete this product?")) return;
    start(async () => {
      await fetch(`/api/admin/products/${data.id}`, { method: "DELETE" });
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
      <div className="space-y-6 min-w-0">
      <div className="grid md:grid-cols-3 gap-6">
        <section className="card p-6 md:col-span-2 space-y-4">
          <Field label="Name">
            <input
              value={data.name ?? ""}
              onChange={(e) => up("name", e.target.value)}
              className="input"
              placeholder="Netflix Premium"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Slug">
              <input
                value={data.slug ?? ""}
                onChange={(e) => up("slug", e.target.value)}
                className="input"
                placeholder="auto-generated if empty"
              />
            </Field>
            <Field label="Category">
              <select
                value={data.categoryId ?? ""}
                onChange={(e) => up("categoryId", e.target.value || null)}
                className="input"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Tagline">
            <input
              value={data.tagline ?? ""}
              onChange={(e) => up("tagline", e.target.value)}
              className="input"
              placeholder="One-liner shown on the card"
            />
          </Field>
          <Field label="Short description">
            <textarea
              value={data.description ?? ""}
              onChange={(e) => up("description", e.target.value)}
              rows={3}
              className="input"
            />
          </Field>
          <Field label="Long description">
            <textarea
              value={data.longDescription ?? ""}
              onChange={(e) => up("longDescription", e.target.value)}
              rows={5}
              className="input"
            />
          </Field>
        </section>

        <section className="card p-6 space-y-4">
          <Field label="Base price (cents)">
            <input
              type="number"
              value={data.basePrice ?? 0}
              onChange={(e) => up("basePrice", Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Compare-at price (cents)">
            <input
              type="number"
              value={data.compareAtPrice ?? ""}
              onChange={(e) => up("compareAtPrice", e.target.value === "" ? null : Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Currency">
            <input
              value={data.currency ?? "USD"}
              onChange={(e) => up("currency", e.target.value.toUpperCase())}
              className="input"
            />
          </Field>
          <Field label="Kind">
            <select
              value={data.kind ?? "subscription"}
              onChange={(e) => up("kind", e.target.value)}
              className="input"
            >
              <option value="subscription">Subscription</option>
              <option value="service">Service</option>
              <option value="digital">Digital good</option>
              <option value="followers">Followers / engagement</option>
            </select>
          </Field>
          <Field label="Badge">
            <input
              value={data.badge ?? ""}
              onChange={(e) => up("badge", e.target.value)}
              className="input"
              placeholder="e.g. NEW, BESTSELLER"
            />
          </Field>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!data.visible} onChange={(e) => up("visible", e.target.checked)} />
              Visible
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!data.featured} onChange={(e) => up("featured", e.target.checked)} />
              Featured
            </label>
          </div>
        </section>
      </div>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg tracking-tight">Media</h2>
        <Field label="Thumbnail URL">
          <input value={data.thumbnail ?? ""} onChange={(e) => up("thumbnail", e.target.value)} className="input" />
        </Field>
        <Field label="Gallery (one URL per line)">
          <textarea
            rows={3}
            className="input"
            value={(() => {
              try { return (JSON.parse(data.gallery || "[]") as string[]).join("\n"); } catch { return ""; }
            })()}
            onChange={(e) =>
              up("gallery", JSON.stringify(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean)))
            }
          />
        </Field>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg tracking-tight">Variants</h2>
        <p className="text-sm text-muted">
          For subscriptions, create one variant per duration. The first variant
          is shown selected by default.
        </p>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input
                placeholder="Name"
                value={v.name}
                onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                className="input col-span-3"
              />
              <input
                type="number"
                placeholder="Price (cents)"
                value={v.price}
                onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)))}
                className="input col-span-2"
              />
              <input
                type="number"
                placeholder="Compare-at"
                value={v.compareAtPrice ?? ""}
                onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, compareAtPrice: e.target.value === "" ? null : Number(e.target.value) } : x)))}
                className="input col-span-2"
              />
              <input
                type="number"
                placeholder="Duration days"
                value={v.durationDays ?? ""}
                onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, durationDays: e.target.value === "" ? null : Number(e.target.value) } : x)))}
                className="input col-span-2"
              />
              <input
                placeholder="LS variant id"
                value={v.lsVariantId ?? ""}
                onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, lsVariantId: e.target.value || null } : x)))}
                className="input col-span-2"
              />
              <button
                type="button"
                onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))}
                className="text-xs text-muted hover:text-red-500 col-span-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setVariants((vs) => [...vs, { name: "1 month", price: 0 }])
          }
          className="btn btn-outline"
        >
          + Add variant
        </button>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg tracking-tight">Selling options</h2>
        <p className="text-sm text-muted">
          Per-product overrides. Empty = use the storefront default from settings.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Warranty / claims window (days)">
            <input
              type="number"
              min={0}
              value={data.warrantyDays ?? ""}
              onChange={(e) =>
                up(
                  "warrantyDays",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              placeholder="Use settings default"
              className="input"
            />
          </Field>
          <Field label="Min. offer price (cents)">
            <input
              type="number"
              min={0}
              value={data.minOfferPrice ?? ""}
              onChange={(e) =>
                up(
                  "minOfferPrice",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              placeholder="No floor"
              className="input"
              disabled={!data.negotiable}
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!data.allowQuantity}
              onChange={(e) => up("allowQuantity", e.target.checked)}
            />
            Allow quantity selection on the storefront
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!data.negotiable}
              onChange={(e) => up("negotiable", e.target.checked)}
            />
            Price is negotiable (show &ldquo;Make an offer&rdquo;)
          </label>
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-lg tracking-tight">Psychology (subtle scarcity)</h2>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!data.scarcityEnabled}
            onChange={(e) => up("scarcityEnabled", e.target.checked)}
          />
          Show &ldquo;limited stock&rdquo; ribbon on this product
        </label>
        <Field label="Scarcity text">
          <input
            value={data.scarcityText ?? ""}
            onChange={(e) => up("scarcityText", e.target.value)}
            className="input"
            placeholder="Only 4 left at this price"
          />
        </Field>
        <Field label="Urgency ends at (datetime)">
          <input
            type="datetime-local"
            value={data.urgencyEndsAt ?? ""}
            onChange={(e) => up("urgencyEndsAt", e.target.value || null)}
            className="input"
          />
        </Field>
      </section>

      <section className="card p-6 space-y-4" id="growth-boosters">
        <header>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Conseils &amp; boosters
          </p>
          <h2 className="mt-0.5 text-lg tracking-tight">
            Make this product more attractive
          </h2>
          <p className="text-sm text-muted">
            Each booster is opt-in. Click <strong>Why</strong> on any item in
            the sidebar to read the psychological mechanism.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-3">
          <BoosterCheck
            label="Show 'BEST SELLER' badge"
            checked={!!data.bestSellerBadge}
            onChange={(v) => up("bestSellerBadge", v)}
            hint="Implicit social proof — buyers default to the most popular option."
          />
          <BoosterCheck
            label="Show 'NEW' badge"
            checked={!!data.newBadge}
            onChange={(v) => up("newBadge", v)}
            hint="Novelty bias drives clicks on catalog pages."
          />
          <BoosterCheck
            label="Highlight savings amount ($X off)"
            checked={!!data.highlightSavings}
            onChange={(v) => up("highlightSavings", v)}
            hint="Concrete dollar amounts feel more tangible than percentages. Requires a compare-at price."
            disabled={!data.compareAtPrice || (data.compareAtPrice ?? 0) <= (data.basePrice ?? 0)}
            disabledHint="Add a compare-at price greater than base price first."
          />
          <BoosterCheck
            label="Show social-proof line"
            checked={!!data.socialProofEnabled}
            onChange={(v) => up("socialProofEnabled", v)}
            hint="Quantified, recent social proof above the variants. Requires the master toggle in /admin/growth."
            disabled={siteFlags ? !siteFlags.socialProofGlobalEnabled : false}
            disabledHint="Master toggle is off — turn it on in /admin/growth → Social proof."
          />
        </div>

        {data.socialProofEnabled ? (
          <Field label="Social-proof sentence">
            <input
              value={data.socialProofText ?? ""}
              onChange={(e) => up("socialProofText", e.target.value)}
              className="input"
              placeholder="73 people bought this in the last 24 h"
            />
          </Field>
        ) : null}

        <Field label="Custom trust line (leave empty to hide)">
          <input
            value={data.trustBadgeText ?? ""}
            onChange={(e) => up("trustBadgeText", e.target.value)}
            className="input"
            placeholder="Instant delivery — credentials in your inbox in 60 s"
          />
          <p className="mt-1 text-[11px] text-muted">
            Specific trust statements outperform generic ones. Address the exact
            objection your buyer is most likely to have.
          </p>
        </Field>

        {otherProducts && otherProducts.length > 0 ? (
          <Field label="Bundle with another product (cross-sell)">
            <select
              value={data.bundleProductId ?? ""}
              onChange={(e) => up("bundleProductId", e.target.value || null)}
              className="input"
              disabled={siteFlags ? !siteFlags.bundlesEnabled : false}
            >
              <option value="">No bundle suggestion</option>
              {otherProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-muted">
              Pre-decision bundling lifts AOV ~10–30% when the partner product
              complements (not duplicates) this one.
              {siteFlags && !siteFlags.bundlesEnabled ? (
                <>
                  {" "}
                  <strong>Master toggle off</strong> — enable bundles in{" "}
                  /admin/growth.
                </>
              ) : null}
            </p>
          </Field>
        ) : null}
      </section>

      {error ? <p className="text-red-500 text-sm">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : data.id ? "Save changes" : "Create product"}
        </button>
        {data.id ? (
          <button type="button" onClick={remove} className="btn btn-outline text-red-500">
            Delete
          </button>
        ) : null}
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--border);
          padding: 0 12px;
          font-size: 14px;
        }
        textarea.input { height: auto; padding: 10px 12px; line-height: 1.5; }
        .input:focus { outline: none; border-color: var(--foreground); }
      `}</style>
      </div>

      <aside className="lg:sticky lg:top-4 self-start">
        <ProductGrowthAdvice
          data={data}
          completeness={completeness}
          siteFlags={siteFlags}
          onApply={(patch) =>
            setData((d) => ({ ...d, ...patch }))
          }
        />
      </aside>
    </div>
  );
}

function BoosterCheck({
  label,
  hint,
  checked,
  onChange,
  disabled,
  disabledHint,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  disabledHint?: string;
}) {
  return (
    <label
      className={`flex items-start gap-2 rounded-xl border border-border p-3 ${
        disabled ? "opacity-60" : "hover:border-foreground/30"
      } ${checked && !disabled ? "border-primary/50 bg-primary/[0.02]" : ""}`}
    >
      <input
        type="checkbox"
        className="mt-0.5"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="text-sm">
        <span className="block font-medium">{label}</span>
        <span className="block text-[12px] text-muted leading-snug mt-0.5">
          {disabled && disabledHint ? disabledHint : hint}
        </span>
      </span>
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
