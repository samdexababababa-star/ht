# Soha — digital subscriptions, services & boosts

A clean, editorial e-commerce platform for selling digital subscriptions
(streaming, AI tools, gaming top-ups, social-growth packs, ad-hoc services)
with a fully admin-controlled storefront, LemonSqueezy payments, Telegram
order alerts and WhatsApp customer-care.

> "Soha" — سُهى — is the name of a faint star in the Big Dipper.
> 4 letters, neutral worldwide, with a subtle Arabic root for our Algerian roots.
> Re-brand from `/admin/settings` in one click.

## What's inside

- **Public storefront** — home, catalog, category, product detail, cart,
  checkout, success, dynamic `/p/[slug]` pages.
- **Admin panel** at `/admin` — auth, dashboard, products & variants, categories,
  orders, promotions, dynamic pages, settings, payment-link generator, Telegram
  auto-config (BotFather → auto-detect chat).
- **Integrations** — LemonSqueezy (cards), Telegram bot (notifications),
  WhatsApp (deep links before/after payment).
- **Hidden marketplace skeleton** — DB models for `Vendor`s exist, gated by
  `marketplaceEnabled` setting. UI to come in Phase 3.

See [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) for the full plan, and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the data flow.
[`docs/ROADMAP.md`](docs/ROADMAP.md) tracks phases.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** + **Tailwind v4** + **Framer Motion**
- **Prisma 7** with **better-sqlite3** adapter (swap to Postgres or libSQL by changing the schema)
- **jose** for JWT cookie auth, **bcryptjs** for password hashing
- **LemonSqueezy SDK** for hosted checkouts

## Getting started

```bash
pnpm install
pnpm dlx prisma generate
pnpm dlx prisma db push
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site and
[http://localhost:3000/admin](http://localhost:3000/admin) for the panel.

The first time you load any page, a default admin is bootstrapped:

- email: `admin@soha.local`
- password: `soha-admin`

Change them immediately from `/admin/settings` (we'll surface a UI for changing
the password in Phase 2 — for now you can update the user row directly).

## Configure (no-code)

Everything below is configured from `/admin/settings`:

| Section | Fields |
|---|---|
| Brand | name, tagline, logo URL, favicon URL, primary/accent colors, support email, announcement bar |
| Homepage | hero title/subtitle, CTA label/link |
| Currency & locale | ISO 4217 currency, BCP-47 locale |
| Payments — LemonSqueezy | API key, store ID, webhook signing secret, on/off toggle |
| Telegram bot | bot token, auto-detect chat ID, on/off toggle |
| WhatsApp | number, redirect mode (off/before/after/both), prefilled message template with `{product} {variant} {order} {total} {currency}` tokens |
| Marketplace (future) | enable + open vendor signups |

## Webhook URLs

After you deploy, set these in the third-party dashboards:

- LemonSqueezy: `POST https://YOUR-DOMAIN/api/webhooks/lemonsqueezy`
- Telegram: optional — we use polling-based auto-detect from the admin UI

## Conventions

- Prices are stored in **integer cents** (e.g. `499` = $4.99).
- All publicly-visible strings come from the `Setting` model — never hard-code
  the brand name in components.
- Products can have many `Variant`s (durations / tiers). The first variant is
  shown selected by default.
- Pages stored in `Page.content` are JSON arrays of blocks; the renderer is in
  `app/(site)/p/[slug]/page.tsx`.

## Going to production

1. Replace SQLite with Postgres or libSQL in `prisma/schema.prisma` and
   `prisma.config.ts`. Re-run `prisma db push`.
2. Set `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` env vars.
3. Deploy to Vercel / Fly / Railway.
4. Open `/admin/settings`, paste your LemonSqueezy keys, your Telegram bot
   token (then click "Auto-detect chat"), and your WhatsApp number.
