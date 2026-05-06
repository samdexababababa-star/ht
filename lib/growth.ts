// Centralized catalog of all "growth" / "attractiveness" levers Salma exposes
// to admins. Each entry powers two surfaces:
//
//   1. /admin/growth — the dedicated dashboard where admins flip levers globally.
//   2. The contextual "Conseils" sidebar on the product create/edit form, which
//      only shows levers that actually apply to a single product (per-product
//      toggles — bestSellerBadge, newBadge, socialProofEnabled, etc.).
//
// The point of having one source of truth is so every lever ships with:
//   - a clear title and short description (admin-readable)
//   - the *psychological mechanism* that makes it work (Cialdini, behavioural
//     economics, UX heuristics) so the operator understands *why* and isn't
//     just toggling random switches
//   - where it actually shows up on the storefront ("Where it applies")
//   - the storefront/product flag that controls it
//
// Nothing here renders UI on its own; it's pure data + types.

import type { Setting, Product } from "@/app/generated/prisma/client";

export type GrowthCategory =
  | "conversion"
  | "trust"
  | "social-proof"
  | "scarcity"
  | "visual"
  | "mobile"
  | "retention";

export const CATEGORY_META: Record<
  GrowthCategory,
  { label: string; tagline: string; emoji: string }
> = {
  conversion: {
    label: "Conversion",
    tagline: "Direct-response levers that turn visits into orders.",
    emoji: "▲",
  },
  trust: {
    label: "Trust",
    tagline: "Reduce risk perception. Trust badges, guarantees, transparency.",
    emoji: "✓",
  },
  "social-proof": {
    label: "Social proof",
    tagline: "Show that other people are buying. Cialdini's most replicated lever.",
    emoji: "◎",
  },
  scarcity: {
    label: "Scarcity & urgency",
    tagline: "Loss-aversion levers — limited stock, time-bound offers.",
    emoji: "⌁",
  },
  visual: {
    label: "Visual polish",
    tagline: "Tiny pieces of motion, depth, and rhythm that signal quality.",
    emoji: "◇",
  },
  mobile: {
    label: "Mobile",
    tagline: "Levers that only meaningfully change the mobile experience.",
    emoji: "▢",
  },
  retention: {
    label: "Retention",
    tagline: "Bring people back: recently-viewed, exit-intent, post-purchase.",
    emoji: "↻",
  },
};

// Each lever has a `scope`:
//   - "site"    => controlled by Settings.<key>; lives only on /admin/growth
//   - "product" => per-product toggle; surfaces in the Conseils sidebar of the
//                  product form. Most product-scoped levers also have a site-
//                  level master toggle (`siteKey`) so the operator can disable
//                  the whole category at once.
export type SiteSettingKey = keyof Setting;
export type ProductFlagKey = keyof Product;

export type Lever =
  | {
      id: string;
      scope: "site";
      category: GrowthCategory;
      title: string;
      summary: string;
      // 1–2 sentence rationale grounded in a known principle.
      mechanism: string;
      // Where on the storefront it appears.
      whereItApplies: string;
      // Boolean settings flag.
      key: SiteSettingKey;
      // Optional companion fields the admin can edit once the lever is on.
      fields?: Array<{
        key: SiteSettingKey;
        label: string;
        kind: "text" | "url";
        placeholder?: string;
      }>;
      defaultOn: boolean;
      // Maturity / risk note shown in the UI.
      risk?: "safe" | "moderate" | "aggressive";
    }
  | {
      id: string;
      scope: "product";
      category: GrowthCategory;
      title: string;
      summary: string;
      mechanism: string;
      whereItApplies: string;
      // Boolean per-product field on Product.
      productKey: ProductFlagKey;
      // Optional master toggle on Settings that gates the whole feature.
      siteKey?: SiteSettingKey;
      // Optional product-level companion fields.
      productFields?: Array<{
        key: ProductFlagKey;
        label: string;
        placeholder?: string;
      }>;
      defaultOn: boolean;
      risk?: "safe" | "moderate" | "aggressive";
    };

// ─── The catalog ────────────────────────────────────────────────────────────
//
// Order is intentional: most-impactful + lowest-risk levers first within each
// category so a brand-new operator scrolling top-to-bottom gets a sensible
// starting recipe.

export const LEVERS: Lever[] = [
  // ── Trust ─────────────────────────────────────────────────────────────────
  {
    id: "trust-badges",
    scope: "site",
    category: "trust",
    title: "Trust badges row",
    summary:
      "Three small badges (instant delivery, secure payment, money-back) shown on every product page and in the footer.",
    mechanism:
      "Risk reduction is the #1 reason buyers abandon a digital-goods checkout. Badges that pre-answer 'will I actually get this?' lift conversion by ~5–15% on independent A/B tests.",
    whereItApplies: "Product page (under add-to-cart) + footer.",
    key: "trustBadgesEnabled",
    defaultOn: true,
    risk: "safe",
  },
  {
    id: "sticky-promo",
    scope: "site",
    category: "trust",
    title: "Sticky promo banner",
    summary:
      "Thin banner pinned to the top of every page with a custom message and optional link.",
    mechanism:
      "First impression: tells the visitor immediately what they're getting (free instant delivery, money-back, etc). Removes the decision-fatigue around 'is this site legit'.",
    whereItApplies: "Top of every storefront page (above the header).",
    key: "stickyPromoEnabled",
    fields: [
      {
        key: "stickyPromoText",
        label: "Banner text",
        kind: "text",
        placeholder: "Free instant delivery on every order",
      },
      {
        key: "stickyPromoLink",
        label: "Optional link (clicking the banner goes here)",
        kind: "url",
        placeholder: "/catalog",
      },
    ],
    defaultOn: false,
    risk: "safe",
  },

  // ── Social proof ──────────────────────────────────────────────────────────
  {
    id: "live-visitor-count",
    scope: "site",
    category: "social-proof",
    title: "Live visitor count",
    summary:
      "Shows '3 people are viewing this product' on each product page. The number floats based on real session activity.",
    mechanism:
      "Cialdini's social proof: when uncertain, people copy the behaviour of others. Even a number as small as 2–3 dramatically reduces 'should I buy?' hesitation.",
    whereItApplies: "Product page (just below the price).",
    key: "liveVisitorCountEnabled",
    defaultOn: false,
    risk: "moderate",
  },
  {
    id: "social-proof-master",
    scope: "site",
    category: "social-proof",
    title: "Per-product social proof line",
    summary:
      "Master switch for product-level social proof copy (e.g. \"73 people bought this in the last 24h\"). Each product still has its own opt-in.",
    mechanism:
      "Concrete, recent, and quantified social proof outperforms vague badges by a large margin in e-commerce field studies.",
    whereItApplies: "Product page (above the variants).",
    key: "socialProofGlobalEnabled",
    defaultOn: false,
    risk: "moderate",
  },

  // ── Conversion ────────────────────────────────────────────────────────────
  {
    id: "exit-intent",
    scope: "site",
    category: "conversion",
    title: "Exit-intent popup",
    summary:
      "When the user moves toward closing the tab (desktop) or scrolls back to the very top (mobile), surface a small popup with an optional discount code.",
    mechanism:
      "Recovers ~10–15% of would-be abandoners in published case studies. Loss aversion: 'leaving without using my discount' feels worse than buying.",
    whereItApplies: "Storefront (excluding /admin and checkout).",
    key: "exitIntentEnabled",
    fields: [
      {
        key: "exitIntentText",
        label: "Popup message",
        kind: "text",
        placeholder: "Wait — get 10% off your first order",
      },
      {
        key: "exitIntentCode",
        label: "Promo code to surface (optional)",
        kind: "text",
        placeholder: "WELCOME10",
      },
    ],
    defaultOn: false,
    risk: "moderate",
  },
  {
    id: "back-to-top",
    scope: "site",
    category: "conversion",
    title: "Back-to-top button",
    summary:
      "Small floating button that appears after the user scrolls 600px on mobile, making it instant to return to the menu.",
    mechanism:
      "Fitts' law: critical actions should be one tap away. On long catalog scrolls, this dramatically reduces 'lost' users on mobile.",
    whereItApplies: "Bottom-right of every storefront page on mobile.",
    key: "backToTopEnabled",
    defaultOn: true,
    risk: "safe",
  },
  {
    id: "bundles-master",
    scope: "site",
    category: "conversion",
    title: "Bundle suggestions (cross-sell)",
    summary:
      "Master switch for the per-product 'Often bought with…' card. Each product can pick a sibling product to suggest.",
    mechanism:
      "Average order value lift: cross-sell modules typically push AOV up 10–30% with no harm to conversion rate when chosen well.",
    whereItApplies: "Product page (between description and add-to-cart).",
    key: "bundlesEnabled",
    defaultOn: false,
    risk: "safe",
  },

  // ── Retention ─────────────────────────────────────────────────────────────
  {
    id: "recently-viewed",
    scope: "site",
    category: "retention",
    title: "Recently viewed",
    summary:
      "Stores the last 6 products the user opened (in their browser) and shows them in a thin row in the footer.",
    mechanism:
      "The endowment effect: products the user has already considered feel partly 'theirs'. Bringing them back into view prompts return-to-buy.",
    whereItApplies: "Footer of every storefront page.",
    key: "recentlyViewedEnabled",
    defaultOn: false,
    risk: "safe",
  },

  // ── Visual polish ────────────────────────────────────────────────────────
  {
    id: "page-transitions",
    scope: "site",
    category: "visual",
    title: "Page transitions",
    summary:
      "Soft fade between routes instead of a hard cut. Uses 150 ms and respects 'reduce motion'.",
    mechanism:
      "Continuity-of-attention: when the screen smoothly transitions, the brain treats the site as a single fluid experience and trusts it more.",
    whereItApplies: "Every storefront route change.",
    key: "pageTransitionsEnabled",
    defaultOn: true,
    risk: "safe",
  },
  {
    id: "reading-progress",
    scope: "site",
    category: "visual",
    title: "Reading progress bar",
    summary:
      "Thin 2px bar at the top of long product pages that fills as the user scrolls.",
    mechanism:
      "Goal-gradient effect: progress visualised increases the likelihood of completion by ~20% in classic experiments.",
    whereItApplies: "Long product description pages on mobile.",
    key: "readingProgressEnabled",
    defaultOn: false,
    risk: "safe",
  },

  // ── Per-product levers ────────────────────────────────────────────────────
  {
    id: "best-seller-badge",
    scope: "product",
    category: "social-proof",
    title: "Show 'BEST SELLER' badge",
    summary: "Small pill in the corner of the product card and on the product page.",
    mechanism:
      "Implicit social proof. Buyers default to the most popular option when uncertain — the 'top-seller heuristic'.",
    whereItApplies: "Product card + product page header.",
    productKey: "bestSellerBadge",
    defaultOn: false,
    risk: "safe",
  },
  {
    id: "new-badge",
    scope: "product",
    category: "conversion",
    title: "Show 'NEW' badge",
    summary: "Small NEW pill that lasts as long as you keep it on.",
    mechanism:
      "Novelty bias: humans systematically over-attend to new things. Drives clicks on catalog pages.",
    whereItApplies: "Product card + product page header.",
    productKey: "newBadge",
    defaultOn: false,
    risk: "safe",
  },
  {
    id: "social-proof-line",
    scope: "product",
    category: "social-proof",
    title: "Social-proof line",
    summary:
      "Renders a custom sentence above the variant picker, e.g. '73 people bought this in the last 24 h.'",
    mechanism:
      "Quantified, recent social proof. The more concrete the number, the higher the credibility (Aronson 2005, Cialdini).",
    whereItApplies: "Product page (above the variants).",
    productKey: "socialProofEnabled",
    siteKey: "socialProofGlobalEnabled",
    productFields: [
      {
        key: "socialProofText",
        label: "Sentence to show",
        placeholder: "73 people bought this in the last 24 h",
      },
    ],
    defaultOn: false,
    risk: "moderate",
  },
  {
    id: "trust-badge-line",
    scope: "product",
    category: "trust",
    title: "Custom trust line",
    summary:
      "One short trust statement specific to this product (e.g. 'Instant delivery in <60 s').",
    mechanism:
      "Specific trust statements outperform generic ones. They pre-empt the exact objection the buyer is likely to have.",
    whereItApplies: "Product page (just under the title).",
    productKey: "trustBadgeText", // shown when the text is non-empty
    productFields: [
      {
        key: "trustBadgeText",
        label: "Trust statement",
        placeholder: "Instant delivery — credentials in your inbox in 60 s",
      },
    ],
    defaultOn: false,
    risk: "safe",
  },
  {
    id: "highlight-savings",
    scope: "product",
    category: "conversion",
    title: "Highlight savings amount",
    summary:
      "Show 'Save $X' instead of just the percent next to the compare-at price. Requires a compare-at price.",
    mechanism:
      "Anchoring + concreteness: a dollar amount feels more tangible than a percent for small purchases. (Mental accounting, Thaler.)",
    whereItApplies: "Product card + product page price line.",
    productKey: "highlightSavings",
    defaultOn: false,
    risk: "safe",
  },
  {
    id: "bundle-with",
    scope: "product",
    category: "conversion",
    title: "Bundle with another product",
    summary:
      "Cross-sell: show 'Often bought with…' card pointing at one specific other product.",
    mechanism:
      "Pre-decision bundling lifts AOV without hurting conversion rate. Most effective when the partner product complements (not duplicates) the current one.",
    whereItApplies: "Product page (between description and add-to-cart).",
    productKey: "bundleProductId",
    siteKey: "bundlesEnabled",
    defaultOn: false,
    risk: "safe",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

export function leversByCategory(): Record<GrowthCategory, Lever[]> {
  const out = Object.fromEntries(
    Object.keys(CATEGORY_META).map((k) => [k, [] as Lever[]]),
  ) as Record<GrowthCategory, Lever[]>;
  for (const l of LEVERS) out[l.category].push(l);
  return out;
}

// Compute a 0-100 "attractiveness" score for the global site config — used as a
// gauge on /admin/growth to give the operator an at-a-glance sense of how much
// of the toolbox is in use. Pure deterministic function of the Setting row.
export function siteAttractivenessScore(s: Setting): {
  score: number;
  total: number;
  pct: number;
  enabled: number;
} {
  const siteLevers = LEVERS.filter((l) => l.scope === "site") as Extract<
    Lever,
    { scope: "site" }
  >[];
  const total = siteLevers.length;
  const enabled = siteLevers.filter((l) => Boolean(s[l.key])).length;
  return {
    score: enabled,
    total,
    enabled,
    pct: total ? Math.round((enabled / total) * 100) : 0,
  };
}

// Compute a 0-100 "completeness" score for a single product — used as a gauge
// in the product form to tell the operator how many of the per-product levers
// are configured. Doesn't penalise levers that don't make sense (e.g. negotiable
// for products with no variants — left for a future iteration).
//
// The input is intentionally relaxed (just the fields we read, allowing string
// datetimes from form inputs) so callers don't have to coerce.
export type ProductCompletenessInput = {
  tagline?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  basePrice?: number | null;
  compareAtPrice?: number | null;
  warrantyDays?: number | null;
  bestSellerBadge?: boolean | null;
  newBadge?: boolean | null;
  featured?: boolean | null;
  scarcityEnabled?: boolean | null;
  urgencyEndsAt?: string | Date | null;
  socialProofEnabled?: boolean | null;
  trustBadgeText?: string | null;
  bundleProductId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export function productCompletenessScore(
  p: ProductCompletenessInput,
): { score: number; total: number; pct: number; missing: string[] } {
  const checks: Array<{ ok: boolean; label: string }> = [
    { ok: Boolean(p.tagline), label: "Tagline" },
    { ok: Boolean(p.description && p.description.length > 30), label: "Description (≥30 chars)" },
    { ok: Boolean(p.thumbnail), label: "Thumbnail image" },
    { ok: Boolean(p.compareAtPrice && p.basePrice && p.compareAtPrice > p.basePrice), label: "Compare-at price (anchor)" },
    { ok: Boolean(p.warrantyDays && p.warrantyDays > 0), label: "Warranty days set" },
    { ok: Boolean(p.bestSellerBadge || p.newBadge || p.featured), label: "At least one badge" },
    { ok: Boolean(p.scarcityEnabled), label: "Scarcity copy" },
    { ok: Boolean(p.urgencyEndsAt), label: "Urgency deadline" },
    { ok: Boolean(p.socialProofEnabled), label: "Social-proof line" },
    { ok: Boolean(p.trustBadgeText), label: "Custom trust line" },
    { ok: Boolean(p.bundleProductId), label: "Bundle suggestion" },
    { ok: Boolean(p.seoTitle && p.seoDescription), label: "SEO title + meta" },
  ];
  const score = checks.filter((c) => c.ok).length;
  const total = checks.length;
  return {
    score,
    total,
    pct: Math.round((score / total) * 100),
    missing: checks.filter((c) => !c.ok).map((c) => c.label),
  };
}
