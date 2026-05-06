import { Hero } from "@/components/site/Hero";
import { CategoryStrip } from "@/components/site/CategoryStrip";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionTitle } from "@/components/site/SectionTitle";
import { Reveal } from "@/components/site/Reveal";
import { Marquee } from "@/components/site/Marquee";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { ensureBootstrapAdmin } from "@/lib/auth";

export const revalidate = 30;

export default async function HomePage() {
  // First-run convenience: bootstrap admin so the operator can log in immediately.
  await ensureBootstrapAdmin().catch(() => null);

  const [s, featured, recent] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { visible: true, featured: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
    prisma.product.findMany({
      where: { visible: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <>
      <Hero
        title={s.heroTitle.replace(/\n/g, " ")}
        subtitle={s.heroSubtitle}
        ctaLabel={s.heroCtaLabel}
        ctaHref={s.heroCtaHref}
      />

      <Marquee
        items={[
          "Instant delivery",
          "Refund within 24h",
          "Real human support",
          "Powered by LemonSqueezy",
          "Built for Algeria & Africa",
          "Premium quality, every order",
        ]}
      />

      <CategoryStrip />

      <section id="featured" className="max-w-6xl mx-auto px-5 py-12">
        <Reveal>
          <SectionTitle
            eyebrow="Now live"
            title="Hand-picked"
            italicTail="this week"
          />
        </Reveal>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {(featured.length > 0 ? featured : recent).slice(0, 6).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <ProductCard p={p} />
            </Reveal>
          ))}
          {recent.length === 0 && featured.length === 0 ? (
            <EmptyState />
          ) : null}
        </div>
      </section>

      {/* Editorial split */}
      <section className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-10 items-end">
        <Reveal>
          <h3 className="text-4xl md:text-6xl leading-[1.05] tracking-tight">
            Everything <span className="serif-italic text-primary">digital</span>.
            <br />
            One simple checkout.
          </h3>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-lg text-muted max-w-md">
            Streaming, AI tools, gaming top-ups, social growth packs, and bespoke
            services. Pay once with card or wallet — we deliver, track and follow up
            personally on WhatsApp.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/catalog" className="btn btn-blue">Browse the catalog</Link>
            <Link href="/p/about" className="btn btn-outline">How it works</Link>
          </div>
        </Reveal>
      </section>

      {recent.length > 6 ? (
        <section className="max-w-6xl mx-auto px-5 py-12">
          <Reveal>
            <SectionTitle
              eyebrow="More"
              title="Fresh on"
              italicTail="Salma"
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recent.slice(0, 8).map((p, i) => (
              <Reveal key={p.id} delay={i * 0.04}>
                <ProductCard p={p} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <SocialProof brand={s.brandName} />
    </>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full card p-10 text-center">
      <p className="text-2xl tracking-tight">
        No products yet — <span className="serif-italic text-primary">add your first one</span>.
      </p>
      <p className="mt-2 text-sm text-muted">
        Sign in to <Link href="/admin" className="underline">/admin</Link> and create your first product.
      </p>
    </div>
  );
}

function SocialProof({ brand }: { brand: string }) {
  return (
    <section className="max-w-6xl mx-auto px-5 pt-8 pb-20">
      <div className="card p-8 md:p-12 bg-blue-glow">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-5xl tracking-tight">10k+</p>
            <p className="text-sm text-muted mt-1">Subscriptions delivered</p>
          </div>
          <div>
            <p className="text-5xl tracking-tight">24h</p>
            <p className="text-sm text-muted mt-1">Refund window if undelivered</p>
          </div>
          <div>
            <p className="text-5xl tracking-tight">4.9★</p>
            <p className="text-sm text-muted mt-1">Average customer rating</p>
          </div>
        </div>
        <p className="text-center mt-8 text-muted text-sm">
          Trusted by clients across Algeria, Africa &amp; worldwide. {brand} is built so
          you get exactly what you ordered — fast, clean, and personal.
        </p>
      </div>
    </section>
  );
}
