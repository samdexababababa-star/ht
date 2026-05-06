# Phase 7 — Platform polish & completeness

This phase adds substantial new functionality without disturbing the visual
identity Madjid validated. Every new feature ships behind a settings toggle so
it can be turned off at any time.

## Guiding principles

- **Non-destructive**: nothing existing is changed visually unless explicitly
  requested. The S logo, hero, header, footer, and admin layout are unchanged.
- **Toggle everything**: each new feature has a master switch in
  `/admin/settings` (or an "advanced" sub-page). Sensible defaults so the
  install just works, but nothing is forced.
- **Guided setup**: integrations get step-by-step wizards instead of raw forms.
- **Small commits**: one phase = one commit. Easy to follow / revert.

## Phase 7.1 — Foundation (Prisma + settings)

Extend the `Setting` model with new flags grouped by feature:

```prisma
// Warranty / claims
warrantyEnabled        Boolean @default(true)
warrantyDefaultDays    Int     @default(7)
claimsRequirePhoto     Boolean @default(true)
claimsAllowMessage     Boolean @default(true)
claimsMaxPhotos        Int     @default(4)
// Order grouping
orderGroupingEnabled   Boolean @default(true)
// Per-product feature defaults
allowQuantityByDefault Boolean @default(true)
negotiableEnabled      Boolean @default(false)
// Visual polish
depthEffectsEnabled    Boolean @default(true)
scrollRevealEnabled    Boolean @default(true)
// Telegram event toggles
tgNotifyOnNewOrder     Boolean @default(true)
tgNotifyOnPaid         Boolean @default(true)
tgNotifyOnClaim        Boolean @default(true)
tgNotifyOnError        Boolean @default(false)
tgOrderTemplate        String  @default(...)
tgClaimTemplate        String  @default(...)
```

Extend `Product` with per-product toggles:

```prisma
warrantyDays   Int?     // null = use settings.warrantyDefaultDays
allowQuantity  Boolean  @default(true)
negotiable     Boolean  @default(false)
minOfferPrice  Int?     // optional floor for offers
```

New `Claim` model:

```prisma
model Claim {
  id             String   @id @default(cuid())
  number         String   @unique
  orderId        String?
  order          Order?   @relation(fields: [orderId], references: [id])
  orderItemId    String?
  customerEmail  String
  customerName   String?
  customerPhone  String?
  reason         String   @default("")
  message        String   @default("")
  photos         String   @default("[]")  // JSON array of data URLs
  status         String   @default("open")  // open | reviewing | resolved | rejected
  adminNote      String   @default("")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  resolvedAt     DateTime?
}
```

New `Offer` model (negotiable products):

```prisma
model Offer {
  id            String   @id @default(cuid())
  number        String   @unique
  productId     String
  product       Product  @relation(...)
  variantId     String?
  customerEmail String
  customerName  String?
  customerPhone String?
  proposedPrice Int      // cents
  message       String   @default("")
  status        String   @default("open")  // open | accepted | rejected | expired
  adminNote     String   @default("")
  createdAt     DateTime @default(now())
}
```

## Phase 7.2 — Setup wizards

Three new admin pages:

- `/admin/setup/telegram` — 4 steps: create bot via BotFather → paste token →
  message bot once → press "Detect chat" → "Send test message" → done
- `/admin/setup/whatsapp` — 3 steps: pick number format → set redirect mode
  (before/after/both/off) → write/preview prefilled message → "Open test link"
- `/admin/setup/lemonsqueezy` — 5 steps: create LS account → create store →
  paste API key → paste store ID → set webhook secret → "Test connection"

Dashboard widget on `/admin` shows a checklist with green/red pills:
"Telegram ✓" "WhatsApp ✓" "LemonSqueezy ✗" — clicking jumps to the wizard.

## Phase 7.3 — Warranty / claims system

- Per-product `warrantyDays` field in admin product form
- Public `/warranty` page with two-step flow:
  1. Enter order number + email → server validates eligibility
  2. Show order items, choose item, write reason + optional message,
     upload photos (data URLs into `photos` JSON), submit
- Public `/warranty/success` page after submit with claim number
- Admin `/admin/claims` list (status filters)
- Admin `/admin/claims/[id]` detail with photos, status changer, admin note
- Telegram notification when new claim arrives (uses `tgNotifyOnClaim`)
- Master toggle `warrantyEnabled` hides `/warranty` link in footer when off

## Phase 7.4 — Order grouping

`/admin/orders` gets a top toggle: "Group by product".

When enabled:
- Server fetches orders grouped by product+variant
- Each row shows: product name, variant, total quantity sold, count of orders,
  expand button → list of individual orders below
- Clicking an order goes to `/admin/orders/[id]` as before

When disabled: existing list view (unchanged).

State persisted in URL `?group=1`.

## Phase 7.5 — Per-product toggles

Product admin form gains:
- Switch "Allow customers to choose quantity" (default = settings.allowQuantityByDefault)
- Switch "Negotiable price" (default = false)
- Number input "Minimum offer (cents)" — only shown when negotiable on
- Number input "Warranty (days)" with placeholder "(default: settings)"

Public side:
- `ProductDetail`: hide quantity selector when product.allowQuantity = false
- `ProductDetail`: when product.negotiable = true, replace "Buy now" with
  "Make an offer" → opens drawer/sheet with form (name, email, phone,
  proposed price, message)
- Submit creates an `Offer`, sends Telegram notification, redirects to
  `/offer/success?ref=…`

`/admin/offers` list + detail mirrors claims (with Accept / Reject /
Counter-offer buttons).

## Phase 7.6 — Visual depth & polish

All toggle-able under `depthEffectsEnabled` and `scrollRevealEnabled`.

- Soft elevation system: cards get a subtle `shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,71,255,0.08)]` and on hover lift to `0_2px_6px_rgba(0,0,0,0.08),0_24px_48px_-16px_rgba(0,71,255,0.16)` with a 1px translate-y
- Subtle gradient hairline borders on premium cards (using `border-image` or
  pseudo-element)
- Scroll-reveal: sections fade-up 12px on first viewport entry
  (`IntersectionObserver`, no library)
- Subtle parallax on the two hero S marks (slow translate-y on scroll)

All effects respect `prefers-reduced-motion` and the global toggles.

## Phase 7.7 — Telegram polish

`/admin/setup/telegram` gains a "Templates" tab:
- Per-event toggles: new order / paid / claim / offer / error
- Per-event template editor with variable picker:
  `{order}`, `{customer}`, `{total}`, `{items}`, `{claim}`, `{offer.price}`
- Live preview using fake data
- Test button sends rendered message to the configured chat

## Files touched (estimated)

- `prisma/schema.prisma` — extended models + new Claim/Offer models
- `prisma/migrations/<new>/migration.sql` — generated
- `lib/settings.ts` — no API change but typed against new fields
- `lib/telegram.ts` — extended with template rendering + per-event guards
- `lib/claims.ts` — new
- `lib/offers.ts` — new
- `app/admin/(authed)/setup/{telegram,whatsapp,lemonsqueezy}/page.tsx` — new
- `app/admin/(authed)/claims/{page,[id]/page}.tsx` — new
- `app/admin/(authed)/offers/{page,[id]/page}.tsx` — new
- `app/admin/(authed)/orders/page.tsx` — group toggle
- `app/admin/(authed)/products/[id]/page.tsx` + `new/page.tsx` — new fields
- `app/admin/(authed)/settings/page.tsx` — new toggles section
- `app/(site)/warranty/{page,success/page}.tsx` — new
- `app/(site)/offer/success/page.tsx` — new
- `app/api/admin/{claims,offers}/[...]` — new
- `app/api/{claims,offers}/route.ts` — public submit endpoints
- `components/admin/SetupChecklist.tsx` — dashboard widget
- `components/site/MakeOfferSheet.tsx` — client-side offer form
- `components/site/ScrollReveal.tsx` — IntersectionObserver wrapper
- `app/globals.css` — elevation utility class behind a setting

## Out of scope for this phase

- Customer accounts (still future)
- Multi-vendor marketplace (still flagged off)
- Payment provider beyond LemonSqueezy
- i18n (kept FR/EN bilingual where strings already are)
