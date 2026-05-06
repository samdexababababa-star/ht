"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CATEGORY_META,
  LEVERS,
  siteAttractivenessScore,
  type GrowthCategory,
  type Lever,
} from "@/lib/growth";
import type { Setting } from "@/app/generated/prisma/client";

// Single dedicated admin page for ALL growth / attractiveness levers Salma
// exposes. Designed so the operator can:
//   1. See the full toolbox at a glance, organized by intent (conversion,
//      trust, social proof, scarcity, visual, retention).
//   2. Read the *psychological mechanism* behind each lever — so this isn't
//      a random switchboard but a curated playbook.
//   3. Flip levers on/off in one click and edit the companion text right
//      where the lever lives (no separate "settings" round-trip).
//   4. Track an "attractiveness score" that grows as more levers are enabled.

type Mode = "all" | GrowthCategory;

const RISK_LABEL: Record<NonNullable<Lever["risk"]>, string> = {
  safe: "Safe",
  moderate: "Use with care",
  aggressive: "Aggressive",
};

const RISK_TONE: Record<NonNullable<Lever["risk"]>, string> = {
  safe: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  aggressive: "bg-red-50 text-red-700 border-red-200",
};

export function GrowthDashboard({ initial }: { initial: Setting }) {
  const router = useRouter();
  const [s, setS] = useState<Setting>(initial);
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("all");
  const [query, setQuery] = useState("");

  function up<K extends keyof Setting>(k: K, v: Setting[K]) {
    setS((x) => ({ ...x, [k]: v }));
  }

  function persist(partial: Partial<Setting>) {
    start(async () => {
      const r = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(partial),
      });
      if (r.ok) {
        const j = await r.json();
        if (j.settings) setS(j.settings);
        setSavedAt(new Date().toLocaleTimeString());
        router.refresh();
      }
    });
  }

  // Optimistic toggle: flip locally, then persist that one field.
  function toggle(key: keyof Setting) {
    const next = !s[key];
    up(key, next as Setting[typeof key]);
    persist({ [key]: next } as Partial<Setting>);
  }

  // Save text companion fields all at once (debounced via the explicit "Save").
  function saveAll() {
    persist(s);
  }

  const score = useMemo(() => siteAttractivenessScore(s), [s]);

  const visible = useMemo(() => {
    const base = LEVERS.filter((l) => l.scope === "site");
    const filtered =
      mode === "all" ? base : base.filter((l) => l.category === mode);
    if (!query.trim()) return filtered;
    const q = query.toLowerCase();
    return filtered.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.mechanism.toLowerCase().includes(q),
    );
  }, [mode, query, s]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Admin · Growth playbook
        </p>
        <h1 className="text-3xl tracking-tight">
          Make the site <span className="serif-italic text-primary">more attractive</span>.
        </h1>
        <p className="text-sm text-muted max-w-2xl">
          A curated toolbox of conversion, trust and retention levers, each
          grounded in a known psychological or UX principle. Flip them on or
          off in one click. Per-product levers live in the product editor — they
          show up automatically when their master toggle is on.
        </p>
      </header>

      {/* Score + controls bar */}
      <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 sticky top-0 z-10 bg-white/95 backdrop-blur">
        <div className="flex items-center gap-4">
          <ScoreGauge pct={score.pct} enabled={score.enabled} total={score.total} />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Site attractiveness
            </p>
            <p className="text-lg tracking-tight">
              {score.enabled} / {score.total} levers active ·{" "}
              <span className="text-primary">{score.pct}%</span>
            </p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search levers…"
            className="h-10 w-full sm:w-56 rounded-xl border border-border px-3 text-sm outline-none focus:border-foreground"
          />
          <button
            type="button"
            onClick={saveAll}
            disabled={pending}
            className="btn btn-primary"
          >
            {pending ? "Saving…" : "Save all"}
          </button>
        </div>
        {savedAt ? (
          <p className="text-xs text-muted whitespace-nowrap">Saved {savedAt}</p>
        ) : null}
      </div>

      {/* Category filter chips */}
      <nav className="flex flex-wrap gap-2">
        <Chip active={mode === "all"} onClick={() => setMode("all")}>
          All
        </Chip>
        {(Object.keys(CATEGORY_META) as GrowthCategory[]).map((c) => (
          <Chip key={c} active={mode === c} onClick={() => setMode(c)}>
            <span className="text-xs opacity-60 mr-1">{CATEGORY_META[c].emoji}</span>
            {CATEGORY_META[c].label}
          </Chip>
        ))}
      </nav>

      {/* Lever cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {visible.map((lever) =>
          lever.scope === "site" ? (
            <SiteLeverCard
              key={lever.id}
              lever={lever}
              s={s}
              onToggle={() => toggle(lever.key)}
              onChangeField={(k, v) => up(k, v as Setting[typeof k])}
            />
          ) : null,
        )}
      </div>

      {visible.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          No levers match your filter.
        </div>
      ) : null}

      {/* Per-product levers reminder */}
      <section className="card p-6 mt-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          Per-product levers
        </p>
        <h2 className="mt-1 text-2xl tracking-tight">
          Some levers live <span className="serif-italic">on the product itself</span>.
        </h2>
        <p className="text-sm text-muted mt-2 max-w-2xl">
          Best-seller / NEW badges, custom social-proof copy, custom trust line,
          highlight-savings display, and bundle suggestions. Open any product in{" "}
          <Link className="text-primary hover:underline" href="/admin/products">
            /admin/products
          </Link>{" "}
          and the &ldquo;Conseils&rdquo; sidebar will surface every applicable
          one with explanations and toggles.
        </p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LEVERS.filter((l) => l.scope === "product").map((l) => (
            <ProductLeverPreview key={l.id} lever={l} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Lever card (site-level) ──────────────────────────────────────────────────

function SiteLeverCard({
  lever,
  s,
  onToggle,
  onChangeField,
}: {
  lever: Extract<Lever, { scope: "site" }>;
  s: Setting;
  onToggle: () => void;
  onChangeField: (k: keyof Setting, v: string) => void;
}) {
  const enabled = Boolean(s[lever.key]);
  const tone = RISK_TONE[lever.risk ?? "safe"];

  return (
    <article
      className={`card p-5 transition-colors ${
        enabled ? "border-primary/40 bg-primary/[0.02]" : ""
      }`}
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-1 h-8 w-8 rounded-xl bg-muted-2 flex items-center justify-center text-base"
        >
          {CATEGORY_META[lever.category].emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            {CATEGORY_META[lever.category].label}
          </p>
          <h3 className="mt-0.5 text-base tracking-tight">{lever.title}</h3>
        </div>
        <Toggle value={enabled} onChange={onToggle} />
      </header>

      <p className="mt-3 text-sm text-foreground/80">{lever.summary}</p>

      <details className="mt-3 group">
        <summary className="cursor-pointer text-[12px] tracking-[0.16em] uppercase text-muted hover:text-foreground select-none list-none">
          <span className="inline-flex items-center gap-1">
            Why it works
            <svg
              className="transition-transform group-open:rotate-180"
              width="10"
              height="10"
              viewBox="0 0 10 10"
            >
              <path
                d="M2 4l3 3 3-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
          </span>
        </summary>
        <p className="mt-2 text-[13px] text-foreground/70 leading-relaxed">
          {lever.mechanism}
        </p>
      </details>

      <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-muted">
        Where it applies
      </p>
      <p className="text-[13px] text-foreground/80">{lever.whereItApplies}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full border ${tone}`}
        >
          {RISK_LABEL[lever.risk ?? "safe"]}
        </span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
          {lever.defaultOn ? "On by default" : "Off by default"}
        </span>
      </div>

      {enabled && lever.fields ? (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          {lever.fields.map((f) => (
            <label key={String(f.key)} className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-muted">
                {f.label}
              </span>
              <input
                type={f.kind === "url" ? "text" : "text"}
                value={(s[f.key] as string | null) ?? ""}
                onChange={(e) => onChangeField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="mt-1 w-full h-10 rounded-xl border border-border px-3 text-sm outline-none focus:border-foreground"
              />
            </label>
          ))}
          <p className="text-[11px] text-muted">
            Click <strong>Save all</strong> at the top to persist text changes.
          </p>
        </div>
      ) : null}
    </article>
  );
}

// ── Read-only preview of per-product levers ─────────────────────────────────

function ProductLeverPreview({
  lever,
}: {
  lever: Extract<Lever, { scope: "product" }>;
}) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
        {CATEGORY_META[lever.category].label}
      </p>
      <h4 className="mt-0.5 text-sm tracking-tight">{lever.title}</h4>
      <p className="mt-1 text-[12px] text-foreground/70 line-clamp-3">
        {lever.summary}
      </p>
      <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted">
        {lever.whereItApplies}
      </p>
    </div>
  );
}

// ── UI primitives ──────────────────────────────────────────────────────────

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={value}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        value ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? "border-foreground bg-foreground text-white"
          : "border-border text-foreground/70 hover:text-foreground hover:border-foreground/40"
      }`}
    >
      {children}
    </button>
  );
}

function ScoreGauge({
  pct,
  enabled,
  total,
}: {
  pct: number;
  enabled: number;
  total: number;
}) {
  // Simple SVG donut
  const size = 56;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="flex-shrink-0"
      aria-label={`${enabled} of ${total} levers enabled`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset .4s ease" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-foreground"
        style={{ fontSize: 13, fontWeight: 600 }}
      >
        {pct}
      </text>
    </svg>
  );
}
