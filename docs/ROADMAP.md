# Roadmap & status

This file tracks **what's done** and **what's left**, so any agent (or
human) picking this project up next can resume immediately.

Use this convention:
- `[x]` shipped
- `[~]` partially shipped (notes inline)
- `[ ]` not yet

---

## Phase 1 — MVP (current PR)

### Foundations
- [x] Next.js 16 App Router + TypeScript + Tailwind v4
- [x] Prisma 7 schema (Users, Categories, Products, Variants, Orders,
      OrderItems, Promotions, Pages, Settings, Vendors, AuditLog)
- [x] SQLite local db; switching to Postgres = 1 line in
      `prisma/schema.prisma` + `DATABASE_URL`
- [x] JWT cookie auth + bcrypt + bootstrap admin

### Domain layer (`lib/`)
- [x] `db.ts`, `utils.ts`, `auth.ts`, `settings.ts`, `cart.ts`,
      `promotions.ts`, `lemonsqueezy.ts`, `telegram.ts`, `whatsapp.ts`

### Public site
- [x] Layout with brand-controlled header / footer + announcement bar
- [x] Home page (hero, featured products, category strip, social proof, FAQ-lite, CTA)
- [x] Catalog page with category filters
- [x] Category landing page
- [x] Product detail page (variants, scarcity / urgency, gallery, FAQ)
- [x] Cart page
- [x] Checkout page (manual + LemonSqueezy)
- [x] Checkout success page with WhatsApp redirect logic
- [x] Dynamic `/p/[slug]` page driven by `Page` model
- [x] Subtle scroll-triggered animations (Framer Motion)

### Admin
- [x] Login + bootstrap admin
- [x] Dashboard (KPIs)
- [x] Products CRUD (with variants, gallery, scarcity)
- [x] Categories CRUD
- [x] Orders list + detail (status changes)
- [x] Promotions CRUD
- [x] Pages CRUD (custom landing pages)
- [x] Payment-link generator
- [x] Settings page (brand, payments, telegram, whatsapp, marketplace flag…)
- [x] Telegram auto-detect chat flow

### Integrations
- [x] LemonSqueezy checkout creation
- [x] LemonSqueezy webhook handler
- [x] Telegram order notifications
- [x] WhatsApp redirect (configurable: before / after / both / off)

---

## Phase 2 — Polish (next PR)

- [ ] Image upload (S3 / Cloudinary) instead of pasting URLs
- [ ] Per-locale copy override in `Setting` (FR / EN / AR)
- [ ] Subscription renewal reminders via Telegram
- [ ] Customer accounts + order history
- [ ] Email receipts (Resend / Postmark)
- [ ] Better admin dashboard charts
- [ ] Better product gallery with zoom
- [ ] PWA manifest + offline-friendly homepage
- [ ] Sitemap + robots + structured data

---

## Phase 3 — Marketplace (hidden, scaffolded only in Phase 1)

- [ ] Vendor signup flow when `Setting.vendorSignupOpen = true`
- [ ] Vendor dashboard at `/vendor`
- [ ] Vendor product management (subset of admin UI)
- [ ] Commission split + payouts
- [ ] Public vendor profile pages at `/store/[slug]`
- [ ] Vendor moderation queue in admin

The DB already has `Vendor` and `Product.vendorId`. To enable: flip
`Setting.marketplaceEnabled` to true and start building the UI.

---

## Phase 4 — Optional growth features

- [ ] Affiliate / referral codes (extend `Promotion` with `partnerId`)
- [ ] Bundle products (1 click, multiple variants)
- [ ] Gift cards
- [ ] In-app reviews
- [ ] Loyalty points
- [ ] Telegram inbound — customers can place orders via bot

---

## Open questions for the operator (Madjid)

- Final brand name: keep **Salma**, or pick another? (admin-configurable)
- Production database: Postgres on Neon / Supabase / Railway?
- Image hosting: Cloudinary / S3 / direct URLs?
- LemonSqueezy live keys: when to plug in?
- Domain & deployment target: Vercel?
