# Salma — Project Plan

> A premium digital subscription & services storefront, fully controllable
> from an admin panel. Built for Algeria & Africa first, but deliberately
> currency- and locale-agnostic so it can serve customers worldwide.

This document is the **single source of truth** for the project. If another
agent (Claude / GPT / a human collaborator) takes over, they should read
this file plus `ARCHITECTURE.md` and `ROADMAP.md` and they will be able to
continue exactly where the previous one stopped.

---

## 1. Brand

| Field        | Value |
| ------------ | ----- |
| Working name | **Salma** (سلمى — Arabic for "peaceful / serene"). Five letters, soft consonants, internationally pronounceable, with a quiet Maghreb resonance that grounds the brand in Algeria without being exclusive to it. |
| Logo mark    | A refined 8-petal rosette / star — single SVG path, single colour. Reads as a star at glance and a soft Maghreb-style flower on closer look. SVG in `public/brand/`. |
| Primary color| `#0047FF` — electric editorial blue, matches the Chatly aesthetic. |
| Accent       | `#000000` for type, `#FFFFFF` for surfaces. |
| Typography   | **Display** — `Instrument Serif` (italic) for editorial moments. **UI** — `Geist` for product UI. |
| Voice        | Editorial magazine. Confident, short sentences. Keep marketing copy minimal — let the product breathe. |

> The brand name is **just a default**. The admin can change `brandName`,
> `logoUrl`, `primaryColor`, etc. from `/admin/settings`. Every page reads
> from the `Setting` model so a rebrand requires no code change.

---

## 2. What the product does

Salma sells **digital products** in any of these flavours:

1. **Subscriptions** — Netflix, Spotify, IPTV, AI tools, etc. Variants =
   durations (1m / 3m / 6m / 12m).
2. **Services** — design, dev, growth (one-off invoices).
3. **Digital goods** — downloads, accounts, licence keys.
4. **Followers / engagement** — Instagram / TikTok packs.

Categories and products are **fully dynamic** — the admin creates them, no
code change needed.

### Selling channels
- Browser checkout (paid via LemonSqueezy).
- WhatsApp redirect (configurable: before / after / both / off the payment).
- Telegram bot notifications (every order pinged to the admin's chat).
- Manual "payment links" — admin creates a link for an off-platform deal,
  customer pays through LemonSqueezy.

### Hidden / future features (scaffolded, off by default)
- Multi-vendor marketplace (`Vendor` model already exists; flagged off via
  `Setting.marketplaceEnabled`).
- Customer accounts (DB ready, UI later).

---

## 3. Tech stack

| Layer | Choice | Why |
| ----- | ------ | --- |
| Framework | **Next.js 16** (App Router) | Server components, file-based API routes, RSC streaming. |
| Language | TypeScript everywhere | Type safety. |
| Styling | Tailwind v4 + CSS variables | Match new Chatly-style design quickly. |
| UI primitives | Radix UI (Dialog, Dropdown, Tabs, Switch, Select, Toast) | Accessible. |
| Animations | Framer Motion | Page transitions, hover effects, the magazine-like reveals. |
| ORM | Prisma 7 (SQLite locally, swap to Postgres in prod) | Easy schema migrations. |
| Auth | `jose` JWT in httpOnly cookie + bcryptjs | No external dependency. |
| Validation | Zod | API & form schemas. |
| Forms | React Hook Form + Zod resolver | Best DX. |
| Payments | `@lemonsqueezy/lemonsqueezy.js` | One integration covers Africa + worldwide via cards/wallets. |
| Telegram | Direct REST calls to `api.telegram.org` | No bot framework needed. |
| Icons | `lucide-react` | Matches editorial minimal style. |

---

## 4. Information architecture

### Public site
```
/                              — Home (hero, featured, categories, social proof)
/catalog                       — All products grid + filters
/category/[slug]               — Per-category page
/product/[slug]                — Product detail with variants & psychology blocks
/cart                          — Cart review
/checkout                      — Checkout (email, name, optional WhatsApp)
/checkout/success?order=...    — Thank you
/p/[slug]                      — Dynamic admin-created landing pages
                                 (limited offers, fake-scarcity pages, etc.)
```

### Admin
```
/admin/login                   — Login form (cookie session)
/admin                         — Dashboard (orders / revenue / quick actions)
/admin/products                — List + create/edit/delete
/admin/categories              — Tree of categories
/admin/orders                  — Orders list + detail
/admin/promotions              — Discount codes & banners
/admin/pages                   — Custom landing pages (block editor)
/admin/payment-link            — One-off payment link generator
/admin/settings                — All site settings (brand, payments, telegram,
                                 whatsapp, marketplace flag, etc.)
```

### API
```
POST /api/auth/login           — admin login
POST /api/auth/logout
GET/POST /api/admin/products
PATCH/DELETE /api/admin/products/[id]
…same for categories, orders, promotions, pages
POST /api/admin/payment-link   — create a LS checkout for a custom amount
POST /api/admin/telegram/test  — verify token + getMe
POST /api/admin/telegram/detect — auto-detect chat id from getUpdates
PATCH /api/admin/settings
POST /api/checkout             — create LS checkout from cart
POST /api/cart                 — add/remove/update cart items
POST /api/webhooks/lemonsqueezy — payment success → mark order paid + ping TG
POST /api/webhooks/telegram    — (future) inbound bot commands
```

---

## 5. Conversion psychology (handled tastefully, never spammy)

The reference (Chatly) succeeds with **zero pop-ups**. We respect that. The
techniques used in Salma:

1. **Social proof in the hero**, single line: "Trusted by 11.6k+ customers".
2. **Editorial scarcity** — products can carry a tiny ribbon
   ("Only 4 left at this price") that fades in only when truly low stock.
3. **Subtle countdowns** on `urgencyEndsAt` — small, not flashing.
4. **Anchoring** via `compareAtPrice` showing a strikethrough — the eye
   reads "save N%".
5. **Bundling** through variants — "12 months saves 40%".
6. **Trust badges** in the footer (instant delivery, refund, support).
7. **Friction-free checkout** — email is the only required field; phone &
   whatsapp are optional.
8. **Post-payment WhatsApp redirect** (default mode = "after") so the
   customer feels guided personally instead of left alone after paying.

No pop-ups, no exit-intent modals, no chat-bubble harassment.

---

## 6. Internationalisation

- `Setting.defaultLocale` — `fr` by default (Algeria).
- `Setting.defaultCurrency` — `USD` by default (LemonSqueezy supports many
  currencies; admin can switch).
- All copy on the public site that ships in the codebase is short and easy
  to localise. The admin can override hero / tagline / brand strings from
  `/admin/settings` without touching code.

---

## 7. Conventions for future contributors

- **Never hard-code prices, brand strings, or copy that the admin should
  control.** Everything user-visible that could ever change goes into the
  `Setting` model or a Page block.
- **Money = integer cents.** Always. Use `formatPrice` in `lib/utils`.
- **Server actions or `app/api/...` route handlers**, never client-side
  mutation against the DB.
- **Server-only imports** (`prisma`, `lemonsqueezy`, etc.) must never be
  imported into a client component. Client components only consume props
  and call `/api/...` endpoints.
- **All admin endpoints call `requireAdmin()`** from `lib/auth`. Always.
