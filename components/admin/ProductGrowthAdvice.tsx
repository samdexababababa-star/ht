"use client";
import type { ProductFormData, SiteFlags } from "./ProductForm";

// Contextual "Conseils" sidebar that lives next to the product form. It scans
// the current product state and surfaces actionable, evidence-based advice.
// Each suggestion can be applied with a single click — the click toggles the
// relevant field on the form (boosters), or scrolls to the field that needs
// to be filled in (e.g. compare-at price, tagline).
//
// Distinct from /admin/growth (the master switchboard): this sidebar is
// *contextual* — it only shows tips that actually apply to the product the
// operator is currently editing.

type Tip = {
  id: string;
  title: string;
  why: string;
  // What to do. Either:
  //   - "apply": flip a field on the form (id describes which one, label is the
  //     button copy)
  //   - "focus": tell the operator to fill an input that exists in the form
  //   - "link": send them to /admin/growth or another page
  action:
    | { kind: "apply"; patch: Partial<ProductFormData>; label: string }
    | { kind: "focus"; selector: string; label: string }
    | { kind: "link"; href: string; label: string };
  level: "essential" | "boost" | "advanced";
};

function buildTips(
  data: ProductFormData,
  siteFlags?: SiteFlags,
): Tip[] {
  const tips: Tip[] = [];

  // ── Essentials (the product is missing something basic) ──────────────────
  if (!data.tagline || data.tagline.trim().length < 10) {
    tips.push({
      id: "add-tagline",
      title: "Add a punchy tagline",
      why: "The tagline is the single most-read line on the product card. A specific, benefit-led one-liner outperforms a generic one by ~25% on click-through.",
      action: {
        kind: "focus",
        selector: 'input[placeholder*="One-liner"]',
        label: "Write tagline",
      },
      level: "essential",
    });
  }

  if (!data.thumbnail) {
    tips.push({
      id: "add-thumbnail",
      title: "Set a thumbnail image",
      why: "Products without a thumbnail look generic on the catalog. The visual is the first thing the brain processes — even a simple branded color block lifts perceived quality.",
      action: {
        kind: "focus",
        selector: 'input[placeholder=""]', // Thumbnail URL input — best-effort
        label: "Add image URL",
      },
      level: "essential",
    });
  }

  if (
    data.description == null ||
    data.description.trim().length < 30
  ) {
    tips.push({
      id: "expand-description",
      title: "Write a 1–2 sentence short description",
      why: "Short descriptions are the buyer's first scan. Too short and they bounce; aim for ~30–80 characters that list the most concrete benefit.",
      action: {
        kind: "focus",
        selector: "textarea",
        label: "Expand description",
      },
      level: "essential",
    });
  }

  // ── Anchoring + savings ──────────────────────────────────────────────────
  if (!data.compareAtPrice || (data.compareAtPrice ?? 0) <= (data.basePrice ?? 0)) {
    tips.push({
      id: "add-compare-at",
      title: "Add a compare-at price",
      why: "Anchoring (Tversky & Kahneman): a higher 'reference' price next to the actual price makes the actual feel like a deal. Even a modest 15% gap moves conversion measurably.",
      action: {
        kind: "focus",
        selector: 'input[type="number"]',
        label: "Set compare-at",
      },
      level: "boost",
    });
  } else if (!data.highlightSavings) {
    tips.push({
      id: "highlight-savings",
      title: "Highlight savings as $X off",
      why: "Concreteness effect: 'Save $5' often feels more tangible than '-25%' for low-price items. This product already has the prices needed.",
      action: {
        kind: "apply",
        patch: { highlightSavings: true },
        label: "Apply",
      },
      level: "boost",
    });
  }

  // ── Badges ───────────────────────────────────────────────────────────────
  if (!data.bestSellerBadge && !data.newBadge && !data.featured) {
    tips.push({
      id: "add-badge",
      title: "Add a corner badge (BEST SELLER or NEW)",
      why: "Catalog pages with 1–2 badged products see those products clicked 2–3× more often. Reserve badges for ~20% of the catalog so they keep weight.",
      action: {
        kind: "apply",
        patch: { bestSellerBadge: true },
        label: "Mark as BEST SELLER",
      },
      level: "boost",
    });
  }

  // ── Scarcity / urgency ───────────────────────────────────────────────────
  if (!data.scarcityEnabled) {
    tips.push({
      id: "enable-scarcity",
      title: "Add a 'limited stock' line",
      why: "Loss aversion: showing scarcity (\"Only 5 left\") raises perceived value and urgency. Use sparingly — buyers detect overuse.",
      action: {
        kind: "apply",
        patch: {
          scarcityEnabled: true,
          scarcityText: data.scarcityText || "Only 5 left at this price",
        },
        label: "Enable scarcity",
      },
      level: "boost",
    });
  }

  if (!data.urgencyEndsAt) {
    tips.push({
      id: "set-urgency",
      title: "Set a deadline for the offer",
      why: "Time scarcity > stock scarcity for digital goods. A countdown that ends in 24–72 h converts ~5–10% better than evergreen pricing.",
      action: {
        kind: "focus",
        selector: 'input[type="datetime-local"]',
        label: "Set deadline",
      },
      level: "boost",
    });
  }

  // ── Trust ────────────────────────────────────────────────────────────────
  if (!data.trustBadgeText) {
    tips.push({
      id: "trust-line",
      title: "Add a custom trust line",
      why: "A single, specific reassurance under the title pre-empts the buyer's most likely objection. Generic badges in the footer can't do this — they're too far away.",
      action: {
        kind: "focus",
        selector: 'input[placeholder*="Instant delivery"]',
        label: "Write trust line",
      },
      level: "boost",
    });
  }

  if (data.warrantyDays == null || data.warrantyDays === 0) {
    tips.push({
      id: "set-warranty",
      title: "Confirm a warranty window",
      why: "Buyers of digital goods worry about chargebacks and 'what if it stops working'. Explicit warranty days are the cheapest, most effective trust signal.",
      action: {
        kind: "focus",
        selector: 'input[placeholder="Use settings default"]',
        label: "Set warranty days",
      },
      level: "boost",
    });
  }

  // ── Social proof ─────────────────────────────────────────────────────────
  if (!data.socialProofEnabled) {
    if (siteFlags && !siteFlags.socialProofGlobalEnabled) {
      tips.push({
        id: "enable-social-proof-master",
        title: "Turn on social-proof copy globally",
        why: "Cialdini's most-replicated lever. Even a small, specific number lifts conversion. The master toggle is off — flip it once and per-product copy becomes available.",
        action: {
          kind: "link",
          href: "/admin/growth",
          label: "Open growth playbook",
        },
        level: "advanced",
      });
    } else {
      tips.push({
        id: "enable-social-proof",
        title: "Show a social-proof line above variants",
        why: "Concrete + recent + numeric beats vague badges every time in field studies. Use real-ish numbers — overshooting kills credibility.",
        action: {
          kind: "apply",
          patch: {
            socialProofEnabled: true,
            socialProofText:
              data.socialProofText ||
              "73 people bought this in the last 24 h",
          },
          label: "Enable social-proof line",
        },
        level: "boost",
      });
    }
  }

  // ── Cross-sell ───────────────────────────────────────────────────────────
  if (!data.bundleProductId) {
    if (siteFlags && !siteFlags.bundlesEnabled) {
      tips.push({
        id: "enable-bundles-master",
        title: "Turn on bundle suggestions globally",
        why: "Pairing complementary products lifts AOV 10–30% with no harm to conversion. The master toggle is off — flip it once and you can pair this product with a sibling.",
        action: {
          kind: "link",
          href: "/admin/growth",
          label: "Open growth playbook",
        },
        level: "advanced",
      });
    } else {
      tips.push({
        id: "set-bundle",
        title: "Pair this product with a complementary one",
        why: "Most effective when the partner product is *complementary*, not a duplicate (e.g. Netflix + Spotify, not Netflix + Disney+).",
        action: {
          kind: "focus",
          selector: 'select[class="input"]', // best-effort
          label: "Pick a partner",
        },
        level: "advanced",
      });
    }
  }

  // ── Per-product selling options ──────────────────────────────────────────
  if (!data.negotiable) {
    tips.push({
      id: "enable-negotiable",
      title: "Allow buyers to make an offer",
      why: "Engagement lever: even buyers who don't make an offer hesitate longer on negotiable products and are more likely to buy at full price after.",
      action: {
        kind: "apply",
        patch: { negotiable: true },
        label: "Enable Make-an-offer",
      },
      level: "advanced",
    });
  }

  // ── SEO ─────────────────────────────────────────────────────────────────
  if (!data.seoTitle || !data.seoDescription) {
    tips.push({
      id: "add-seo",
      title: "Write SEO title + meta description",
      why: "SEO meta is what Google shows in search results. A bad meta = low CTR even when ranking. Aim for ~55-char title, ~155-char description, with a benefit + brand.",
      action: {
        kind: "focus",
        selector: 'input[placeholder]', // best-effort; SEO fields aren't here yet
        label: "Add SEO copy",
      },
      level: "advanced",
    });
  }

  return tips;
}

const LEVEL_TONE: Record<Tip["level"], string> = {
  essential: "border-amber-300/60 bg-amber-50/60",
  boost: "border-primary/30 bg-primary/[0.03]",
  advanced: "border-border bg-white",
};

const LEVEL_ICON: Record<Tip["level"], string> = {
  essential: "!",
  boost: "+",
  advanced: "★",
};

export function ProductGrowthAdvice({
  data,
  completeness,
  siteFlags,
  onApply,
}: {
  data: ProductFormData;
  completeness: { score: number; total: number; pct: number; missing: string[] };
  siteFlags?: SiteFlags;
  onApply: (patch: Partial<ProductFormData>) => void;
}) {
  const tips = buildTips(data, siteFlags);
  const essential = tips.filter((t) => t.level === "essential");
  const boost = tips.filter((t) => t.level === "boost");
  const advanced = tips.filter((t) => t.level === "advanced");

  return (
    <div className="card p-5 space-y-4">
      <header>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
          Conseils for this product
        </p>
        <h3 className="text-lg tracking-tight">
          Live attractiveness <span className="serif-italic">advisor</span>
        </h3>
      </header>

      {/* Score gauge */}
      <div className="flex items-center gap-3">
        <ScoreDonut pct={completeness.pct} />
        <div className="text-sm">
          <p className="font-medium">
            {completeness.score} / {completeness.total} signals
          </p>
          <p className="text-muted text-[12px]">
            {completeness.pct >= 80
              ? "Strong listing — minor polish possible."
              : completeness.pct >= 50
                ? "Solid baseline. Apply a few tips below to push higher."
                : "Lots of easy wins below."}
          </p>
        </div>
      </div>

      {tips.length === 0 ? (
        <p className="text-sm text-muted">
          All recommended levers are configured. You can revisit{" "}
          <a href="/admin/growth" className="text-primary hover:underline">
            /admin/growth
          </a>{" "}
          to flip site-wide options.
        </p>
      ) : (
        <div className="space-y-3">
          {essential.length > 0 ? (
            <Group label="Essentials" tips={essential} onApply={onApply} />
          ) : null}
          {boost.length > 0 ? (
            <Group label="Boosters" tips={boost} onApply={onApply} />
          ) : null}
          {advanced.length > 0 ? (
            <Group label="Advanced" tips={advanced} onApply={onApply} />
          ) : null}
        </div>
      )}

      <p className="text-[11px] text-muted pt-2 border-t border-border">
        Need more levers? Visit{" "}
        <a href="/admin/growth" className="text-primary hover:underline">
          Growth &amp; advice
        </a>{" "}
        for the full toolbox with the psychological rationale of each one.
      </p>
    </div>
  );
}

function Group({
  label,
  tips,
  onApply,
}: {
  label: string;
  tips: Tip[];
  onApply: (patch: Partial<ProductFormData>) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      {tips.map((t) => (
        <article
          key={t.id}
          className={`rounded-2xl border p-3 ${LEVEL_TONE[t.level]}`}
        >
          <div className="flex items-start gap-2">
            <span
              aria-hidden
              className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-white text-[11px] font-semibold flex-shrink-0"
            >
              {LEVEL_ICON[t.level]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">{t.title}</p>
              <details className="mt-1 group">
                <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.16em] text-muted hover:text-foreground select-none">
                  Why
                  <span className="ml-1 group-open:hidden">▾</span>
                  <span className="ml-1 hidden group-open:inline">▴</span>
                </summary>
                <p className="mt-1 text-[12px] text-foreground/70 leading-relaxed">
                  {t.why}
                </p>
              </details>
              <div className="mt-2">
                {t.action.kind === "apply" ? (
                  <button
                    type="button"
                    onClick={() => {
                      // narrow type for typescript
                      if (t.action.kind === "apply") onApply(t.action.patch);
                    }}
                    className="text-[12px] font-medium px-3 py-1.5 rounded-full bg-foreground text-white hover:opacity-90 transition"
                  >
                    {t.action.label}
                  </button>
                ) : t.action.kind === "focus" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (t.action.kind !== "focus") return;
                      const el = document.querySelector(
                        t.action.selector,
                      ) as HTMLElement | null;
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        el.focus();
                      }
                    }}
                    className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-border hover:border-foreground transition"
                  >
                    {t.action.label} →
                  </button>
                ) : (
                  <a
                    href={t.action.href}
                    className="inline-block text-[12px] font-medium px-3 py-1.5 rounded-full border border-border hover:border-foreground transition"
                  >
                    {t.action.label} →
                  </a>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ScoreDonut({ pct }: { pct: number }) {
  const size = 44;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
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
        style={{ fontSize: 11, fontWeight: 600 }}
      >
        {pct}
      </text>
    </svg>
  );
}
