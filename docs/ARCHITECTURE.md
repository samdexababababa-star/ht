# Architecture

```
            ┌──────────────────────────────────────────────┐
            │             Public site (RSC)                │
            │  app/(site)/* — Hero, Catalog, Product, Cart │
            └────────────┬─────────────────────────────────┘
                         │ reads
                         ▼
            ┌──────────────────────────────────────────────┐
            │              lib/* domain layer              │
            │  db • auth • settings • cart • promotions    │
            │  lemonsqueezy • telegram • whatsapp • utils  │
            └────────────┬─────────────────────────────────┘
                         │
                         ▼
            ┌──────────────────────────────────────────────┐
            │           Prisma (SQLite / Postgres)         │
            └──────────────────────────────────────────────┘

   ┌────────────────────┐         ┌──────────────────────┐
   │  /admin (RSC + RHF)│ ───────▶│ /api/admin/* (route) │
   │  every page calls  │         │ requireAdmin()       │
   │  requireAdmin() in │         └──────────┬───────────┘
   │  the layout RSC.   │                    │
   └────────────────────┘                    ▼
                                  ┌──────────────────────┐
                                  │  Prisma + lib/*      │
                                  └──────────────────────┘

   ┌──────────────────────┐    ┌──────────────────────────┐
   │ LemonSqueezy webhook │ ─▶ │ /api/webhooks/lemonsqueezy│
   │  (order_created /    │    │  → mark Order paid       │
   │   subscription_…)    │    │  → tgNotifyOrder()       │
   └──────────────────────┘    └──────────────────────────┘
```

## Data flow — checkout

1. Customer adds to cart → cookie `soha_cart` with `[{productId, variantId, quantity}]`.
2. `/checkout` page reads cart cookie + Prisma, shows totals, optional
   promotion code, asks for email / name / WhatsApp.
3. POST `/api/checkout` →
   - creates an `Order` (status `pending`),
   - if `paymentsEnabled` & LS configured → creates a LemonSqueezy checkout
     and returns its URL,
   - otherwise → returns a "manual" success page,
   - calls `tgNotifyOrder()`.
4. `LemonSqueezy webhook` → flips order to `paid`, pings Telegram again.
5. Optionally: WhatsApp redirect on success (mode = `after`).

## Data flow — admin

1. `/admin/login` → POST `/api/auth/login` → set JWT cookie.
2. Every `/admin/*` server-rendered route calls `requireAdmin()` in its
   layout — unauthenticated visitors get redirected to `/admin/login`.
3. Every mutation goes through `/api/admin/*` route handlers which also
   call `requireAdmin()`.

## Auth

- httpOnly JWT cookie (`soha_admin`) signed with `AUTH_SECRET`.
- Bootstrap on first request: if no users exist, `ensureBootstrapAdmin`
  creates one with `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults
  `admin@soha.local` / `soha-admin`). The admin should change credentials
  immediately from `/admin/settings`.

## Where to add things

| Need to add… | File(s) |
| --- | --- |
| A new model | `prisma/schema.prisma` → `pnpm dlx prisma migrate dev`. |
| A new admin page | `app/admin/(authed)/<thing>/page.tsx` + `app/api/admin/<thing>/route.ts`. |
| A new public page | `app/(site)/<route>/page.tsx`. |
| A new setting | Add column to `Setting` in schema; migrate; expose in `/admin/settings`. |
| A new homepage section | `components/site/<section>.tsx`; mount in `app/(site)/page.tsx`. |
| A new payment provider | New file in `lib/<provider>.ts` mirroring `lemonsqueezy.ts`; pick provider in `Setting`. |

## Performance

- Public pages are server-rendered and cached aggressively (`revalidate`
  per route).
- Product images served from whatever URL the admin provides (Cloudinary,
  S3, Imgur, etc.) — no upload UI yet (planned in roadmap).
- Framer Motion is used sparingly; large reveals only happen once on
  first viewport entry.

## Security

- All admin routes require `requireAdmin()`.
- LemonSqueezy webhook must be verified with `lsWebhookSecret` HMAC.
- No secrets are ever sent to the client; all sensitive Setting fields are
  excluded by the public Setting selector.
- bcryptjs cost = 10.
